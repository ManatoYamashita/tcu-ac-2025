import { cookies } from 'next/headers';

/**
 * 認証Cookie名
 */
const AUTH_COOKIE_NAME = 'blog_auth';

/**
 * Cookieに記事のslugを保存（認証済みとしてマーク）
 * @param slug 記事のslug
 */
export async function setAuthCookie(slug: string): Promise<void> {
  const cookieStore = await cookies();

  // 既存の認証済みslugリストを取得
  const existingAuth = cookieStore.get(AUTH_COOKIE_NAME)?.value || '';
  const authList = existingAuth ? existingAuth.split(',') : [];

  // 重複を避けて追加
  if (!authList.includes(slug)) {
    authList.push(slug);
  }

  // Cookieに保存
  cookieStore.set(AUTH_COOKIE_NAME, authList.join(','), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30日間有効
    path: '/',
  });
}

/**
 * 指定された記事が認証済みかチェック
 * @param slug 記事のslug
 * @returns 認証済みならtrue
 */
export async function isAuthenticated(slug: string): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value || '';
  const authList = authCookie.split(',');

  return authList.includes(slug);
}

/**
 * 認証Cookieをクリア（ログアウト）
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
