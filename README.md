# manapuraza blog

Markdownベースの技術ブログシステム。質問ベースの認証機能、SEO最適化、CI/CD自動化を備えた Next.js 16 製のモダンなブログプラットフォーム。

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## ✨ 主な機能

### 📝 Markdown記事システム
- **シンプルな記事管理**: `posts/` ディレクトリに `.md` ファイルを配置するだけ
- **フロントマター対応**: YAML形式のメタデータ（タイトル、日付、カテゴリ等）
- **カテゴリ分類**: 複数カテゴリの設定が可能
- **動的生成**: ビルド時に全記事を自動的にページ生成

### 🔐 質問ベース認証
- **柔軟な認証システム**: 記事ごとに質問形式の閲覧制限を設定可能
- **3種類の質問タイプ**:
  - テキスト入力
  - 選択式（ラジオボタン）
  - パスワード（マスク表示）
- **セキュアな実装**: AES-256-GCM暗号化による正解の保護
- **Cookie認証**: 正解後、暗号化Cookieで認証状態を保持

### 🚀 SEO最適化
- **完全なメタデータ設定**: OGP, Twitter Card, robots指示
- **動的sitemap.xml生成**: 全ページを自動的にインデックス
- **robots.txt制御**: クローラーの適切な制御
- **OGP画像自動生成**: Next.js ImageResponse APIによる動的画像
- **JSON-LD構造化データ**: WebSite, BlogPosting, BreadcrumbList対応

### ⚙️ CI/CD自動化
- **Feature Branch CI**: Lint → Build → 自動PR作成
- **Main Branch CI**: Build → Lighthouse CI（Performance 90%以上必須）
- **GitHub Actions統合**: プッシュするだけで品質チェック
- **自動デプロイ**: Vercelへの自動デプロイ

## 🚀 クイックスタート

### 前提条件

- Node.js 20.x 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/ManatoYamashita/crypto-blogs.git
cd crypto-blogs

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env.local

# 暗号化キーの生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# .env.local に ENCRYPTION_KEY を設定

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

### 記事の追加

1. `posts/` ディレクトリに `.md` ファイルを作成
2. フロントマターを記述
3. Markdown形式で本文を記述

```markdown
---
title: "はじめての記事"
date: "2025-11-28"
categories: ["技術", "Next.js"]
requiresAuth: false
---

# はじめての記事

これは私の最初の記事です。
```

詳細は [ブログ記事追加ガイド](docs/guides/blog-posting.md) を参照してください。

## 📚 ドキュメント

### ガイド（docs/guides/）

| ドキュメント | 説明 |
|:---|:---|
| [セットアップガイド](docs/guides/setup.md) | 環境構築と初期設定の手順 |
| [ブログ記事追加ガイド](docs/guides/blog-posting.md) | 記事の作成・管理方法 |
| [SEO設定ガイド](docs/guides/seo.md) | SEO機能の使い方と最適化 |
| [管理者マニュアル](docs/guides/admin-manual.md) | 記事・質問管理の運用ガイド |
| [トラブルシューティング](docs/guides/troubleshooting.md) | よくある問題と解決方法 |

### アーキテクチャ（docs/architecture/）

| ドキュメント | 説明 |
|:---|:---|
| [システム概要](docs/architecture/overview.md) | 全体構成とコンポーネント図 |
| [セキュリティモデル](docs/architecture/security.md) | 暗号化・認証・認可の仕組み |
| [データフロー](docs/architecture/data-flow.md) | リクエストから応答までの処理の流れ |

### 開発者向け（docs/dev/）

| ドキュメント | 説明 |
|:---|:---|
| [ブランチ戦略](docs/dev/branch.md) | Git運用とブランチ命名規則 |
| [CI/CDガイド](docs/dev/ci-cd.md) | GitHub Actions ワークフロー |

### リファレンス（docs/reference/）

| ドキュメント | 説明 |
|:---|:---|
| [Server Actions](docs/reference/server-actions.md) | Server Actions APIの仕様 |
| [ユーティリティ関数](docs/reference/utilities.md) | 共通関数のリファレンス |
| [型定義](docs/reference/types.md) | TypeScript型定義の一覧 |

**完全なドキュメント索引**: [docs/index.md](docs/index.md)

## 🛠️ 技術スタック

### フロントエンド

- **Next.js 16**: App Router + React Server Components
- **React 19**: 最新のReactバージョン
- **TypeScript 5**: 型安全な開発
- **Tailwind CSS**: ユーティリティファーストCSS

### バックエンド

- **Next.js Server Actions**: サーバーサイドロジック
- **Markdown処理**: gray-matter + 標準Markdown
- **暗号化**: Node.js Crypto (AES-256-GCM)

### SEO & パフォーマンス

