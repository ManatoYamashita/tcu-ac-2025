import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { isAuthenticated } from '@/lib/utils/auth';
import { questionConfig } from '@/lib/config/questions';
import QuestionForm from './_components/QuestionForm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateBlogPostingJsonLd, generateBreadcrumbJsonLd } from '@/lib/utils/json-ld';

type Props = {
  params: Promise<{ slug: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: '記事が見つかりません',
      description: '指定された記事は存在しません。',
    };
  }

  const pageUrl = `${baseUrl}/blogs/${slug}`;
  const description = `${post.title} - ${post.categories.join(', ')} | manapuraza blog`;

  return {
    title: post.title,
    description,
    keywords: [...post.categories, '技術ブログ', 'プログラミング'],
    authors: [{ name: 'Manato Yamashita' }],
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: pageUrl,
      publishedTime: post.date,
      authors: ['Manato Yamashita'],
      tags: post.categories,
      siteName: 'manapuraza blog',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
    alternates: {
      canonical: `/blogs/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // 認証チェック
  const authenticated = post.requiresAuth ? await isAuthenticated(slug) : true;

  // 認証が必要で、かつ未認証の場合は質問フォーム表示
  if (post.requiresAuth && !authenticated) {
    const questionSetId = post.questionSetId!;
    const questionSet = questionConfig[questionSetId];

    if (!questionSet) {
      return <div>質問が設定されていません。</div>;
    }

    // クライアントに送る質問データ（正解を除外）
    const clientQuestions = questionSet.questions.map((q) => ({
      id: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      type: q.type,
      options: q.options,
    }));

    return <QuestionForm slug={slug} questionSetId={questionSetId} questions={clientQuestions} />;
  }

  // 認証済み、または制限なしの場合は記事本文を表示
  const blogPostingJsonLd = generateBlogPostingJsonLd({
    title: post.title,
    description: `${post.title} - ${post.categories.join(', ')}`,
    slug,
    date: post.date,
    categories: post.categories,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd({
    slug,
    title: post.title,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-2">{post.date}</p>
        <div className="flex gap-2 mb-8">
          {post.categories.map((cat) => (
            <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {cat}
            </span>
          ))}
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-8 pt-8 border-t">
          <a href="/blogs" className="text-blue-600 hover:underline">
            ← 記事一覧に戻る
          </a>
        </div>
      </article>
    </>
  );
}
