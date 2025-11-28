# SEO設定ガイド

このガイドでは、manapuraza blog のSEO（検索エンジン最適化）設定について説明します。

## 🎯 SEO機能の概要

本ブログには、以下のSEO機能が実装されています：

| 機能 | 説明 | ファイル |
|:---|:---|:---|
| **メタデータ** | OGP, Twitter Card, robots指示 | `app/layout.tsx`, 各ページ |
| **sitemap.xml** | 全ページの構造を検索エンジンに通知 | `app/sitemap.ts` |
| **robots.txt** | クローラーの制御 | `app/robots.ts` |
| **OGP画像** | SNSシェア時の画像自動生成 | `app/opengraph-image.tsx` |
| **JSON-LD** | 構造化データでリッチスニペット対応 | `lib/utils/json-ld.ts` |

## 🔧 環境変数の設定

### NEXT_PUBLIC_BASE_URL

全てのSEO機能で使用するベースURLを設定します。

#### ローカル環境

`.env` または `.env.local` に設定：

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### 本番環境（Vercel）

Vercelの環境変数に設定：

```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

**重要:** 本番環境では必ず `https://` から始まるURLを設定してください。

## 📄 メタデータの仕組み

### ルートレイアウト（全ページ共通）

`app/layout.tsx` で設定されている全ページ共通のメタデータ：

```typescript
export const metadata: Metadata = {
  title: {
    default: 'manapuraza blog',
    template: '%s | manapuraza blog', // 各ページで title が設定されると自動的に付与
  },
  description: 'Markdownベースの技術ブログ',
  keywords: ['技術ブログ', 'Web開発', 'プログラミング'],
  authors: [{ name: 'Manato Yamashita' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'manapuraza blog',
    // ...
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ManatoYamashita',
    // ...
  },
};
```

### ページ固有のメタデータ

各ページで `metadata` をエクスポートすることで、個別のメタデータを設定できます。

#### 静的ページの例（app/page.tsx）

```typescript
export const metadata: Metadata = {
  title: 'ホーム',
  description: 'manapuraza blog のホームページ',
  openGraph: {
    title: 'manapuraza blog',
    url: `${baseUrl}`,
  },
};
```

#### 動的ページの例（app/blogs/[slug]/page.tsx）

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return {
    title: post.title,
    description: `${post.title} - ${post.categories.join(', ')}`,
    openGraph: {
      type: 'article',
      publishedTime: post.date,
      tags: post.categories,
    },
  };
}
```

### メタデータの継承

- ルートレイアウトで設定した内容が全ページに適用される
- 各ページで設定した内容が優先される
- `title.template` により、各ページのタイトルに自動的にサイト名が付与される

**例:**
- ページで `title: "記事タイトル"` を設定
- 実際の `<title>` タグ: `記事タイトル | manapuraza blog`

## 🗺️ sitemap.xml の仕組み

### 自動生成されるsitemap

`app/sitemap.ts` により、以下のページが自動的にsitemapに含まれます：

1. トップページ (`/`)
2. 記事一覧ページ (`/blogs`)
3. 全ての記事ページ (`/blogs/[slug]`)

### sitemap の優先度設定

```typescript
// トップページ: 最高優先度
{
  url: baseUrl,
  priority: 1.0,
  changeFrequency: 'daily',
}

// 記事一覧: 高優先度
{
  url: `${baseUrl}/blogs`,
  priority: 0.9,
  changeFrequency: 'daily',
}

// 個別記事: 中優先度
{
  url: `${baseUrl}/blogs/${slug}`,
  priority: 0.8,
  changeFrequency: 'weekly',
  lastModified: new Date(post.date),
}
```

### sitemapの確認方法

開発環境:
```
http://localhost:3000/sitemap.xml
```

本番環境:
```
https://your-domain.com/sitemap.xml
```

## 🤖 robots.txt の設定

### クローラー制御

`app/robots.ts` により、以下の設定が適用されます：

```typescript
{
  rules: [
    {
      userAgent: '*',           // 全てのクローラー
      allow: '/',               // ルート以下を許可
      disallow: [
        '/api/',                // APIエンドポイントを除外
        '/_next/',              // Next.jsの内部ファイルを除外
        '/private/',            // プライベートディレクトリを除外
      ],
    },
  ],
  sitemap: `${baseUrl}/sitemap.xml`, // sitemapの位置を通知
}
```

### robots.txtの確認方法

開発環境:
```
http://localhost:3000/robots.txt
```

本番環境:
```
https://your-domain.com/robots.txt
```

## 🖼️ OGP画像の自動生成

### OGP画像とは

OGP（Open Graph Protocol）画像は、SNS（Twitter, Facebook, LINE等）でリンクをシェアした時に表示される画像です。

### 実装内容

`app/opengraph-image.tsx` により、動的にOGP画像が生成されます：

- **サイズ**: 1200x630px（Twitter/Facebook推奨サイズ）
- **形式**: PNG
- **デザイン**: グラデーション背景 + サイト名

### 確認方法

開発環境:
```
http://localhost:3000/opengraph-image
```

### SNSでの表示確認ツール

- **Twitter**: https://cards-validator.twitter.com/
- **Facebook**: https://developers.facebook.com/tools/debug/

使い方:
1. 上記ツールにアクセス
2. 記事のURLを入力
3. プレビューを確認

## 📊 JSON-LD構造化データ

### 構造化データとは

JSON-LD形式の構造化データを設置することで、Googleなどの検索エンジンがコンテンツをより正確に理解し、リッチスニペット（検索結果の拡張表示）として表示される可能性が高まります。

### 実装されている構造化データ

#### 1. WebSite（サイト全体）

`app/layout.tsx` に設置：

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "manapuraza blog",
  "url": "https://your-domain.com",
  "description": "Markdownベースの技術ブログ"
}
```

