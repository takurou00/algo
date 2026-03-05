"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Image,
  Video,
  FileText,
  Settings,
  HardDrive,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { name: "すべてのファイル", href: "/files", icon: FolderOpen },
  { name: "画像", href: "/files?type=image", icon: Image },
  { name: "動画", href: "/files?type=video", icon: Video },
  { name: "ドキュメント", href: "/files?type=document", icon: FileText },
  { name: "ストレージ", href: "/storage", icon: HardDrive },
];

const settingsNavigation = [
  { name: "セキュリティ", href: "/settings/security", icon: ShieldCheck },
  { name: "設定", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-xl font-bold text-primary">MediaVault</span>
      </div>
      <nav className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="space-y-1 border-t border-border pt-4">
          {settingsNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
