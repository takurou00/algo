"use client";

import { useQuery } from "@tanstack/react-query";
import { storageApi } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import { HardDrive, Image, Video, FileText } from "lucide-react";

export function StorageStats() {
  const { data } = useQuery({
    queryKey: ["storage-stats"],
    queryFn: () => storageApi.getStats().then((r) => r.data),
  });

  const stats = [
    {
      label: "合計使用量",
      value: formatBytes(data?.totalSize ?? 0),
      icon: HardDrive,
      color: "text-blue-500",
    },
    {
      label: "画像",
      value: formatBytes(data?.imageSize ?? 0),
      icon: Image,
      color: "text-green-500",
    },
    {
      label: "動画",
      value: formatBytes(data?.videoSize ?? 0),
      icon: Video,
      color: "text-purple-500",
    },
    {
      label: "ドキュメント",
      value: formatBytes(data?.documentSize ?? 0),
      icon: FileText,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
