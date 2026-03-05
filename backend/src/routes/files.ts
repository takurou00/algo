import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, like, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import mime from "mime-types";
import sharp from "sharp";
import { db } from "../db/index.js";
import { files } from "../db/schema.js";
import { requireAuth } from "../middleware/auth-middleware.js";
import { uploadBlob, deleteBlob, getBlobSasUrl } from "../lib/storage.js";
import { getFileType } from "../utils/file.js";
import type { User } from "../db/schema.js";

type Variables = {
  user: User;
};

export const filesRouter = new Hono<{ Variables: Variables }>();

filesRouter.use("*", requireAuth);

// List files
filesRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      folder: z.string().uuid().optional(),
      type: z.enum(["image", "video", "document", "other"]).optional(),
      search: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const { folder, type, search } = c.req.valid("query");

    const conditions = [eq(files.userId, user.id)];
    if (folder) conditions.push(eq(files.folderId, folder));
    if (search) conditions.push(like(files.originalName, `%${search}%`));

    let rows = await db
      .select()
      .from(files)
      .where(and(...conditions))
      .orderBy(desc(files.createdAt));

    if (type) {
      rows = rows.filter((f) => getFileType(f.mimeType) === type);
    }

    // Generate SAS URLs for display
    const filesWithUrls = await Promise.all(
      rows.map(async (file) => ({
        ...file,
        url: await getBlobSasUrl(file.storageKey, 60),
        thumbnailUrl: file.thumbnailKey
          ? await getBlobSasUrl(file.thumbnailKey, 60)
          : null,
      }))
    );

    return c.json({ files: filesWithUrls });
  }
);

// Upload file
filesRouter.post("/upload", async (c) => {
  const user = c.get("user");
  const body = await c.req.parseBody();
  const file = body["file"] as File;

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
  if (file.size > MAX_SIZE) {
    return c.json({ error: "File too large (max 5GB)" }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = mime.extension(file.type) || "bin";
  const storageKey = `${user.id}/${nanoid()}/${file.name}`;
  const fileType = getFileType(file.type);

  // Upload to Azure Blob Storage
  await uploadBlob(storageKey, buffer, file.type);

  // Generate thumbnail for images
  let thumbnailKey: string | null = null;
  if (fileType === "image") {
    try {
      const thumbnail = await sharp(buffer)
        .resize(400, 400, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      thumbnailKey = `${user.id}/thumbnails/${nanoid()}.webp`;
      await uploadBlob(thumbnailKey, thumbnail, "image/webp");
    } catch {
      // Thumbnail generation is non-critical
    }
  }

  const [newFile] = await db
    .insert(files)
    .values({
      name: file.name,
      originalName: file.name,
      mimeType: file.type || `application/octet-stream`,
      size: file.size,
      storageKey,
      thumbnailKey,
      userId: user.id,
    })
    .returning();

  return c.json({ file: newFile }, 201);
});

// Get download URL
filesRouter.get("/:id/download", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, id), eq(files.userId, user.id)));

  if (!file) return c.json({ error: "Not found" }, 404);

  const url = await getBlobSasUrl(file.storageKey, 5);
  return c.json({ url });
});

// Move file to folder
filesRouter.patch(
  "/:id/move",
  zValidator("json", z.object({ folderId: z.string().uuid().nullable() })),
  async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { folderId } = c.req.valid("json");

    const [updated] = await db
      .update(files)
      .set({ folderId, updatedAt: new Date() })
      .where(and(eq(files.id, id), eq(files.userId, user.id)))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json({ file: updated });
  }
);

// Delete file
filesRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, id), eq(files.userId, user.id)));

  if (!file) return c.json({ error: "Not found" }, 404);

  await deleteBlob(file.storageKey);
  if (file.thumbnailKey) await deleteBlob(file.thumbnailKey);

  await db.delete(files).where(eq(files.id, id));

  return c.json({ success: true });
});
