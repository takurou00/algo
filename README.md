# MediaVault

画像・動画・ドキュメントを管理するWebファイル管理システム。
Azure上でコンテナとして動作し、スケーラブルな構成。

## 特徴

- ドラッグ&ドロップによるファイルアップロード (最大5GB)
- 画像・動画・ドキュメントの一元管理
- 画像の自動サムネイル生成 (WebP)
- フォルダによる整理
- Azure Blob Storageによる安全なファイル保管
- レスポンシブUI

## クイックスタート

```bash
git clone <repo-url>
cd mediavault
cp .env.example .env  # 環境変数を設定
docker-compose up
```

ブラウザで http://localhost:3000 を開く。

## ドキュメント

- [開発ガイド](CLAUDE.md)
- [ブランチ戦略・Secrets設定](.github/branch-protection.md)
- [Terraform設定](terraform/environments/dev/terraform.tfvars.example)

## 技術スタック

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v4
- **Backend**: Hono.js, TypeScript, Drizzle ORM
- **DB**: PostgreSQL 16
- **Storage**: Azure Blob Storage
- **Deploy**: Azure Container Apps
- **IaC**: Terraform
