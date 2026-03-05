"use client";

import Image from "next/image";
import { formatBytes, getFileType } from "@/lib/utils";
import { FileText, Video, File, MoreVertical, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filesApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface FileCardProps {
  file: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
  };
}

export function FileCard({ file }: FileCardProps) {
  const fileType = getFileType(file.mimeType);
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleDownload() {
    const { data } = await filesApi.getDownloadUrl(file.id);
    window.open(data.url, "_blank");
  }

  async function handleDelete() {
    try {
      await filesApi.delete(file.id);
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success(`${file.name} を削除しました`);
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <div className="group relative rounded-xl border border-border bg-card p-3 hover:shadow-md transition-shadow">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
        {fileType === "image" ? (
          <Image
            src={file.url}
            alt={file.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {fileType === "video" && (
              <Video className="h-10 w-10 text-muted-foreground" />
            )}
            {fileType === "document" && (
              <FileText className="h-10 w-10 text-muted-foreground" />
            )}
            {fileType === "other" && (
              <File className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-border bg-card shadow-lg">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3" />
                  ダウンロード
                </button>
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                  削除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="truncate text-xs font-medium" title={file.name}>
        {file.name}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          {formatBytes(file.size)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(file.createdAt), {
            addSuffix: true,
            locale: ja,
          })}
        </span>
      </div>
    </div>
  );
}
