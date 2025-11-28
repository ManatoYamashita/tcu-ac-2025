import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'ホーム',
  description: 'manapuraza blog - Markdownベースの技術ブログ。Web開発、プログラミング、技術記事を発信しています。',
  openGraph: {
    title: 'manapuraza blog',
    description: 'Markdownベースの技術ブログ - Web開発、プログラミング、技術記事を発信',
    url: baseUrl,
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-center gap-2">
            <h1 className="text-center text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              manapuraza blog
            </h1>
            <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
              Markdownベースの技術ブログ。Web開発、プログラミング、技術記事を発信しています。
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/blogs">記事一覧を見る</Link>
            </Button>
          </div>
        </section>
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>技術記事</CardTitle>
                <CardDescription>
                  Web開発に関する最新の技術記事を発信
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Next.js、React、TypeScriptなど、モダンなWeb開発技術について解説します。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>プログラミング</CardTitle>
                <CardDescription>
                  実践的なコーディングテクニック
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  実際のプロジェクトで使える、実践的なプログラミング手法を紹介します。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>ベストプラクティス</CardTitle>
                <CardDescription>
                  開発現場で役立つノウハウ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  設計パターン、テスト手法、パフォーマンス最適化など、実務で使える知識を共有します。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
