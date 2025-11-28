const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// WebSite 構造化データ（サイト全体）
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'manapuraza blog',
    url: baseUrl,
    description: 'Markdownベースの技術ブログ - Web開発、プログラミング、技術記事を発信',
    publisher: {
      '@type': 'Person',
      name: 'Manato Yamashita',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/blogs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// BlogPosting 構造化データ（記事ページ）
export function generateBlogPostingJsonLd({
  title,
  description,
  slug,
  date,
  categories,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  categories: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: `${baseUrl}/blogs/${slug}`,
    datePublished: date,
    dateModified: date,
    author: {
      '@type': 'Person',
      name: 'Manato Yamashita',
    },
    publisher: {
      '@type': 'Person',
      name: 'Manato Yamashita',
    },
    keywords: categories.join(', '),
    articleSection: categories[0] || '技術',
    inLanguage: 'ja-JP',
  };
}

// BreadcrumbList 構造化データ（パンくずリスト）
export function generateBreadcrumbJsonLd({
  slug,
  title,
}: {
  slug?: string;
  title?: string;
}) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '記事一覧',
      item: `${baseUrl}/blogs`,
    },
  ];

  if (slug && title) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: title,
      item: `${baseUrl}/blogs/${slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
