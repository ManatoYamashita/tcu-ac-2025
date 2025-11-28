import { cookies } from 'next/headers';

const RATE_LIMIT_COOKIE_NAME = 'rate_limit';
const MAX_ATTEMPTS = 5; // 最大試行回数
const LOCK_DURATION = 15 * 60 * 1000; // 15分（ミリ秒）

type RateLimitData = {
  attempts: number;
  lockedUntil?: number; // ロック解除時刻（UNIXタイムスタンプ）
};

/**
 * レートリミット状態を取得
 */
async function getRateLimitData(slug: string): Promise<RateLimitData> {
  const cookieStore = await cookies();
  const rateLimitCookie = cookieStore.get(`${RATE_LIMIT_COOKIE_NAME}_${slug}`)?.value;

  if (!rateLimitCookie) {
    return { attempts: 0 };
  }

  try {
    return JSON.parse(rateLimitCookie);
  } catch {
    return { attempts: 0 };
  }
}

/**
 * レートリミット状態を保存
 */
async function setRateLimitData(slug: string, data: RateLimitData): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(`${RATE_LIMIT_COOKIE_NAME}_${slug}`, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: LOCK_DURATION / 1000, // 秒単位
    path: '/',
  });
}

/**
 * レートリミットチェック
 * @returns ロック中の場合、ロック解除までの残り時間（秒）を返す。ロックされていない場合は0
 */
export async function checkRateLimit(slug: string): Promise<number> {
  const data = await getRateLimitData(slug);

  // ロック中かチェック
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    return Math.ceil((data.lockedUntil - Date.now()) / 1000); // 残り秒数
  }

  return 0;
}

/**
 * 不正解時にレートリミットを更新
 */
export async function incrementFailedAttempts(slug: string): Promise<void> {
  const data = await getRateLimitData(slug);

  data.attempts += 1;

  // 最大試行回数を超えたらロック
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCK_DURATION;
  }

  await setRateLimitData(slug, data);
}

/**
 * 正解時にレートリミットをリセット
 */
export async function resetRateLimit(slug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(`${RATE_LIMIT_COOKIE_NAME}_${slug}`);
}
