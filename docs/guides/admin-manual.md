# 管理者マニュアル

このマニュアルでは、記事の追加・編集、質問の設定、暗号化された回答の管理方法について説明します。

## 記事の管理

### 記事の追加

新しい記事を追加するには、`posts/` ディレクトリに Markdown ファイルを作成します。

#### 基本的な記事（制限なし）

```markdown
---
title: "記事のタイトル"
date: "2025-11-28"
categories: ["カテゴリ1", "カテゴリ2"]
requiresAuth: false
---

# 記事の本文

ここに記事の内容を Markdown 形式で記述します。
```

#### 制限付き記事（質問による認証が必要）

```markdown
---
title: "限定公開記事"
date: "2025-11-28"
categories: ["限定公開"]
requiresAuth: true
questionSetId: "tcu-basic"
---

# 制限付き記事の本文

この記事は質問に正解した人のみ閲覧できます。
```

### フロントマターの項目

| 項目 | 必須 | 説明 | 例 |
|------|------|------|-----|
| `title` | ✓ | 記事のタイトル | `"Next.js入門"` |
| `date` | ✓ | 公開日（YYYY-MM-DD形式） | `"2025-11-28"` |
| `categories` | ✓ | カテゴリ配列 | `["技術", "Next.js"]` |
| `requiresAuth` | ✓ | 認証が必要か | `true` / `false` |
| `questionSetId` | △ | 質問セットID（requiresAuth: true の場合必須） | `"tcu-basic"` |

### ファイル命名規則

- ファイル名は英数字とハイフンのみ使用（例: `next-js-tutorial.md`）
- ファイル名がURLのスラグになります（例: `/blogs/next-js-tutorial`）
- 日本語や特殊文字は使用しない

## 質問の管理

### 質問セットの作成・編集

質問は `lib/config/questions.ts` ファイルで管理します。

```typescript
export const questionConfig: Record<string, QuestionSet> = {
  'question-set-id': {
    questions: [
      // 質問の配列
    ]
  }
};
```

### 質問の種類

#### 1. テキスト入力形式（text）

ユーザーが自由にテキストを入力する形式です。

```typescript
{
  id: 'q1',
  text: '東京都市大学の略称は？',
  type: 'text',
  encryptedAnswer: '生成した暗号化文字列',
  caseSensitive: true  // 大文字小文字を区別する（オプション、デフォルト: false）
}
```

#### 2. 選択肢形式（choice）

複数の選択肢から1つを選ぶ形式です。

```typescript
{
  id: 'q2',
  text: 'このブログのテーマは？',
  type: 'choice',
  options: ['技術ブログ', '日記', 'ニュース', 'その他'],
  encryptedAnswer: '生成した暗号化文字列'
}
```

#### 3. パスワード形式（password）

入力内容がマスクされる形式です。

```typescript
{
  id: 'q3',
  text: 'パスワードを入力してください',
  type: 'password',
  encryptedAnswer: '生成した暗号化文字列'
}
```

#### 画像付き質問（オプション）

質問に画像を追加できます。

```typescript
{
  id: 'q4',
  text: 'この画像は何を表していますか？',
  imageUrl: '/images/question-image.png',  // public/ からの相対パス
  type: 'text',
  encryptedAnswer: '生成した暗号化文字列'
}
```

### 暗号化された回答の生成

正解の回答は暗号化して保存する必要があります。

#### 暗号化ツールの使用

プロジェクトルートで以下のコマンドを実行します：

```bash
npx tsx scripts/encrypt.ts "正解の文字列"
```

実行例：

```bash
# 例1: テキスト入力の正解を暗号化
npx tsx scripts/encrypt.ts "TCU"

# 出力例:
# 暗号化された文字列: a1b2c3d4e5f6g7h8:9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x

# 例2: 選択肢の正解を暗号化
npx tsx scripts/encrypt.ts "技術ブログ"

# 例3: パスワードを暗号化
npx tsx scripts/encrypt.ts "secret123"
```

出力された暗号化文字列を `encryptedAnswer` に設定します。

#### 暗号化された回答の確認（復号化）

管理者が暗号化された文字列を確認したい場合：

```bash
npx tsx scripts/decrypt.ts "a1b2c3d4e5f6g7h8:9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x"

# 出力: TCU
```

## 実践例：制限付き記事の追加

### ステップ1: 質問セットの作成

`lib/config/questions.ts` に新しい質問セットを追加します：

```typescript
export const questionConfig: Record<string, QuestionSet> = {
  // 既存の質問セット
  'tcu-basic': { /* ... */ },

  // 新しい質問セット
  'javascript-basics': {
    questions: [
      {
        id: 'js1',
        text: 'JavaScriptで変数を宣言するキーワードを1つ答えてください',
        type: 'text',
        encryptedAnswer: 'ここに暗号化文字列',
        caseSensitive: false
      },
      {
        id: 'js2',
        text: 'JavaScriptの実行環境はどれ？',
        type: 'choice',
        options: ['Node.js', 'Python', 'Ruby', 'Java'],
        encryptedAnswer: 'ここに暗号化文字列'
      }
    ]
  }
};
```

### ステップ2: 正解を暗号化

```bash
# 質問1の正解を暗号化
npx tsx scripts/encrypt.ts "let"

# 質問2の正解を暗号化
npx tsx scripts/encrypt.ts "Node.js"
```

### ステップ3: 暗号化文字列を設定

出力された文字列を `encryptedAnswer` に設定します。

### ステップ4: 記事ファイルの作成

`posts/javascript-basics.md` を作成：

```markdown
---
title: "JavaScript基礎講座"
date: "2025-11-28"
categories: ["プログラミング", "JavaScript"]
requiresAuth: true
questionSetId: "javascript-basics"
---

# JavaScript基礎講座

この記事では、JavaScriptの基礎について学びます。
```

### ステップ5: 動作確認

1. 開発サーバーを起動: `npm run dev`
2. `/blogs` にアクセスし、新しい記事が表示されることを確認
3. 記事をクリックし、質問フォームが表示されることを確認
4. 正解を入力し、記事が表示されることを確認

## セキュリティに関する注意事項

### 重要な原則

1. **暗号化キーの管理**
   - `.env.local` の `ENCRYPTION_KEY` は絶対に公開しない
   - 本番環境とローカル環境で同じキーを使用する
   - キーを変更すると、既存の暗号化データが復号化できなくなる

2. **正解の保護**
   - 正解は必ず暗号化してから `questions.ts` に記載する
   - 平文の正解をコードにコミットしない
   - `questions.ts` ファイル自体はサーバーサイドでのみ使用される

3. **レート制限**
   - システムは自動的にレート制限を適用（5回の失敗で15分間ロック）
   - 設定変更は `lib/utils/rate-limit.ts` で可能

## よくある質問

### Q1: 既存の記事を制限付きにできますか？

はい、可能です。フロントマターに `requiresAuth: true` と `questionSetId` を追加してください。

### Q2: 質問を後から変更できますか？

可能ですが、以下の点に注意してください：
- 質問のIDを変更すると、既存の認証状態がリセットされる可能性があります
- 暗号化された回答を変更する場合は、必ず新しく暗号化してください

### Q3: 1つの記事に複数の質問セットを設定できますか？

いいえ、1つの記事には1つの質問セットのみ設定できます。

## 次のステップ

- システムのアーキテクチャを理解したい: [システム概要](../architecture/overview.md)
- セキュリティの詳細を知りたい: [セキュリティモデル](../architecture/security.md)
- 問題が発生した場合: [トラブルシューティング](./troubleshooting.md)
