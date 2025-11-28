import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { PostMeta } from '@/lib/types';

const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * 全記事のメタデータを取得
 */
export async function getAllPosts(): Promise<PostMeta[]> {
  // postsディレクトリが存在しない場合は空配列を返す
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);

  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || '',
        categories: data.categories || [],
        requiresAuth: data.requiresAuth || false,
        questionSetId: data.questionSetId,
      } as PostMeta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1)); // 日付降順

  return posts;
}

/**
 * 特定のslugの記事を取得
 */
export async function getPostBySlug(slug: string): Promise<(PostMeta & { content: string }) | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // MarkdownをHTMLに変換
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || '',
      categories: data.categories || [],
      requiresAuth: data.requiresAuth || false,
      questionSetId: data.questionSetId,
      content: contentHtml,
    };
  } catch {
    return null;
  }
}
