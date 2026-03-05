# MediaVault - CLAUDE.md

## プロジェクト概要

ファイル管理Webシステム。画像・動画・ドキュメントのアップロード、管理、共有が可能。
Azureで運用するコンテナベースのアプリケーション。

## アーキテクチャ

```
mediavault/
├── frontend/          # Next.js 15 (App Router, TypeScript, Tailwind CSS v4)
├── backend/           # Hono.js (TypeScript, Node.js 22)
├── terraform/         # Azure IaC (Container Apps, Blob Storage, PostgreSQL)
├── .github/workflows/ # GitHub Actions CI/CD
└── .devcontainer/     # VS Code Dev Container
```

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query v5 |
| Backend | Hono.js, TypeScript, Node.js 22 |
| ORM | Drizzle ORM |
| DB | PostgreSQL 16 (Azure Flexible Server) |
| Storage | Azure Blob Storage |
| Auth | Better Auth |
| Deploy | Azure Container Apps |
| IaC | Terraform (AzureRM ~4.0) |
| CI/CD | GitHub Actions |

## 開発環境のセットアップ

```bash
# 1. リポジトリをクローン後、Dev Containerを開く
# VS Code: "Reopen in Container" を選択

# または手動セットアップ:
cp .env.example .env
# .envを編集してAzureの値を設定

# 開発サーバー起動
docker-compose up

# フロントエンドのみ
cd frontend && npm run dev

# バックエンドのみ
cd backend && npm run dev
```

## コマンド一覧

### Frontend (`frontend/`)

```bash
npm run dev          # 開発サーバー (Turbopack)
npm run build        # プロダクションビルド
npm run lint         # ESLint
npm run type-check   # TypeScript型チェック
npm run format       # Prettier整形
```

### Backend (`backend/`)

```bash
npm run dev          # 開発サーバー (tsx watch)
npm run build        # TypeScriptコンパイル
npm run test         # Vitestテスト実行
npm run db:generate  # Drizzle マイグレーション生成
npm run db:migrate   # DBマイグレーション実行
npm run db:studio    # Drizzle Studio (DB GUI)
```

### Terraform (`terraform/environments/dev/` or `prod/`)

```bash
terraform init       # 初期化
terraform plan       # 変更プレビュー
terraform apply      # インフラ適用
terraform destroy    # インフラ削除
```

## ブランチ戦略

```
main        本番環境デプロイ (保護済み、2承認必須)
develop     開発統合 (保護済み、1承認必須)
feature/*   機能開発 → develop へPR
hotfix/*    緊急修正 → main & develop へPR
release/*   リリース準備
```

## CI/CD フロー

1. **feature → develop**: CI実行 (lint, type-check, test, build)
2. **develop push**: CI + CD dev (Azuredev環境へ自動デプロイ)
3. **develop → main**: CI + コードレビュー(2名承認) + 手動承認
4. **main push**: CI + CD prod (productionへデプロイ、GitHub Release作成)

## Azure アーキテクチャ

```
Azure Container Apps Environment
├── Frontend App (Next.js)  → HTTPS public
└── Backend App (Hono)      → HTTPS public

Azure Blob Storage           ファイル格納 (SAS URL経由でアクセス)
Azure PostgreSQL Flexible    DB
Azure Container Registry     Dockerイメージ
Azure Log Analytics          ログ集約
```

## 環境変数

`.env.example` を参照。本番の秘密情報はGitHub Secretsで管理。

### GitHub Secrets (必須設定)

`.github/branch-protection.md` を参照。

## ファイルアップロード仕様

- 最大ファイルサイズ: 5GB
- 対応形式: 画像 (image/*), 動画 (video/*), PDF, テキスト
- 画像は自動的に400x400のWebPサムネイルを生成
- ファイルはAzure Blob StorageにSASトークン付きURLで配信 (有効期限1時間)

## コーディング規約

- TypeScript strict mode必須
- コンポーネント: React Server Components優先、必要時のみ `"use client"`
- API: Zod でリクエストバリデーション必須
- DB: Drizzle ORMを使用 (生SQL禁止)
- スタイル: Tailwind CSS v4 + shadcn/ui コンポーネント優先

## テスト方針

- バックエンド: Vitest でユニットテスト
- API routes: Honoのtestingヘルパーを使用
- フロントエンド: 現時点では省略、必要に応じて追加

## 認証・セキュリティ構成

### 認証フロー
1. 登録 → メール確認 (必須) → ログイン
2. ログイン時に2FA有効なら `/two-factor` へリダイレクト
3. パスワードリセットはメール経由

### パスワードポリシー
- 最小12文字
- 大文字・小文字・数字・記号を各1文字以上

### 実装済みセキュリティ機能
| 機能 | 実装 |
|------|------|
| 2FA (TOTP) | Better Auth twoFactor plugin |
| メール認証 | Better Auth + nodemailer |
| パスワード強度 | zxcvbn + カスタムポリシー |
| レートリミット | カスタムスライディングウィンドウ |
| 監査ログ | PostgreSQL audit_logs テーブル |
| CORS | strict origin-only |
| CSRF | Hono csrf middleware |
| セキュリティヘッダー | HSTS, X-Frame-Options, CSP, etc. |
| ルート保護 | Next.js middleware (cookie check) |
| CSP | next.config.ts headers |
| Cookie | SameSite=Strict, HttpOnly, Secure (prod) |

### レートリミット設定
| エンドポイント | 上限 | ウィンドウ |
|--------------|------|---------|
| `/api/auth/*` | 10回 | 15分 |
| `/api/files/upload` | 50回 | 1時間 |
| `/api/*` (全体) | 120回 | 1分 |
| Better Auth 組み込み | 10回 | 10分 |

### メール設定 (本番)
`.env` の `SMTP_*` 変数を設定。未設定の場合はコンソールにログ出力。
推奨: Azure Communication Services または SendGrid。

## セキュリティ注意事項

- 秘密情報は `.env` に記載し、絶対にコミットしない
- Azure Blob StorageへのアクセスはSASトークン経由のみ (公開URL禁止)
- Hono の `secureHeaders()` + `csrf()` ミドルウェアを適用済み
- 本番では `BETTER_AUTH_SECRET` に32文字以上のランダム文字列を使用
- 監査ログは `audit_logs` テーブルに自動記録される
