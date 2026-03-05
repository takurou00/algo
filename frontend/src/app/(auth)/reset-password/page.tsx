"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Step 1: Request reset email
  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authClient.forgetPassword({ email, redirectTo: "/reset-password" });
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  // Step 2: Set new password with token
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("パスワードが一致しません");
      return;
    }
    setLoading(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token: token! });
      if (result.error) {
        toast.error("パスワードのリセットに失敗しました。リンクが期限切れかもしれません。");
        return;
      }
      toast.success("パスワードを変更しました");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">新しいパスワードの設定</h1>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">新しいパスワード</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                autoComplete="new-password"
              />
              <PasswordStrength password={password} />
            </div>
            <div>
              <label className="block text-sm font-medium">確認</label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="mt-1"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "変更中..." : "パスワードを変更"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">パスワードのリセット</h1>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              入力されたメールアドレスにリセットリンクを送信しました。メールをご確認ください。
            </div>
            <Link href="/login" className="block text-center text-sm text-primary hover:underline">
              ← ログインに戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">メールアドレス</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "送信中..." : "リセットリンクを送信"}
            </Button>
            <Link href="/login" className="block text-center text-sm text-muted-foreground hover:underline">
              ← ログインに戻る
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
