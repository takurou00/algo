"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  function setField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "名前を入力してください";
    if (form.password !== form.confirm) return "パスワードが一致しません";
    if (form.password.length < 12) return "パスワードは12文字以上が必要です";
    if (!/[A-Z]/.test(form.password)) return "大文字を含めてください";
    if (!/[a-z]/.test(form.password)) return "小文字を含めてください";
    if (!/[0-9]/.test(form.password)) return "数字を含めてください";
    if (!/[^A-Za-z0-9]/.test(form.password)) return "記号を含めてください";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "登録に失敗しました");
        return;
      }

      toast.success("確認メールを送信しました。メールボックスをご確認ください。");
      router.push("/login?registered=1");
    } catch {
      toast.error("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">MediaVault</h1>
          <p className="mt-2 text-sm text-muted-foreground">新規アカウント作成</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">名前</label>
            <Input
              value={form.name}
              onChange={setField("name")}
              required
              className="mt-1"
              placeholder="田中 太郎"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">メールアドレス</label>
            <Input
              type="email"
              value={form.email}
              onChange={setField("email")}
              required
              className="mt-1"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">パスワード</label>
            <Input
              type="password"
              value={form.password}
              onChange={setField("password")}
              required
              className="mt-1"
              autoComplete="new-password"
            />
            <PasswordStrength password={form.password} />
          </div>

          <div>
            <label className="block text-sm font-medium">パスワード（確認）</label>
            <Input
              type="password"
              value={form.confirm}
              onChange={setField("confirm")}
              required
              className="mt-1"
              autoComplete="new-password"
            />
            {form.confirm && form.password !== form.confirm && (
              <p className="mt-1 text-xs text-destructive">パスワードが一致しません</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "作成中..." : "アカウント作成"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-primary hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
