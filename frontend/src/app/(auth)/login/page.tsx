"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        const msg = result.error.message ?? "";
        if (msg.toLowerCase().includes("email not verified")) {
          toast.error("メールアドレスが未確認です。確認メールをご確認ください。");
        } else {
          // Generic message: don't reveal if email exists
          toast.error("メールアドレスまたはパスワードが正しくありません");
        }
        return;
      }

      // 2FA redirect is handled automatically by twoFactorClient plugin
      router.push(next);
    } catch {
      toast.error("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">MediaVault</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ファイル管理システムにログイン
          </p>
        </div>

        {registered && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            確認メールを送信しました。メールのリンクをクリックしてアカウントを有効化してください。
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                パスワード
              </label>
              <Link href="/reset-password" className="text-xs text-primary hover:underline">
                パスワードを忘れた方
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
