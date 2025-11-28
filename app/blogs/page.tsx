import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default async function BlogListPage() {
  const posts = await getAllPosts();

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">記事一覧</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600">記事がまだありません。</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-sm text-gray-600">{post.date}</p>
                  <div className="flex gap-2 mt-2">
                    {post.categories.map((cat) => (
                      <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                {post.requiresAuth && (
                  <span className="text-2xl">🔒</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← トップページに戻る
        </Link>
      </div>
    </main>
  );
}
