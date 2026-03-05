import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";
import { filesRouter } from "./routes/files.js";
import { foldersRouter } from "./routes/folders.js";
import { storageRouter } from "./routes/storage.js";
import { authRouter } from "./routes/auth.js";
import { auditRouter } from "./routes/audit.js";
import {
  apiRateLimit,
  authRateLimit,
  uploadRateLimit,
} from "./middleware/rate-limit.js";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export const app = new Hono();

// ── Logging ────────────────────────────────────────────────────────────
app.use("*", logger());

// ── CORS (strict: only allow configured frontend origin) ───────────────
app.use(
  "*",
  cors({
    origin: APP_URL,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    maxAge: 86400,
  })
);

// ── CSRF protection ────────────────────────────────────────────────────
app.use("/api/*", csrf({ origin: APP_URL }));

// ── Security headers ───────────────────────────────────────────────────
app.use(
  "*",
  secureHeaders({
    strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
    xContentTypeOptions: "nosniff",
    xFrameOptions: "DENY",
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  })
);

// ── Global API rate limit ──────────────────────────────────────────────
app.use("/api/*", apiRateLimit);

// ── Health check ──────────────────────────────────────────────────────
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ── Auth (strict rate limit) ───────────────────────────────────────────
app.use("/api/auth/*", authRateLimit);
app.route("/api/auth", authRouter);

// ── File upload (upload-specific rate limit) ───────────────────────────
app.use("/api/files/upload", uploadRateLimit);

// ── Protected API routes ───────────────────────────────────────────────
app.route("/api/files", filesRouter);
app.route("/api/folders", foldersRouter);
app.route("/api/storage", storageRouter);
app.route("/api/audit", auditRouter);

// ── 404 ───────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: "Not Found" }, 404));

// ── Error handler (no stack traces in production) ─────────────────────
app.onError((err, c) => {
  console.error("[Error]", err.message);
  const message =
    process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;
  return c.json({ error: message }, 500);
});

export type AppType = typeof app;
