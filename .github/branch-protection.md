# ブランチ保護設定ガイド

GitHubリポジトリ設定で以下のブランチ保護ルールを設定してください。

## `main` ブランチ

- [x] Require a pull request before merging
  - Required approvals: **2**
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners
- [x] Require status checks to pass before merging
  - Required: `CI / Frontend Lint & Type Check`
  - Required: `CI / Backend Lint & Type Check`
  - Required: `CI / Backend Tests`
  - Required: `CI / Frontend Build`
  - Required: `CI / Terraform Validate`
- [x] Require branches to be up to date before merging
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings
- [x] Restrict who can push to matching branches: Admins only

## `develop` ブランチ

- [x] Require a pull request before merging
  - Required approvals: **1**
- [x] Require status checks to pass before merging
  - Required: `CI / Frontend Lint & Type Check`
  - Required: `CI / Backend Lint & Type Check`
  - Required: `CI / Backend Tests`
- [x] Require branches to be up to date before merging

## ブランチ戦略 (GitFlow)

```
main        ← 本番環境 (タグ付きリリース)
  ↑
develop     ← 開発統合ブランチ
  ↑
feature/*   ← 機能開発 (例: feature/file-preview)
hotfix/*    ← 緊急修正 (mainから分岐)
release/*   ← リリース準備
```

## 必要なGitHub Secrets

### 全環境共通
| Secret | 説明 |
|--------|------|
| `AZURE_CLIENT_ID` | Azure Service Principal Client ID |
| `AZURE_CLIENT_SECRET` | Azure Service Principal Client Secret |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID |
| `AZURE_TENANT_ID` | Azure Tenant ID |
| `AZURE_CREDENTIALS` | Azure credentials JSON (az ad sp create-for-rbac) |
| `ACR_LOGIN_SERVER` | Azure Container Registry URL |
| `ACR_USERNAME` | ACR admin username |
| `ACR_PASSWORD` | ACR admin password |

### Dev環境
| Secret | 説明 |
|--------|------|
| `DB_PASSWORD` | Dev PostgreSQL password |
| `AUTH_SECRET` | Dev Better Auth secret |
| `DEV_DATABASE_URL` | Dev DB接続URL |

### Prod環境
| Secret | 説明 |
|--------|------|
| `PROD_DB_PASSWORD` | Prod PostgreSQL password |
| `PROD_AUTH_SECRET` | Prod Better Auth secret |
| `PROD_DATABASE_URL` | Prod DB接続URL |

## GitHub Environment設定

`production` environmentを作成し、以下を設定:
- Required reviewers: リリース承認者を追加
- Wait timer: 5分 (任意)
