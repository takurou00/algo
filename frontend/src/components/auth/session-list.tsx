"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Monitor, Smartphone, Loader2, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function SessionList() {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => authClient.listSessions(),
  });

  const revoke = useMutation({
    mutationFn: (sessionToken: string) =>
      authClient.revokeSession({ token: sessionToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("セッションを無効化しました");
    },
    onError: () => toast.error("セッションの無効化に失敗しました"),
  });

  async function revokeAll() {
    try {
      await authClient.revokeOtherSessions();
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("他のすべてのセッションを無効化しました");
    } catch {
      toast.error("セッションの無効化に失敗しました");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">読み込み中...</span>
      </div>
    );
  }

  const sessionList = sessions?.data ?? [];

  return (
    <div className="space-y-3">
      {sessionList.map((session) => {
        const isMobile = session.userAgent?.toLowerCase().includes("mobile");
        return (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div className="flex items-center gap-3">
              {isMobile ? (
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Monitor className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {session.userAgent?.split(" ").slice(0, 3).join(" ") ?? "不明なデバイス"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.ipAddress ?? "不明なIP"} ·{" "}
                  {formatDistanceToNow(new Date(session.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => revoke.mutate(session.token)}
              disabled={revoke.isPending}
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        );
      })}

      {sessionList.length > 1 && (
        <Button variant="outline" size="sm" onClick={revokeAll} className="w-full">
          他のすべてのセッションをログアウト
        </Button>
      )}

      {sessionList.length === 0 && (
        <p className="text-sm text-muted-foreground">
          アクティブなセッションはありません
        </p>
      )}
    </div>
  );
}
