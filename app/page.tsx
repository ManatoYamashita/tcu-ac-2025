import Link from 'next/link';
import type { Metadata } from 'next';

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
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">manapuraza blog</h1>
      <p className="text-lg mb-4">技術ブログへようこそ</p>
      <Link
        href="/blogs"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        記事一覧を見る
      </Link>
    </main>
  );
}
