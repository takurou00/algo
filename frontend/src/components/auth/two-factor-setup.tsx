"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Shield, ShieldCheck, ShieldOff, Copy } from "lucide-react";

export function TwoFactorSetup() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "backup">("idle");
  const [qrUri, setQrUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  const is2FAEnabled = (session?.user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ?? false;

  // Enable 2FA: get TOTP URI
  async function handleEnable() {
    try {
      const result = await authClient.twoFactor.enable({ password: "" });
      if (result.error) {
        toast.error("パスワードが必要です");
        return;
      }
      if (result.data?.totpURI) {
        setQrUri(result.data.totpURI);
        setStep("setup");
      }
    } catch {
      toast.error("2FA の設定に失敗しました");
    }
  }

  // Verify TOTP and activate
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await authClient.twoFactor.verifyTotp({ code: verifyCode });
      if (result.error) {
        toast.error("コードが正しくありません");
        setVerifyCode("");
        return;
      }
      // Fetch backup codes
      const bcResult = await authClient.twoFactor.getBackupCodes();
      if (bcResult.data?.backupCodes) {
        setBackupCodes(bcResult.data.backupCodes);
      }
      setStep("backup");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("2段階認証を有効にしました");
    } catch {
      toast.error("認証に失敗しました");
    }
  }

  // Disable 2FA
  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await authClient.twoFactor.disable({ password: disablePassword });
      if (result.error) {
        toast.error("パスワードが正しくありません");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("2段階認証を無効にしました");
      setDisablePassword("");
    } catch {
      toast.error("無効化に失敗しました");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("コピーしました");
  }

  // ── Backup codes display ───────────────────────────────────────────
  if (step === "backup") {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="font-semibold">バックアップコードを保存してください</h3>
        </div>
        <p className="text-sm text-yellow-700">
          認証アプリにアクセスできなくなった場合に使用します。各コードは1回のみ使用可能です。
          安全な場所に保管してください。
        </p>
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code) => (
            <code
              key={code}
              className="rounded bg-white px-3 py-1.5 text-sm font-mono text-center border border-yellow-200"
            >
              {code}
            </code>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(backupCodes.join("\n"))}
        >
          <Copy className="mr-2 h-3 w-3" />
          すべてコピー
        </Button>
        <Button className="w-full" onClick={() => setStep("idle")}>
          保存しました
        </Button>
      </div>
    );
  }

  // ── TOTP verification step ─────────────────────────────────────────
  if (step === "verify") {
    return (
      <div className="space-y-4 rounded-xl border border-border p-6">
        <h3 className="font-medium">ステップ 2: コードを確認</h3>
        <p className="text-sm text-muted-foreground">
          認証アプリに表示された6桁のコードを入力してください。
        </p>
        <form onSubmit={handleVerify} className="space-y-3">
          <Input
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest"
            autoComplete="one-time-code"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep("setup")}>
              戻る
            </Button>
            <Button type="submit" className="flex-1" disabled={verifyCode.length !== 6}>
              確認して有効化
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ── QR Code setup step ─────────────────────────────────────────────
  if (step === "setup") {
    return (
      <div className="space-y-4 rounded-xl border border-border p-6">
        <h3 className="font-medium">ステップ 1: QRコードをスキャン</h3>
        <p className="text-sm text-muted-foreground">
          Google Authenticator や Authy などの認証アプリでQRコードをスキャンしてください。
        </p>
        <div className="flex justify-center rounded-lg bg-white p-4">
          {qrUri && <QRCodeSVG value={qrUri} size={180} />}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setStep("idle")}>
            キャンセル
          </Button>
          <Button onClick={() => setStep("verify")}>
            スキャンしました →
          </Button>
        </div>
      </div>
    );
  }

  // ── Default idle state ─────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {is2FAEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">2段階認証は有効です</p>
              <p className="text-xs text-green-600">
                ログイン時に認証アプリのコードが必要になります
              </p>
            </div>
          </div>
          <form onSubmit={handleDisable} className="flex gap-2">
            <Input
              type="password"
              placeholder="パスワードを入力して無効化"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" variant="destructive">
              <ShieldOff className="mr-2 h-4 w-4" />
              無効化
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <Shield className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-orange-800">2段階認証は無効です</p>
              <p className="text-xs text-orange-600">
                アカウントのセキュリティ向上のため有効化することを強くお勧めします
              </p>
            </div>
          </div>
          <Button onClick={handleEnable}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            2段階認証を有効にする
          </Button>
        </div>
      )}
    </div>
  );
}
