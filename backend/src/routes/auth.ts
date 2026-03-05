import { Hono } from "hono";
import { auth } from "../lib/auth.js";
import { logAudit, getClientIp } from "../lib/audit.js";

export const authRouter = new Hono();

// Intercept key auth events for audit logging, then delegate to Better Auth
authRouter.all("/*", async (c) => {
  const path = c.req.path; // e.g. /sign-in/email
  const ip = getClientIp(c.req.raw.headers);
  const ua = c.req.header("user-agent") ?? undefined;

  const response = await auth.handler(c.req.raw);

  // Audit log based on path + response status
  const status = response.status;

  if (path.includes("sign-in") && !path.includes("2fa")) {
    await logAudit({
      action: status < 400 ? "auth.login.success" : "auth.login.failed",
      ipAddress: ip,
      userAgent: ua,
    });
  } else if (path.includes("sign-up")) {
    if (status < 400) {
      await logAudit({ action: "auth.register", ipAddress: ip, userAgent: ua });
    }
  } else if (path.includes("sign-out")) {
    if (status < 400) {
      await logAudit({ action: "auth.logout", ipAddress: ip, userAgent: ua });
    }
  } else if (path.includes("reset-password")) {
    if (status < 400) {
      await logAudit({
        action: "auth.password_reset_requested",
        ipAddress: ip,
        userAgent: ua,
      });
    }
  } else if (path.includes("two-factor/enable")) {
    if (status < 400) {
      await logAudit({ action: "auth.2fa.enabled", ipAddress: ip, userAgent: ua });
    }
  } else if (path.includes("two-factor/disable")) {
    if (status < 400) {
      await logAudit({ action: "auth.2fa.disabled", ipAddress: ip, userAgent: ua });
    }
  } else if (path.includes("two-factor/verify")) {
    await logAudit({
      action: status < 400 ? "auth.2fa.verified" : "auth.2fa.failed",
      ipAddress: ip,
      userAgent: ua,
    });
  }

  return response;
});