- **Next.js Metadata API**: 動的メタデータ生成
- **ImageResponse API**: OGP画像自動生成
- **JSON-LD**: 構造化データ
- **Lighthouse CI**: パフォーマンス自動測定

### CI/CD & デプロイ

- **GitHub Actions**: 自動テスト・ビルド・PR作成
- **Vercel**: 自動デプロイ
- **ESLint**: コード品質チェック

## 📁 プロジェクト構造

```
crypto-blogs/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # ルートレイアウト（メタデータ、JSON-LD）
│   ├── page.tsx              # トップページ
│   ├── blogs/                # ブログ関連ページ
│   │   ├── page.tsx          # 記事一覧
│   │   └── [slug]/           # 記事詳細（動的ルート）
│   ├── sitemap.ts            # sitemap.xml生成
│   ├── robots.ts             # robots.txt生成
│   └── opengraph-image.tsx   # OGP画像生成
├── lib/                      # ライブラリ・ユーティリティ
│   ├── posts.ts              # 記事取得ロジック
│   ├── config/               # 設定ファイル
│   │   └── questions.ts      # 質問設定
│   └── utils/                # ユーティリティ関数
│       ├── auth.ts           # 認証関連
│       ├── crypto.ts         # 暗号化関連
│       └── json-ld.ts        # JSON-LD生成
├── posts/                    # Markdown記事ファイル
│   ├── welcome.md
│   └── restricted-article.md
├── scripts/                  # CLIツール
│   ├── encrypt.ts            # 暗号化ツール
│   └── decrypt.ts            # 復号化ツール
├── docs/                     # ドキュメント
│   ├── index.md              # ドキュメント索引
│   ├── guides/               # ガイド
│   ├── architecture/         # アーキテクチャ
│   ├── reference/            # リファレンス
│   └── dev/                  # 開発者向け
├── .github/                  # GitHub設定
│   └── workflows/            # GitHub Actions
│       ├── feature.yml       # Feature Branch CI
│       └── main.yml          # Main Branch CI
├── lighthouserc.js           # Lighthouse CI設定
└── README.md                 # このファイル
```

## 🔐 セキュリティ

### 暗号化

- **アルゴリズム**: AES-256-GCM
- **鍵管理**: 環境変数 `ENCRYPTION_KEY` で管理
- **IV（初期化ベクトル）**: 暗号化ごとにランダム生成

### 認証

- **Cookie**: HttpOnly, Secure, SameSite=Strict
- **有効期限**: 7日間
- **暗号化**: Cookie値も暗号化して保存

### 環境変数

機密情報は環境変数で管理：

```env
ENCRYPTION_KEY=your-64-char-hex-string
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 📈 パフォーマンス

### Lighthouse スコア目標

| カテゴリ | 目標スコア | CI必須 |
|:---|:---:|:---:|
| Performance | 90%以上 | ✅ |
| Accessibility | 90%以上 | - |
| Best Practices | 90%以上 | - |
| SEO | 90%以上 | - |

### 最適化手法

- **静的生成**: 全記事をビルド時に生成
- **画像最適化**: Next.js Image最適化
- **コード分割**: Dynamic Import活用
- **フォント最適化**: システムフォント使用

## 🤝 コントリビューション

### ブランチ戦略

詳細は [ブランチ戦略](docs/dev/branch.md) を参照してください。

```bash
# Featureブランチの作成
git checkout -b feature/your-feature

# コミット
git commit -m "FEATURE: 新機能の説明"

# Push（自動的にPR作成）
git push -u origin feature/your-feature
```

### コミットメッセージ規則

| プレフィックス | 用途 | 例 |
|:---|:---|:---|
| `FEATURE` | 新機能 | `FEATURE: ユーザー登録機能追加` |
| `FIX` | バグ修正 | `FIX: ログインエラー修正` |
| `REFACTOR` | リファクタリング | `REFACTOR: コンポーネント整理` |
| `DOC` | ドキュメント | `DOC: セットアップガイド更新` |

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

## 👤 作者

**Manato Yamashita**
- GitHub: [@ManatoYamashita](https://github.com/ManatoYamashita)
- Twitter: [@ManatoYamashita](https://twitter.com/ManatoYamashita)
- Email: info@manapuraza.com

## 🙏 謝辞

このプロジェクトは以下の技術・ツールを使用しています：

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [React](https://react.dev/) - UIライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型安全な言語
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [Vercel](https://vercel.com/) - デプロイプラットフォーム
- [GitHub Actions](https://github.com/features/actions) - CI/CD

---

**開発に参加したい方へ**: [コントリビューションガイド](docs/guides/setup.md) をご覧ください。

**問題を報告したい方へ**: [Issues](https://github.com/ManatoYamashita/crypto-blogs/issues) でお知らせください。

**質問がある方へ**: [Discussions](https://github.com/ManatoYamashita/crypto-blogs/discussions) で気軽にご質問ください。
