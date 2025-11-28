# ブログ記事追加ガイド

このガイドでは、manapuraza blog に新しい記事を追加する方法を説明します。

## 📝 記事の種類

本ブログでは、2種類の記事を作成できます：

1. **公開記事**: 誰でも閲覧可能な通常の記事
2. **制限付き記事**: 質問に正解した人のみ閲覧できる認証付き記事

## 🚀 クイックスタート

### 公開記事の追加（最も簡単な方法）

1. `posts/` ディレクトリに新しい `.md` ファイルを作成
2. フロントマターを記述
3. Markdown形式で本文を記述
4. 保存して完了！

**例: `posts/my-first-post.md`**

```markdown
---
title: "はじめての記事"
date: "2025-11-28"
categories: ["技術", "Next.js"]
requiresAuth: false
---

# はじめての記事

これは私の最初の記事です。

## セクション1

ここに内容を書きます。
```

## 📋 フロントマター仕様

全ての記事ファイルは、冒頭に **フロントマター（Frontmatter）** を記述する必要があります。

### 必須フィールド

| フィールド | 型 | 説明 | 例 |
|:---|:---|:---|:---|
| `title` | string | 記事のタイトル | `"Next.jsで始めるWeb開発"` |
| `date` | string | 公開日（YYYY-MM-DD形式） | `"2025-11-28"` |
| `categories` | string[] | カテゴリの配列 | `["技術", "Next.js"]` |
| `requiresAuth` | boolean | 認証が必要か | `false` または `true` |

### 条件付きフィールド

| フィールド | 型 | 条件 | 説明 | 例 |
|:---|:---|:---|:---|:---|
| `questionSetId` | string | `requiresAuth: true` の場合 | 質問セットのID | `"tcu-basic"` |

### フロントマター例

#### 公開記事

```yaml
---
title: "TypeScriptの型安全性について"
date: "2025-11-28"
categories: ["TypeScript", "型システム"]
requiresAuth: false
---
```

#### 制限付き記事

```yaml
---
title: "限定公開: 上級者向けパフォーマンスチューニング"
date: "2025-11-28"
categories: ["パフォーマンス", "限定公開"]
requiresAuth: true
questionSetId: "advanced-performance"
---
```

## 📂 ファイル命名規則

### ファイル名の形式

- **形式**: `kebab-case.md`（小文字 + ハイフン区切り）
- **拡張子**: `.md`（Markdown）

### 推奨命名パターン

| パターン | 例 | 用途 |
|:---|:---|:---|
| トピック単体 | `react-hooks.md` | 技術トピック |
| トピック + 詳細 | `nextjs-app-router-guide.md` | ガイド記事 |
| 日付 + トピック | `2025-11-28-release-notes.md` | リリースノート |

### 避けるべき命名

- ❌ `My First Post.md`（スペース、大文字）
- ❌ `記事1.md`（日本語）
- ❌ `post_1.md`（アンダースコア）

## ✍️ Markdown記法

### 基本的な記法

```markdown
# 見出し1（H1）
## 見出し2（H2）
### 見出し3（H3）

**太字**
*斜体*

- リスト項目1
- リスト項目2

1. 番号付きリスト1
2. 番号付きリスト2

[リンクテキスト](https://example.com)

![画像の説明](/images/sample.png)
```

### コードブロック

````markdown
```javascript
const hello = () => {
  console.log('Hello, World!');
};
```
````

### 表（テーブル）

```markdown
| 項目 | 説明 |
|:---|:---|
| Next.js | Reactフレームワーク |
| TypeScript | 型安全な言語 |
```

## 🔐 制限付き記事の作成

制限付き記事を作成するには、以下の手順を実行します。

### Step 1: 質問セットの設計

どのような質問で閲覧制限をかけるか設計します。

**質問の種類:**

1. **テキスト入力（text）**: 自由記述
2. **選択式（choice）**: 複数の選択肢から選択
3. **パスワード（password）**: パスワード入力（マスク表示）

### Step 2: 正解の暗号化

質問の正解を暗号化します。

```bash
# テキスト入力の正解を暗号化
npx tsx scripts/encrypt.ts "TCU"

# 選択式の正解を暗号化
npx tsx scripts/encrypt.ts "東京都世田谷区"

# パスワードを暗号化
npx tsx scripts/encrypt.ts "secret123"
```

**出力例:**

```
=== 暗号化成功 ===
平文: TCU
暗号化: db8c6000c6e771cc0eceb08a69dad616:90a1001120977c83276ebcbad918fb81

この暗号化文字列を lib/config/questions.ts の encryptedAnswer に設定してください。
```

### Step 3: 質問セットの登録

`lib/config/questions.ts` に質問セットを追加します。

```typescript
export const questionConfig: QuestionConfig = {
  // 既存の質問セット...

  // 新しい質問セット
  'my-custom-quiz': {
    questions: [
      {
        id: 'q1',
        text: '東京都市大学の英語名は？（略称を大文字で入力）',
        type: 'text',
        encryptedAnswer: 'db8c6000c6e771cc0eceb08a69dad616:90a1001120977c83276ebcbad918fb81',
        caseSensitive: true, // 大文字小文字を区別する場合
      },
      {
        id: 'q2',
        text: '東京都市大学のキャンパスがある区は？',
        type: 'choice',
        options: ['世田谷区', '渋谷区', '目黒区', '港区'],
        encryptedAnswer: 'd66aee22d268512cd8fa187a0d6c3cb9:9b8dccdcc920f219dcd36c4f2be0aef1e25797f1ff0a44ee869e2d6a7342a043',
      },
      {
        id: 'q3',
        text: 'アクセスパスワードを入力してください',
        type: 'password',
        encryptedAnswer: '9f94805060b7502da5d048b9b65f12cc:b7f905c392426927f14a495e778d788f',
      },
    ],
  },
};
```

