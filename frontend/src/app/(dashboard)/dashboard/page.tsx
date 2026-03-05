import { FileGrid } from "@/components/files/file-grid";
import { UploadDropzone } from "@/components/files/upload-dropzone";
import { StorageStats } from "@/components/dashboard/storage-stats";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          ファイルを管理・整理しましょう
        </p>
      </div>
      <StorageStats />
      <UploadDropzone />
      <FileGrid />
    </div>
  );
}
