import Link from 'next/link';

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
