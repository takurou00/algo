import { Hono } from "hono";
import { eq, sum } from "drizzle-orm";
import { db } from "../db/index.js";
import { files } from "../db/schema.js";
import { requireAuth } from "../middleware/auth-middleware.js";
import { getFileType } from "../utils/file.js";
import type { User } from "../db/schema.js";

type Variables = { user: User };

export const storageRouter = new Hono<{ Variables: Variables }>();

storageRouter.use("*", requireAuth);

storageRouter.get("/stats", async (c) => {
  const user = c.get("user");
  const userFiles = await db
    .select()
    .from(files)
    .where(eq(files.userId, user.id));

  const totalSize = userFiles.reduce((acc, f) => acc + f.size, 0);
  const imageSize = userFiles
    .filter((f) => getFileType(f.mimeType) === "image")
    .reduce((acc, f) => acc + f.size, 0);
  const videoSize = userFiles
    .filter((f) => getFileType(f.mimeType) === "video")
    .reduce((acc, f) => acc + f.size, 0);
  const documentSize = userFiles
    .filter((f) => getFileType(f.mimeType) === "document")
    .reduce((acc, f) => acc + f.size, 0);

  return c.json({
    totalSize,
    imageSize,
    videoSize,
    documentSize,
    fileCount: userFiles.length,
  });
});
