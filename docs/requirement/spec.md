# システム要件定義書

## 1\. プロジェクト概要

  * **システム名:** manapuraza blog
  * **目的:** Markdownベースの技術ブログにおいて、特定の記事に対し「質問回答による閲覧制限」を設け、クイズやパスワードによる限定公開を実現する。
  * **ターゲット:** 管理者の知人など10数名程度のユーザー。
  * **予算:** 無料（Vercel Hobby Plan + GitHub）。

## 2\. 技術スタック

  * **フレームワーク:** Next.js 16 (App Router) / React 19
  * **言語:** TypeScript
  * **スタイリング:** Tailwind CSS
  * **デプロイ:** Vercel
  * **データソース:**
      * 記事: ローカルMarkdown/MDXファイル
      * 設定: TypeScriptオブジェクト
  * **認証・セキュリティ:** Node.js `crypto` モジュール (AES-256-CBC) + Server Actions + Cookies

## 3\. 機能要件

### 3.1 ページ構成

| ページ | パス | 機能概要 |
| :--- | :--- | :--- |
| **トップ** | `/` | サイトの顔。ブログ一覧へのナビゲーション。 |
| **記事一覧** | `/blogs` | 全記事リスト。制限付き記事には「鍵アイコン」を表示。 |
| **カテゴリ** | `/categories` | カテゴリ別の記事一覧。 |
| **記事詳細** | `/blogs/[slug]` | 記事本文表示。**制限付き記事は、認証済みの場合のみ表示。** |

### 3.2 質問・回答機能（コア機能）

  * **制限ロジック:**
      * 未認証ユーザーが制限付き記事にアクセスした場合、本文の代わりに「質問フォーム」を表示する。
      * 記事ごとに定義された「質問群（QuestionSet）」に全問正解した場合のみ、閲覧を許可する。
  * **質問タイプ:**
    1.  **記述式 (Text):** 完全一致判定（大文字小文字の区別設定可）。
    2.  **選択式 (Choice):** ラジオボタン等で選択。
    3.  **パスワード (Password):** 入力値をマスク表示。
  * **画像対応:** 質問文に画像を添付可能とする。
  * **レートリミット:** 短時間に連続して回答を間違えた場合、数分間入力をロックする（Cookieベースで実装）。

### 3.3 管理・運用機能

  * **正解データの作成:** ローカル実行用のCLIツールを使用し、正解文字列を暗号化して出力する。
  * **記事管理:** GitリポジトリへのMarkdownファイル追加・更新による管理。
  * **緊急時の復号:** 管理者は `.env` のキーを使用し、暗号化された正解を元に戻して確認することが可能。

## 4\. セキュリティ詳細設計

今回の最重要要件である「厳格かつ管理可能なセキュリティ」を以下の仕様で実現する。

### 4.1 暗号化方式

  * **アルゴリズム:** AES-256-CBC（可逆暗号）
  * **鍵管理:**
      * 復号キー（32文字）は環境変数 `ENCRYPTION_KEY` として Vercel およびローカルの `.env.local` で管理する。
      * **リポジトリ内のコードには一切含めない。**
  * **データ保持:**
      * ソースコード上の設定ファイルには、暗号化された文字列（例: `iv:encrypted_data`）のみを記述する。

### 4.2 判定フロー（Server Actions）

1.  **Client:** ユーザーがフォームから回答を送信。
2.  **Server:**
      * `ENCRYPTION_KEY` を用いて設定ファイルの「正解」を復号。
      * ユーザーの回答と照合。
3.  **Result:**
      * **正解:** `HttpOnly`, `Secure` 属性付きの署名済みCookieを発行し、閲覧許可状態にする。
      * **不正解:** クライアントへは `false` のみを返す（正解データは一切送信しない）。

## 5\. データ構造定義 (TypeScript)

### 5.1 記事メタデータ (Frontmatter)

```typescript
type PostMeta = {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  requiresAuth: boolean; // trueなら制限対象
  questionSetId?: string; // 紐付ける質問群のID
};
```

### 5.2 質問設定 (config/questions.ts)

```typescript
// サーバーサイド専用の型定義
type QuestionConfig = {
  [questionSetId: string]: {
    questions: {
      id: string;
      text: string;
      imageUrl?: string;
      type: 'text' | 'choice' | 'password';
      options?: string[]; // 選択肢
      encryptedAnswer: string; // 暗号化済み正解文字列
    }[];
  };
};
```

## 6\. ディレクトリ構成案

```text
my-blog-system/
├── app/
│   ├── blogs/
│   │   └── [slug]/
│   │       ├── page.tsx          # サーバーコンポーネント (分岐ロジック)
│   │       └── _components/      # このページ専用のパーツ
│   │           ├── QuestionForm.tsx # クライアントコンポーネント
│   │           └── ArticleBody.tsx
│   └── actions/
│       └── validate-answer.ts    # Server Actions (正解判定)
├── lib/
│   ├── config/
│   │   └── questions.ts          # 暗号化された正解データ
│   └── utils/
│       └── crypto.ts             # 暗号化・復号化ロジック
├── scripts/
│   └── encrypt.ts                # 管理用：正解暗号化ツール
└── .env.local                    # ENCRYPTION_KEY を記述
```
