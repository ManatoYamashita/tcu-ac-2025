import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: '記事一覧',
  description: 'manapuraza blog の技術記事一覧。Web開発、プログラミング、技術に関する記事を掲載しています。',
  openGraph: {
    title: '記事一覧 | manapuraza blog',
    description: 'manapuraza blog の技術記事一覧。Web開発、プログラミング、技術に関する記事を掲載しています。',
    url: `${baseUrl}/blogs`,
    type: 'website',
  },
  alternates: {
    canonical: '/blogs',
  },
};

export default async function BlogListPage() {
  const posts = await getAllPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-6 lg:py-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="inline-block font-bold text-4xl lg:text-5xl">記事一覧</h1>
            <p className="text-xl text-muted-foreground">
              Web開発、プログラミング、技術に関する記事を掲載しています。
            </p>
          </div>
        </div>
        <hr className="my-8" />
        {posts.length === 0 ? (
          <p className="text-muted-foreground">記事がまだありません。</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blogs/${post.slug}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      {post.requiresAuth && (
                        <Lock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>{post.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Button variant="ghost" asChild>
            <Link href="/">← トップページに戻る</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