### Step 4: 記事ファイルの作成

`posts/` に記事ファイルを作成し、`questionSetId` を指定します。

```markdown
---
title: "限定公開: 上級者向けReact最適化テクニック"
date: "2025-11-28"
categories: ["React", "パフォーマンス", "限定公開"]
requiresAuth: true
questionSetId: "my-custom-quiz"
---

# 限定公開記事

この記事は質問に正解した方のみ閲覧できます。

## React最適化の極意

...
```

## 📸 画像の追加

### 画像の配置場所

画像ファイルは `public/images/` ディレクトリに配置します。

```
public/
└── images/
    ├── blog/
    │   ├── article1-cover.png
    │   └── article1-diagram.svg
    └── common/
        └── logo.png
```

### 画像の参照方法

Markdown内で画像を参照する際は、`/images/` から始まるパスを使用します。

```markdown
![記事のカバー画像](/images/blog/article1-cover.png)

![アーキテクチャ図](/images/blog/article1-diagram.svg)
```

### 推奨画像形式

| 形式 | 用途 | 推奨サイズ |
|:---|:---|:---|
| PNG | スクリーンショット、図表 | 最大 1MB |
| JPEG | 写真 | 最大 500KB |
| SVG | ロゴ、アイコン、図 | - |
| WebP | 最適化された画像 | 最大 500KB |

## 🏷️ カテゴリの設計

### カテゴリの命名規則

- **日本語表記**: `["技術", "Next.js", "TypeScript"]`
- **簡潔に**: 1-2単語程度
- **一貫性**: 同じ意味のカテゴリは統一（例: "TypeScript" と "TS" を混在させない）

### 推奨カテゴリ例

| カテゴリ | 用途 |
|:---|:---|
| `技術` | 技術全般 |
| `Next.js` | Next.js関連 |
| `React` | React関連 |
| `TypeScript` | TypeScript関連 |
| `パフォーマンス` | パフォーマンス最適化 |
| `セキュリティ` | セキュリティ関連 |
| `お知らせ` | サイトのお知らせ |
| `限定公開` | 制限付き記事 |

## ✅ 記事作成チェックリスト

記事を公開する前に、以下を確認してください：

- [ ] ファイル名が kebab-case.md 形式である
- [ ] フロントマターに必須フィールドが全て含まれている
- [ ] 日付が YYYY-MM-DD 形式である
- [ ] カテゴリが適切に設定されている
- [ ] 制限付き記事の場合、questionSetId が正しく設定されている
- [ ] 制限付き記事の場合、質問セットが lib/config/questions.ts に登録されている
- [ ] 画像のパスが正しい（/images/ から始まる）
- [ ] Markdownの記法が正しい
- [ ] コードブロックにシンタックスハイライトが指定されている
- [ ] ローカル環境で表示確認をした

## 🔍 動作確認

### ローカル環境での確認

1. 開発サーバーを起動
   ```bash
   npm run dev
   ```

2. ブラウザで確認
   - トップページ: http://localhost:3000
   - 記事一覧: http://localhost:3000/blogs
   - 個別記事: http://localhost:3000/blogs/your-article-slug

3. 制限付き記事の場合
   - 質問フォームが表示されるか確認
   - 正解を入力して記事が表示されるか確認
   - 不正解の場合にエラーが表示されるか確認

## 🚀 デプロイ

記事をコミットしてプッシュすると、Vercelが自動的にビルド・デプロイします。

```bash
# 記事ファイルを追加
git add posts/your-new-article.md

# コミット
git commit -m "FEATURE: 新記事「記事タイトル」を追加"

# プッシュ（mainブランチの場合は自動デプロイ）
git push origin main
```

## 📚 参考リンク

- [Markdown記法ガイド](https://www.markdownguide.org/basic-syntax/)
- [セットアップガイド](./setup.md)
- [システム概要](../architecture/overview.md)
- [セキュリティモデル](../architecture/security.md)

## ❓ トラブルシューティング

### Q: 記事が表示されない

**A:** 以下を確認してください：
- ファイルが `posts/` ディレクトリに配置されているか
- フロントマターの形式が正しいか（特に `---` の位置）
- 日付が正しい形式（YYYY-MM-DD）か

### Q: 質問フォームが表示されない

**A:** 以下を確認してください：
- `requiresAuth: true` が設定されているか
- `questionSetId` が `lib/config/questions.ts` に登録されているか
- 質問セットのIDが正しいか（スペルミスがないか）

### Q: 暗号化エラーが発生する

**A:** 以下を確認してください：
- `.env.local` に `ENCRYPTION_KEY` が設定されているか
- `npx tsx scripts/encrypt.ts` を実行する前に `.env.local` を作成したか
- 暗号化キーが64文字のHEX文字列か

### Q: 画像が表示されない

**A:** 以下を確認してください：
- 画像ファイルが `public/images/` に配置されているか
- パスが `/images/` から始まっているか（`images/` ではなく `/images/`）
- ファイル名が正しいか（大文字小文字も区別される）

---

さらに詳しい情報が必要な場合は、[トラブルシューティング](./troubleshooting.md)を参照してください。
