import nodemailer from "nodemailer";

function createTransporter() {
  // Production: Use SMTP (SendGrid, Azure Communication Services, etc.)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });
  }

  // Development: Log to console (no actual sending)
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

const transporter = createTransporter();
const FROM = process.env.EMAIL_FROM ?? "MediaVault <noreply@mediavault.local>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const info = await transporter.sendMail({ from: FROM, to, subject, html });

  if (!process.env.SMTP_HOST) {
    // Dev: print to console instead of actually sending
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Preview: ${subject}`);
  }

  return info;
}

// Email templates
export function verificationEmailHtml(url: string, name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <h1 style="color:#1d4ed8">MediaVault</h1>
  <h2>メールアドレスの確認</h2>
  <p>${name} さん、MediaVaultへようこそ。</p>
  <p>以下のボタンをクリックしてメールアドレスを確認してください。</p>
  <p style="margin:24px 0">
    <a href="${url}" style="background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
      メールアドレスを確認する
    </a>
  </p>
  <p style="color:#6b7280;font-size:14px">このリンクは24時間有効です。心当たりがない場合は無視してください。</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
  <p style="color:#9ca3af;font-size:12px">MediaVault セキュリティチーム</p>
</body>
</html>`;
}

export function passwordResetEmailHtml(url: string, name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <h1 style="color:#1d4ed8">MediaVault</h1>
  <h2>パスワードのリセット</h2>
  <p>${name} さん、パスワードリセットのリクエストを受け付けました。</p>
  <p style="margin:24px 0">
    <a href="${url}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
      パスワードをリセットする
    </a>
  </p>
  <p style="color:#6b7280;font-size:14px">このリンクは1時間有効です。リクエストしていない場合は即座にパスワードを変更してください。</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
  <p style="color:#9ca3af;font-size:12px">MediaVault セキュリティチーム</p>
</body>
</html>`;
}
