"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({ code });

      if (result.error) {
        toast.error("コードが正しくありません。再度お試しください。");
        setCode("");
        return;
      }

      router.push("/dashboard");
    } catch {
      toast.error("認証に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackupCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.twoFactor.verifyBackupCode({ code });

      if (result.error) {
        toast.error("バックアップコードが正しくありません");
        setCode("");
        return;
      }

      toast.warning("バックアップコードを使用しました。2FAを再設定することをお勧めします。");
      router.push("/dashboard");
    } catch {
      toast.error("認証に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-2xl font-bold">2段階認証</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {useBackup
              ? "バックアップコードを入力してください"
              : "認証アプリの6桁のコードを入力してください"}
          </p>
        </div>

        <form onSubmit={useBackup ? handleBackupCode : handleSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            placeholder={useBackup ? "xxxxxxxx" : "000000"}
            maxLength={useBackup ? 8 : 6}
            required
            className="text-center text-lg tracking-widest"
            autoComplete="one-time-code"
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "確認中..." : "確認"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => { setUseBackup(!useBackup); setCode(""); }}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          {useBackup
            ? "← 認証アプリのコードを使う"
            : "バックアップコードを使う →"}
        </button>
      </div>
    </div>
  );
}
