import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import {
  sendEmail,
  verificationEmailHtml,
  passwordResetEmailHtml,
} from "./email.js";

// Password policy: min 12 chars, upper+lower+number+symbol
export const PASSWORD_POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
};

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_POLICY.minLength) {
    return `パスワードは${PASSWORD_POLICY.minLength}文字以上が必要です`;
  }
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    return "大文字を1文字以上含めてください";
  }
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    return "小文字を1文字以上含めてください";
  }
  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(password)) {
    return "数字を1文字以上含めてください";
  }
  if (PASSWORD_POLICY.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
    return "記号を1文字以上含めてください (!@#$% など)";
  }
  return null;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      twoFactor: schema.twoFactors,
    },
  }),

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:8000",
  trustedOrigins: [process.env.APP_URL ?? "http://localhost:3000"],

  // ── Email & Password ─────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,

    // Require email verification before first login
    requireEmailVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "【MediaVault】メールアドレスの確認",
        html: verificationEmailHtml(url, user.name),
      });
    },

    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "【MediaVault】パスワードのリセット",
        html: passwordResetEmailHtml(url, user.name),
      });
    },
  },

  // ── Session ──────────────────────────────────────────────────────────
  session: {
    expiresIn: 7 * 24 * 60 * 60,  // 7 days
    updateAge: 24 * 60 * 60,       // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,              // 5 min server-side cache
    },
  },

  // ── Rate limiting (built-in) ──────────────────────────────────────────
  rateLimit: {
    enabled: true,
    window: 10 * 60,   // 10 min window
    max: 10,           // max 10 auth attempts per window
    storage: "memory",
  },

  // ── Plugins ───────────────────────────────────────────────────────────
  plugins: [
    twoFactor({
      issuer: "MediaVault",
      otpOptions: {
        period: 30,
        digits: 6,
      },
      backupCodes: {
        amount: 10,
        length: 8,
      },
    }),
  ],

  // ── Cookie security ───────────────────────────────────────────────────
  advanced: {
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    },
  },
});
