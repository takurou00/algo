"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Loader2, Shield, ShieldAlert, LogIn, LogOut, Key } from "lucide-react";

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  "auth.login.success": { label: "ログイン成功", icon: LogIn, color: "text-green-600" },
  "auth.login.failed": { label: "ログイン失敗", icon: ShieldAlert, color: "text-red-600" },
  "auth.logout": { label: "ログアウト", icon: LogOut, color: "text-muted-foreground" },
  "auth.register": { label: "アカウント作成", icon: Shield, color: "text-blue-600" },
  "auth.2fa.enabled": { label: "2FA 有効化", icon: Shield, color: "text-green-600" },
  "auth.2fa.disabled": { label: "2FA 無効化", icon: ShieldAlert, color: "text-orange-600" },
  "auth.2fa.verified": { label: "2FA 認証成功", icon: Shield, color: "text-green-600" },
  "auth.2fa.failed": { label: "2FA 認証失敗", icon: ShieldAlert, color: "text-red-600" },
  "auth.password_reset_requested": { label: "パスワードリセット要求", icon: Key, color: "text-orange-600" },
  "auth.password_changed": { label: "パスワード変更", icon: Key, color: "text-blue-600" },
  "auth.session.revoked": { label: "セッション無効化", icon: LogOut, color: "text-muted-foreground" },
};

export function AuditLogList() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => api.get("/api/audit").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">読み込み中...</span>
      </div>
    );
  }

  const logs: {
    id: string;
    action: string;
    ipAddress: string | null;
    createdAt: string;
  }[] = data?.logs ?? [];

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">ログが見つかりません</p>;
  }

  return (
    <div className="space-y-1">
      {logs.map((log) => {
        const config = ACTION_CONFIG[log.action] ?? {
          label: log.action,
          icon: Shield,
          color: "text-muted-foreground",
        };
        const Icon = config.icon;
        return (
          <div
            key={log.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50"
          >
            <Icon className={`h-4 w-4 flex-shrink-0 ${config.color}`} />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">{config.label}</span>
              {log.ipAddress && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {log.ipAddress}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(log.createdAt), {
                addSuffix: true,
                locale: ja,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
