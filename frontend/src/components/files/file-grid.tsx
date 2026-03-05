"use client";

import { useQuery } from "@tanstack/react-query";
import { filesApi } from "@/lib/api";
import { FileCard } from "./file-card";
import { Loader2 } from "lucide-react";

export function FileGrid() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["files"],
    queryFn: () => filesApi.list().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        ファイルの取得に失敗しました
      </p>
    );
  }

  if (!data?.files?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        ファイルがありません。上のエリアからアップロードしてください。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {data.files.map(
        (file: {
          id: string;
          name: string;
          mimeType: string;
          size: number;
          url: string;
          createdAt: string;
        }) => (
          <FileCard key={file.id} file={file} />
        )
      )}
    </div>
  );
}
