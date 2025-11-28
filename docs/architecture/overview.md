# システム概要

このドキュメントでは、manapuraza blog システムの全体構成、使用技術、主要コンポーネントについて説明します。

## プロジェクト概要

manapuraza blog は、Markdown ベースの技術ブログシステムです。特定の記事に対して質問形式の認証機能を実装し、正解者のみが閲覧できる仕組みを提供します。

### 主な特徴

- Markdown/MDX による記事管理
- 質問ベースのアクセス制限機能
- AES-256-CBC による回答の暗号化
- Cookie ベースの認証状態管理
- レート制限によるブルートフォース攻撃対策
- Static Site Generation (SSG) による高速表示

## 技術スタック

### フロントエンド・バックエンド統合

- **Next.js**: 16.0.5
  - App Router アーキテクチャ
  - Server Components / Client Components
  - Server Actions
  - Static Site Generation (SSG)

- **React**: 19.x
  - React Server Components (RSC)

- **TypeScript**: 5.x
  - 完全な型安全性

- **Tailwind CSS**: 3.x
  - ユーティリティファーストの CSS フレームワーク

### データ処理

- **gray-matter**: Markdown フロントマターの解析
- **remark**: Markdown → HTML 変換
- **remark-html**: remark プラグイン

### セキュリティ

- **Node.js crypto**: AES-256-CBC 暗号化
- **HttpOnly Cookie**: 認証状態の安全な保存
- **レート制限**: Cookie ベースの試行回数制限

### 開発ツール

- **tsx**: TypeScript スクリプト実行
- **dotenv**: 環境変数管理

## ディレクトリ構成

```
crypto-blogs/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── validate-answer.ts    # 回答検証ロジック
│   ├── blogs/                    # ブログ関連ページ
│   │   ├── [slug]/              # 動的ルート（記事詳細）
│   │   │   ├── _components/     # ページ固有コンポーネント
│   │   │   │   └── QuestionForm.tsx  # 質問フォーム
│   │   │   └── page.tsx         # 記事詳細ページ
│   │   └── page.tsx             # 記事一覧ページ
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # トップページ
├── lib/                         # 共通ライブラリ
│   ├── config/                  # 設定ファイル
│   │   └── questions.ts         # 質問セット定義
│   ├── types/                   # 型定義
│   │   └── index.ts             # TypeScript 型定義
│   ├── utils/                   # ユーティリティ関数
│   │   ├── auth.ts              # 認証関連（Cookie管理）
│   │   ├── crypto.ts            # 暗号化・復号化
│   │   └── rate-limit.ts        # レート制限
│   └── posts.ts                 # 記事読み込み・解析
├── posts/                       # Markdown 記事
│   ├── welcome.md               # サンプル記事（公開）
│   └── restricted-article.md    # サンプル記事（制限付き）
├── scripts/                     # CLI ツール
│   ├── encrypt.ts               # 暗号化ツール
│   └── decrypt.ts               # 復号化ツール
├── docs/                        # ドキュメント
├── public/                      # 静的ファイル
└── .env.local                   # 環境変数（gitignore）
```

## 主要コンポーネント

### 1. 記事管理システム

#### lib/posts.ts

Markdown 記事の読み込みと解析を担当します。

**主な機能:**
- `getAllPosts()`: 全記事のメタデータを取得
- `getPostBySlug(slug)`: 特定記事の取得と HTML 変換

**処理フロー:**
```
posts/*.md → gray-matter → フロントマター抽出
           → remark → HTML 変換
           → PostMeta & content
```

### 2. 認証システム

#### lib/utils/auth.ts

Cookie ベースの認証状態管理を担当します。

**主な機能:**
- `setAuthCookie(slug)`: 認証成功時に Cookie を設定
- `isAuthenticated(slug)`: 認証状態の確認
- `clearAuthCookie()`: 認証情報のクリア

**Cookie 仕様:**
- 名前: `blog_auth`
- 値: カンマ区切りの slug リスト（例: `"article1,article2"`）
- 有効期限: 30日
- 属性: HttpOnly, Secure (本番), SameSite=Strict

### 3. 暗号化システム

#### lib/utils/crypto.ts

AES-256-CBC を使用した暗号化・復号化を担当します。

**主な機能:**
- `encrypt(text)`: 平文を暗号化
- `decrypt(encryptedText)`: 暗号文を復号化

**暗号化形式:**
```
IV:EncryptedData
(16バイトのIV):(暗号化されたデータ)
両方とも HEX エンコード
```

