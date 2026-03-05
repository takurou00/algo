import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";

export type AuditAction =
  | "auth.login.success"
  | "auth.login.failed"
  | "auth.logout"
  | "auth.register"
  | "auth.password_reset_requested"
  | "auth.password_changed"
  | "auth.email_verified"
  | "auth.2fa.enabled"
  | "auth.2fa.disabled"
  | "auth.2fa.verified"
  | "auth.2fa.failed"
  | "auth.session.revoked"
  | "file.uploaded"
  | "file.deleted"
  | "file.downloaded";

export async function logAudit({
  userId,
  action,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: userId ?? null,
      action,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      metadata: metadata ?? null,
    });
  } catch (err) {
    // Audit logging must never crash the app
    console.error("[Audit] Failed to write audit log:", err);
  }
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
