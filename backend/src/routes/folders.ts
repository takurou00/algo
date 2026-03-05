import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { folders } from "../db/schema.js";
import { requireAuth } from "../middleware/auth-middleware.js";
import type { User } from "../db/schema.js";

type Variables = { user: User };

export const foldersRouter = new Hono<{ Variables: Variables }>();

foldersRouter.use("*", requireAuth);

// List folders
foldersRouter.get("/", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, user.id));
  return c.json({ folders: rows });
});

// Create folder
foldersRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(255),
      parentId: z.string().uuid().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const { name, parentId } = c.req.valid("json");

    const [folder] = await db
      .insert(folders)
      .values({ name, parentId, userId: user.id })
      .returning();

    return c.json({ folder }, 201);
  }
);

// Rename folder
foldersRouter.patch(
  "/:id",
  zValidator("json", z.object({ name: z.string().min(1).max(255) })),
  async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { name } = c.req.valid("json");

    const [updated] = await db
      .update(folders)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(folders.id, id), eq(folders.userId, user.id)))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json({ folder: updated });
  }
);

// Delete folder
foldersRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [folder] = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, user.id)));

  if (!folder) return c.json({ error: "Not found" }, 404);

  await db.delete(folders).where(eq(folders.id, id));
  return c.json({ success: true });
});
