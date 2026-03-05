"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { filesApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

export function UploadDropzone() {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const queryClient = useQueryClient();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newUploads = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      }));
      setUploads((prev) => [...prev, ...newUploads]);

      newUploads.forEach((upload, idx) => {
        const formData = new FormData();
        formData.append("file", upload.file);

        const uploadIdx = uploads.length + idx;
        setUploads((prev) =>
          prev.map((u, i) =>
            i === uploadIdx ? { ...u, status: "uploading" } : u
          )
        );

        filesApi
          .upload(formData, (progress) => {
            setUploads((prev) =>
              prev.map((u, i) =>
                i === uploadIdx ? { ...u, progress } : u
              )
            );
          })
          .then(() => {
            setUploads((prev) =>
              prev.map((u, i) =>
                i === uploadIdx ? { ...u, status: "done", progress: 100 } : u
              )
            );
            queryClient.invalidateQueries({ queryKey: ["files"] });
            toast.success(`${upload.file.name} をアップロードしました`);
          })
          .catch(() => {
            setUploads((prev) =>
              prev.map((u, i) =>
                i === uploadIdx ? { ...u, status: "error" } : u
              )
            );
            toast.error(`${upload.file.name} のアップロードに失敗しました`);
          });
      });
    },
    [uploads.length, queryClient]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
      "application/pdf": [],
      "text/*": [],
    },
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors",
          isDragActive && "border-primary bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          {isDragActive
            ? "ここにドロップ..."
            : "ファイルをドラッグ&ドロップ、またはクリックして選択"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          画像・動画・PDF・テキスト (最大 5GB)
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">
                  {upload.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(upload.file.size)}
                </p>
                {upload.status === "uploading" && (
                  <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  upload.status === "done" && "text-green-600",
                  upload.status === "error" && "text-destructive",
                  upload.status === "uploading" && "text-primary"
                )}
              >
                {upload.status === "done" && "完了"}
                {upload.status === "error" && "エラー"}
                {upload.status === "uploading" && `${upload.progress}%`}
                {upload.status === "pending" && "待機中"}
              </span>
              {upload.status !== "uploading" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    setUploads((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