### 4. レート制限システム

#### lib/utils/rate-limit.ts

ブルートフォース攻撃を防ぐためのレート制限を実装します。

**設定:**
- 最大試行回数: 5回
- ロック期間: 15分

**主な機能:**
- `checkRateLimit(slug)`: 残り試行回数を確認
- `incrementFailedAttempts(slug)`: 失敗回数をインクリメント
- `resetRateLimit(slug)`: 成功時にリセット

### 5. Server Actions

#### app/actions/validate-answer.ts

サーバーサイドでの回答検証を担当します。

**処理フロー:**
```
1. レート制限チェック
2. 質問セットの取得
3. 暗号化された正解の復号化
4. ユーザー回答との比較
5. 成功時: 認証Cookie設定 + レート制限リセット
   失敗時: レート制限インクリメント
```

### 6. UIコンポーネント

#### app/blogs/[slug]/_components/QuestionForm.tsx

クライアントサイドの質問フォームコンポーネントです。

**機能:**
- 3種類の質問タイプに対応（text, choice, password）
- 画像付き質問のサポート
- Server Actions の呼び出し
- 成功時の自動リロード

## データフロー

### 制限付き記事へのアクセスフロー

```
1. ユーザーが記事ページにアクセス
   ↓
2. app/blogs/[slug]/page.tsx (Server Component)
   ↓
3. getPostBySlug(slug) で記事を取得
   ↓
4. requiresAuth が true か確認
   ↓
5. isAuthenticated(slug) で認証状態を確認
   ↓
   [未認証の場合]
   ↓
6. QuestionForm を表示 (Client Component)
   ↓
7. ユーザーが回答を入力
   ↓
8. validateAnswers() Server Action を呼び出し
   ↓
9. サーバーサイドで検証
   ↓
   [正解の場合]
   ↓
10. setAuthCookie(slug) で認証Cookie設定
    ↓
11. クライアントがページをリロード
    ↓
12. 記事本文を表示
```

## デプロイアーキテクチャ

### 開発環境

```
Local Machine
├── Next.js Dev Server (localhost:3000)
├── .env.local (ENCRYPTION_KEY)
└── posts/*.md
```

### 本番環境（Vercel）

```
Vercel Edge Network
├── Static Pages (SSG)
│   ├── / (トップページ)
│   ├── /blogs (記事一覧)
│   └── /blogs/[slug] (記事詳細)
├── Server Actions
│   └── validate-answer
├── Environment Variables
│   └── ENCRYPTION_KEY
└── Cookie Storage (認証状態)
```

### 静的生成

Next.js の `generateStaticParams` を使用し、全記事をビルド時に生成します：

```typescript
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

**メリット:**
- 高速な初回表示
- CDN キャッシュの活用
- サーバー負荷の軽減

## セキュリティモデル

### 多層防御アプローチ

1. **暗号化層**: 正解を AES-256-CBC で暗号化
2. **サーバーサイド検証**: 回答検証は Server Actions で実行
3. **認証層**: HttpOnly Cookie による認証状態管理
4. **レート制限層**: ブルートフォース攻撃対策

詳細は [セキュリティモデル](./security.md) を参照してください。

## パフォーマンス最適化

### 採用している最適化手法

1. **Static Site Generation (SSG)**
   - 全記事をビルド時に生成
   - CDN からの配信

2. **Server Components**
   - JavaScript バンドルサイズの削減
   - サーバーサイドでのデータ取得

3. **Client Components の最小化**
   - QuestionForm のみクライアントコンポーネント
   - インタラクティブな部分のみクライアントで実行

## 拡張性

### 将来的な拡張ポイント

1. **データベース統合**
   - 現在: ファイルベース (Markdown)
   - 将来: PostgreSQL / MongoDB などへの移行が可能

2. **認証方式の拡張**
   - OAuth / JWT への移行
   - 複数の認証方式の併用

3. **質問タイプの追加**
   - 現在: text, choice, password
   - 将来: 複数選択、並び替え、ファイルアップロードなど

4. **管理画面の追加**
   - 現在: ファイルベースの管理
   - 将来: Web ベースの管理画面

## 関連ドキュメント

- [セキュリティモデル](./security.md) - セキュリティ設計の詳細
- [データフロー](./data-flow.md) - リクエスト処理の詳細フロー
- [型定義リファレンス](../reference/types.md) - TypeScript 型定義
- [Server Actions リファレンス](../reference/server-actions.md) - API 仕様
