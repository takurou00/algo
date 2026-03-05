import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { desc, eq, and, gte } from "drizzle-orm";
import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";
import { requireAuth } from "../middleware/auth-middleware.js";
import type { User } from "../db/schema.js";

type Variables = { user: User };

export const auditRouter = new Hono<{ Variables: Variables }>();

auditRouter.use("*", requireAuth);

// List audit logs for current user
auditRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().min(1).max(100).default(50),
      days: z.coerce.number().min(1).max(90).default(30),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const { limit, days } = c.req.valid("query");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        ipAddress: auditLogs.ipAddress,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(and(eq(auditLogs.userId, user.id), gte(auditLogs.createdAt, since)))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return c.json({ logs });
  }
);
