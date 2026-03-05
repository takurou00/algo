import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { filesRouter } from "./routes/files.js";
import { foldersRouter } from "./routes/folders.js";
import { storageRouter } from "./routes/storage.js";
import { authRouter } from "./routes/auth.js";

export const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.APP_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use("*", secureHeaders());

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Routes
app.route("/api/auth", authRouter);
app.route("/api/files", filesRouter);
app.route("/api/folders", foldersRouter);
app.route("/api/storage", storageRouter);

// 404
app.notFound((c) => c.json({ error: "Not Found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export type AppType = typeof app;
