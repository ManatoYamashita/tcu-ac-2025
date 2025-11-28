import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { isAuthenticated } from '@/lib/utils/auth';
import { questionConfig } from '@/lib/config/questions';
import QuestionForm from './_components/QuestionForm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generateBlogPostingJsonLd, generateBreadcrumbJsonLd } from '@/lib/utils/json-ld';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-6 lg:py-10">
          <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
            <h1 className="mb-2">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <time dateTime={post.date}>{post.date}</time>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {post.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
            <Separator className="my-4" />
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
          <div className="max-w-3xl mx-auto mt-8 pt-8 border-t">
            <Button variant="ghost" asChild>
              <Link href="/blogs">← 記事一覧に戻る</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