#### 2. BlogPosting（記事ページ）

`app/blogs/[slug]/page.tsx` に設置：

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "記事タイトル",
  "description": "記事の説明",
  "datePublished": "2025-11-28",
  "author": {
    "@type": "Person",
    "name": "Manato Yamashita"
  }
}
```

#### 3. BreadcrumbList（パンくずリスト）

`app/blogs/[slug]/page.tsx` に設置：

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "https://your-domain.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "記事一覧",
      "item": "https://your-domain.com/blogs"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "記事タイトル",
      "item": "https://your-domain.com/blogs/article-slug"
    }
  ]
}
```

### 構造化データの確認方法

**Googleリッチリザルトテスト:**
https://search.google.com/test/rich-results

1. 上記ツールにアクセス
2. 記事のURLを入力
3. 「URLをテスト」をクリック
4. 検出された構造化データを確認

## 📈 Google Search Console への登録

### 登録手順

1. **Google Search Consoleにアクセス**
   https://search.google.com/search-console

2. **プロパティを追加**
   - 「プロパティを追加」をクリック
   - 「URLプレフィックス」を選択
   - サイトのURL（`https://your-domain.com`）を入力

3. **所有権の確認**
   - Vercelの場合、DNSレコードでの確認が推奨
   - 提供されたTXTレコードをDNS設定に追加

4. **sitemapを送信**
   - 左メニューから「サイトマップ」を選択
   - `https://your-domain.com/sitemap.xml` を入力
   - 「送信」をクリック

### 確認できる情報

- 検索パフォーマンス（クリック数、表示回数、CTR、掲載順位）
- インデックス登録状況
- モバイルユーザビリティ
- Core Web Vitals
- セキュリティの問題

## ✅ SEOチェックリスト

### デプロイ前の確認

- [ ] `NEXT_PUBLIC_BASE_URL` が正しく設定されている
- [ ] sitemap.xml が正しく生成される（全ページが含まれている）
- [ ] robots.txt が正しく生成される
- [ ] OGP画像が表示される
- [ ] 各ページにメタデータが設定されている
- [ ] 構造化データが正しく設置されている

### デプロイ後の確認

- [ ] sitemap.xml にアクセスできる
- [ ] robots.txt にアクセスできる
- [ ] OGP画像が表示される
- [ ] TwitterカードバリデータでOGP確認
- [ ] FacebookデバッガーでOGP確認
- [ ] Googleリッチリザルトテストで構造化データ確認
- [ ] Google Search Console にsitemap送信

## 🎨 カスタマイズ方法

### サイト名の変更

`app/layout.tsx` の `metadata` を編集：

```typescript
export const metadata: Metadata = {
  title: {
    default: 'あなたのブログ名',
    template: '%s | あなたのブログ名',
  },
  openGraph: {
    siteName: 'あなたのブログ名',
  },
};
```

### OGP画像のデザイン変更

`app/opengraph-image.tsx` を編集：

```tsx
<div
  style={{
    background: 'linear-gradient(135deg, #your-color1 0%, #your-color2 100%)',
    // その他のスタイル...
  }}
>
  <div>あなたのブログ名</div>
</div>
```

### Twitter IDの設定

`app/layout.tsx` の `twitter.creator` を変更：

```typescript
twitter: {
  card: 'summary_large_image',
  creator: '@YourTwitterHandle',
},
```

## 📊 SEOパフォーマンスの測定

### Lighthouse CI

本プロジェクトでは、GitHub Actionsにより自動的にLighthouse CIが実行されます。

- **対象ページ**: `/`, `/blogs`
- **必須スコア**: Performance 90%以上
- **設定ファイル**: `lighthouserc.js`

詳細は [CI/CDガイド](../dev/ci-cd.md) を参照してください。

### Core Web Vitals

以下の指標を監視してください：

| 指標 | 目標 | 説明 |
|:---|:---|:---|
| LCP | < 2.5s | 最大コンテンツの描画 |
| FID | < 100ms | 初回入力遅延 |
| CLS | < 0.1 | 累積レイアウトシフト |

## 🔍 トラブルシューティング

### Q: OGP画像がSNSで表示されない

**A:** 以下を確認してください：
- `NEXT_PUBLIC_BASE_URL` が本番URLに設定されているか
- キャッシュの問題（SNSのキャッシュクリアツールを使用）
- 画像が実際に生成されているか（`/opengraph-image` にアクセス）

### Q: sitemap.xmlが空

**A:** 以下を確認してください：
- `posts/` ディレクトリに記事ファイルが存在するか
- フロントマターが正しいか
- ビルドが正常に完了しているか

### Q: Google Search Console でエラーが出る

**A:** よくあるエラー：
- **「送信されたURLにnoindexタグが追加されています」**: `app/layout.tsx` の `robots` 設定を確認
- **「サイトマップが取得できません」**: URLが正しいか、アクセス制限がないか確認

### Q: 構造化データがリッチリザルトテストで検出されない

**A:** 以下を確認してください：
- JavaScriptが正しく実行されているか
- JSON-LDの形式が正しいか（カンマ、括弧の位置）
- ページが正常にレンダリングされているか

## 📚 参考リンク

- [Google検索セントラル](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

さらに詳しい情報が必要な場合は、[トラブルシューティング](./troubleshooting.md)を参照してください。
