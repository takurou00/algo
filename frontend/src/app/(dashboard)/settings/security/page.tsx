import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { SessionList } from "@/components/auth/session-list";
import { AuditLogList } from "@/components/auth/audit-log-list";
import { Separator } from "@/components/ui/separator";

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">セキュリティ設定</h1>
        <p className="text-muted-foreground">
          アカウントのセキュリティを管理します
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">2段階認証 (2FA)</h2>
        <p className="text-sm text-muted-foreground">
          認証アプリ (Google Authenticator, Authy など) を使って2段階認証を有効にします。
        </p>
        <TwoFactorSetup />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">アクティブセッション</h2>
        <p className="text-sm text-muted-foreground">
          現在ログイン中のデバイスを管理します。不審なセッションは無効化してください。
        </p>
        <SessionList />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">セキュリティログ</h2>
        <p className="text-sm text-muted-foreground">
          最近のアカウントアクティビティを確認します。
        </p>
        <AuditLogList />
      </section>
    </div>
  );
}
