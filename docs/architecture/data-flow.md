# データフロー

このドキュメントでは、manapuraza blog におけるリクエストから応答までの詳細な処理フローを説明します。

## 目次

1. [トップページアクセス](#1-トップページアクセス)
2. [記事一覧ページアクセス](#2-記事一覧ページアクセス)
3. [制限なし記事の閲覧](#3-制限なし記事の閲覧)
4. [制限付き記事の閲覧（未認証）](#4-制限付き記事の閲覧未認証)
5. [質問への回答と認証](#5-質問への回答と認証)
6. [制限付き記事の閲覧（認証済み）](#6-制限付き記事の閲覧認証済み)

---

## 1. トップページアクセス

### フロー図

```
ブラウザ
  │
  │ GET /
  │
  ▼
Next.js Server (SSG)
  │
  │ app/page.tsx
  │ ├─ Server Component として実行
  │ └─ 静的 HTML を返す
  │
  ▼
ブラウザ
  │
  │ HTML レンダリング
  │ ├─ "manapuraza blog" タイトル表示
  │ └─ "/blogs" へのリンク表示
  │
  ▼
表示完了
```

### コード

```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">manapuraza blog</h1>
      <p className="text-lg mb-4">技術ブログへようこそ</p>
      <Link href="/blogs">記事一覧を見る</Link>
    </main>
  );
}
```

---

## 2. 記事一覧ページアクセス

### フロー図

```
ブラウザ
  │
  │ GET /blogs
  │
  ▼
Next.js Server (SSG)
  │
  │ app/blogs/page.tsx
  │ ├─ Server Component として実行
  │ └─ getAllPosts() を呼び出し
  │
  ▼
lib/posts.ts
  │
  │ getAllPosts()
  │ ├─ posts/*.md を読み込み
  │ ├─ gray-matter でフロントマター解析
  │ └─ PostMeta[] を返す
  │
  ▼
Next.js Server
  │
  │ 記事一覧 HTML を生成
  │ ├─ requiresAuth: true → 🔒 アイコン表示
  │ └─ 各記事へのリンク生成
  │
  ▼
ブラウザ
  │
  │ 記事一覧を表示
  │
  ▼
表示完了
```

### データフロー詳細

```typescript
// app/blogs/page.tsx
export default async function BlogListPage() {
  // 1. 全記事のメタデータを取得
  const posts = await getAllPosts();

  // 2. posts 配列の例:
  // [
  //   { slug: "welcome", title: "ようこそ", requiresAuth: false, ... },
  //   { slug: "restricted", title: "制限付き", requiresAuth: true, ... }
  // ]

  return (
    <div>
      {posts.map((post) => (
        <Link href={`/blogs/${post.slug}`}>
          <h2>{post.title}</h2>
          {post.requiresAuth && <span>🔒</span>}
        </Link>
      ))}
    </div>
  );
}
```

---

## 3. 制限なし記事の閲覧

### フロー図

```
ブラウザ
  │
  │ GET /blogs/welcome
  │
  ▼
Next.js Server (SSG)
  │
  │ app/blogs/[slug]/page.tsx
  │ ├─ params から slug を取得: "welcome"
  │ └─ getPostBySlug("welcome") を呼び出し
  │
  ▼
lib/posts.ts
  │
  │ getPostBySlug("welcome")
  │ ├─ posts/welcome.md を読み込み
  │ ├─ gray-matter でフロントマター解析
  │ │   requiresAuth: false
  │ ├─ remark で Markdown → HTML 変換
  │ └─ { ...meta, content: "<h1>...</h1>" } を返す
  │
  ▼
Next.js Server
  │
  │ app/blogs/[slug]/page.tsx
  │ ├─ post.requiresAuth が false
  │ ├─ 認証チェックをスキップ
  │ └─ 記事本文 HTML を返す
  │
  ▼
ブラウザ
  │
  │ 記事本文を表示
  │
  ▼
表示完了
```

### コード

```typescript
// app/blogs/[slug]/page.tsx
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // requiresAuth が false の場合、直接記事を表示
  if (!post.requiresAuth) {
    return (
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    );
  }

  // ... (認証処理)
}
```

---

## 4. 制限付き記事の閲覧（未認証）

### フロー図

```
ブラウザ
  │
  │ GET /blogs/restricted-article
  │ Cookie: なし（または認証情報なし）
  │
  ▼
Next.js Server (SSG/SSR)
  │
  │ app/blogs/[slug]/page.tsx
  │ ├─ params から slug を取得: "restricted-article"
  │ └─ getPostBySlug("restricted-article") を呼び出し
  │
  ▼
lib/posts.ts
  │
  │ getPostBySlug("restricted-article")
  │ ├─ posts/restricted-article.md を読み込み
  │ └─ { requiresAuth: true, questionSetId: "tcu-basic", ... } を返す
  │
  ▼
Next.js Server
  │
  │ app/blogs/[slug]/page.tsx
  │ ├─ post.requiresAuth が true
  │ └─ isAuthenticated("restricted-article") を呼び出し
  │
  ▼
lib/utils/auth.ts
  │
  │ isAuthenticated("restricted-article")
  │ ├─ Cookie "blog_auth" を取得
  │ ├─ Cookie が存在しない → false を返す
  │ └─ または slug が含まれていない → false を返す
  │
  ▼
Next.js Server
  │
  │ app/blogs/[slug]/page.tsx
  │ ├─ authenticated === false
  │ ├─ questionConfig["tcu-basic"] から質問セットを取得
  │ ├─ encryptedAnswer と caseSensitive を除外
  │ └─ QuestionForm コンポーネントを返す
  │
  ▼
ブラウザ
  │
  │ Client Component (QuestionForm) をレンダリング
  │ ├─ 質問フォームを表示
  │ ├─ text / choice / password 入力フィールド
  │ └─ 画像があれば表示
  │
  ▼
質問フォーム表示
```

### コード

```typescript
// app/blogs/[slug]/page.tsx
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // 認証チェック
  const authenticated = post.requiresAuth
    ? await isAuthenticated(slug)
    : true;

  // 未認証の場合
  if (post.requiresAuth && !authenticated) {
    const questionSetId = post.questionSetId!;
    const questionSet = questionConfig[questionSetId];

    // 正解を除外したクライアント用データを作成
    const clientQuestions = questionSet.questions.map((q) => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      type: q.type,
      options: q.options,
      // encryptedAnswer は送信しない
      // caseSensitive は送信しない
    }));

    return (
      <QuestionForm
        slug={slug}
        questionSetId={questionSetId}
        questions={clientQuestions}
      />
    );
  }

  // ... (記事表示)
}
```

---

## 5. 質問への回答と認証

### フロー図

```
ブラウザ (Client Component)
  │
  │ ユーザーが質問に回答
  │ ├─ q1: "TCU"
  │ ├─ q2: "技術ブログ"
  │ └─ q3: "secret123"
  │
  │ フォーム送信
  │
  ▼
QuestionForm.tsx
  │
  │ handleSubmit()
  │ ├─ UserAnswer[] を構築
  │ │   [
  │ │     { questionId: "q1", answer: "TCU" },
  │ │     { questionId: "q2", answer: "技術ブログ" },
  │ │     { questionId: "q3", answer: "secret123" }
  │ │   ]
  │ └─ validateAnswers(slug, questionSetId, answers) を呼び出し
  │
  ▼
Next.js Server Action
  │
  │ app/actions/validate-answer.ts
  │ validateAnswers("restricted-article", "tcu-basic", answers)
  │
  ▼
【ステップ1: レート制限チェック】
  │
  │ checkRateLimit("restricted-article")
  │ ├─ Cookie "rate_limit_restricted-article" を取得
  │ ├─ ロック中か確認
  │ │   lockedUntil > 現在時刻 → 残り試行回数 0 を返す
  │ └─ 試行可能回数を返す（例: 5 - attempts = 3回）
  │
  ▼
【ステップ2: 質問セット取得】
  │
  │ questionConfig["tcu-basic"]
  │ └─ サーバーサイドのみアクセス可能
  │
  ▼
【ステップ3: 正解の復号化】
  │
  │ 各質問の encryptedAnswer を復号化
  │ ├─ decrypt("a1b2c3...") → "TCU"
  │ ├─ decrypt("d4e5f6...") → "技術ブログ"
  │ └─ decrypt("g7h8i9...") → "secret123"
  │
  ▼
【ステップ4: 回答の検証】
  │
  │ ユーザー回答 vs 正解
  │ ├─ caseSensitive: true → 大文字小文字を区別
  │ ├─ caseSensitive: false → toLowerCase() して比較
  │ └─ 全問正解か判定
  │
  ▼
【ステップ5A: 正解の場合】
  │
  │ setAuthCookie("restricted-article")
  │ ├─ Cookie "blog_auth" を取得
  │ ├─ 既存の値: "welcome"
  │ ├─ 新しい値: "welcome,restricted-article"
  │ └─ Cookie を更新
  │     Set-Cookie: blog_auth=welcome,restricted-article;
  │                  HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
  │
  │ resetRateLimit("restricted-article")
  │ └─ Cookie "rate_limit_restricted-article" を削除
  │
  │ { success: true, message: "正解です！" } を返す
  │
  ▼
QuestionForm.tsx
  │
  │ result.success === true
  │ └─ window.location.reload()
  │
  ▼
ブラウザ
  │
  │ ページリロード
  │ Cookie: blog_auth=welcome,restricted-article
  │
  ▼
Next.js Server
  │
  │ isAuthenticated("restricted-article")
  │ ├─ Cookie から "welcome,restricted-article" を取得
  │ ├─ "restricted-article" が含まれる → true
  │ └─ 記事本文を表示
  │
  ▼
ブラウザ
  │
  │ 記事本文を表示
  │
  ▼
認証完了
```

### 【ステップ5B: 不正解の場合】

```
【ステップ5B: 不正解の場合】
  │
  │ incrementFailedAttempts("restricted-article")
  │ ├─ Cookie "rate_limit_restricted-article" を取得
  │ ├─ attempts をインクリメント: 2 → 3
  │ ├─ attempts が 5 に達した場合
  │ │   └─ lockedUntil = 現在時刻 + 900秒 を設定
  │ └─ Cookie を更新
  │
  │ { success: false, message: "不正解です。残り試行回数: 2回" } を返す
  │
  ▼
QuestionForm.tsx
  │
  │ result.success === false
  │ └─ エラーメッセージを表示
  │
  ▼
ユーザーに通知
```

---

## 6. 制限付き記事の閲覧（認証済み）

### フロー図

```
ブラウザ
  │
  │ GET /blogs/restricted-article
  │ Cookie: blog_auth=welcome,restricted-article
  │
  ▼
Next.js Server
  │
  │ app/blogs/[slug]/page.tsx
  │ ├─ getPostBySlug("restricted-article")
  │ └─ isAuthenticated("restricted-article")
  │
  ▼
lib/utils/auth.ts
  │
  │ isAuthenticated("restricted-article")
  │ ├─ Cookie "blog_auth" を取得
  │ ├─ 値: "welcome,restricted-article"
  │ ├─ split(',') → ["welcome", "restricted-article"]
  │ └─ "restricted-article" が含まれる → true を返す
  │
  ▼
Next.js Server
  │
  │ app/blogs/[slug]/page.tsx
  │ ├─ authenticated === true
  │ └─ 記事本文を返す
  │
  ▼
ブラウザ
  │
  │ 記事本文を表示
  │
  ▼
表示完了
```

---

## データ変換フロー

### Markdown → HTML 変換

```
posts/restricted-article.md
  │
  │ ファイル内容:
  │ ---
  │ title: "制限付き記事サンプル"
  │ requiresAuth: true
  │ questionSetId: "tcu-basic"
  │ ---
  │ # 制限付き記事
  │ この記事は...
  │
  ▼
gray-matter
  │
  │ フロントマターと本文を分離
  │ ├─ data: { title: "...", requiresAuth: true, ... }
  │ └─ content: "# 制限付き記事\nこの記事は..."
  │
  ▼
remark().use(remarkHtml)
  │
  │ Markdown → HTML 変換
  │ └─ "<h1>制限付き記事</h1>\n<p>この記事は...</p>"
  │
  ▼
PostMeta & { content: string }
  │
  │ {
  │   slug: "restricted-article",
  │   title: "制限付き記事サンプル",
  │   requiresAuth: true,
  │   questionSetId: "tcu-basic",
  │   content: "<h1>制限付き記事</h1>..."
  │ }
  │
  ▼
Server Component
```

---

## Cookie の状態遷移

### 認証 Cookie (blog_auth)

```
初回アクセス:
  Cookie なし
  ↓
  質問フォーム表示
  ↓
  正解を入力
  ↓
  Cookie: blog_auth=restricted-article
  ↓
  2つ目の記事も認証
  ↓
  Cookie: blog_auth=restricted-article,another-article
```

### レート制限 Cookie (rate_limit_{slug})

```
初回試行:
  Cookie なし
  ↓
  不正解
  ↓
  Cookie: rate_limit_restricted-article={"attempts":1}
  ↓
  2回目不正解
  ↓
  Cookie: rate_limit_restricted-article={"attempts":2}
  ↓
  ...
  ↓
  5回目不正解
  ↓
  Cookie: rate_limit_restricted-article={"attempts":5,"lockedUntil":1700000000}
  ↓
  15分後、Cookie 期限切れ
  ↓
  Cookie なし（リセット）
```

---

## エラーハンドリングフロー

### 記事が見つからない場合

```
GET /blogs/non-existent
  ↓
getPostBySlug("non-existent")
  ↓
null を返す
  ↓
app/blogs/[slug]/page.tsx
  ↓
notFound() を呼び出し
  ↓
Next.js 404 ページを表示
```

### 質問セットが見つからない場合

```
requiresAuth: true
questionSetId: "invalid-set"
  ↓
questionConfig["invalid-set"]
  ↓
undefined
  ↓
エラーメッセージを表示:
"質問が設定されていません。"
```

### 暗号化キーが設定されていない場合

```
encrypt() または decrypt() を呼び出し
  ↓
process.env.ENCRYPTION_KEY が未定義
  ↓
throw new Error("ENCRYPTION_KEY is not defined")
  ↓
サーバーエラー（500）
```

---

## パフォーマンス最適化

### Static Site Generation (SSG)

```
ビルド時:
  generateStaticParams()
  ↓
  全記事の slug を取得
  ["welcome", "restricted-article"]
  ↓
  各 slug について静的 HTML を生成
  /blogs/welcome → welcome.html
  /blogs/restricted-article → restricted-article.html
  ↓
  Vercel CDN にデプロイ

実行時:
  GET /blogs/welcome
  ↓
  CDN から welcome.html を配信
  ↓
  超高速表示（サーバー処理なし）
```

---

## 関連ドキュメント

- [システム概要](./overview.md) - 全体アーキテクチャ
- [セキュリティモデル](./security.md) - セキュリティ設計
- [Server Actions リファレンス](../reference/server-actions.md) - validateAnswers の詳細
- [ユーティリティ関数リファレンス](../reference/utilities.md) - 各関数の仕様
