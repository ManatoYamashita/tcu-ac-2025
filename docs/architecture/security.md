# セキュリティモデル

このドキュメントでは、manapuraza blog のセキュリティ設計について詳しく説明します。

## セキュリティ原則

このシステムは以下の原則に基づいて設計されています：

1. **多層防御（Defense in Depth）**: 複数のセキュリティ層で保護
2. **最小権限の原則**: 必要最小限の権限のみを付与
3. **サーバーサイド検証**: 重要な処理はサーバーで実行
4. **暗号化による保護**: 機密データは暗号化して保存

## セキュリティアーキテクチャ

### 多層防御モデル

```
┌─────────────────────────────────────────┐
│ Layer 1: レート制限                      │
│ - ブルートフォース攻撃の防止              │
│ - 5回失敗で15分ロック                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Layer 2: サーバーサイド検証               │
│ - Server Actions による処理               │
│ - クライアントから正解データを隠蔽         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Layer 3: 暗号化                          │
│ - AES-256-CBC による正解の暗号化          │
│ - 環境変数による鍵管理                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Layer 4: 認証状態管理                    │
│ - HttpOnly Cookie による状態保存          │
│ - SameSite 属性による CSRF 対策          │
└─────────────────────────────────────────┘
```

## 1. 暗号化システム

### AES-256-CBC 暗号化

**アルゴリズム:** Advanced Encryption Standard (AES)
**モード:** Cipher Block Chaining (CBC)
**鍵長:** 256 ビット
**IV長:** 128 ビット（ランダム生成）

### 暗号化の実装

```typescript
// lib/utils/crypto.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits / 8 = 32 bytes

export function encrypt(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}
```

### 暗号化フォーマット

```
{IV}:{暗号化されたデータ}
└─┬─┘ └────────┬─────────┘
  │           │
  │           └─ 暗号化されたテキスト（HEX）
  │
  └─ 初期化ベクトル IV（HEX、16バイト = 32文字）

例: "a1b2c3d4...f0e1d2c3:9f8e7d6c...a5b4c3d2"
```

### 鍵管理

**開発環境:**
```bash
# .env.local
ENCRYPTION_KEY=aedb4c5529175dcef34d6d5aa21b0f18162955d9fd4c2571cf5bdd05724579a7
```

**本番環境:**
- Vercel の環境変数として設定
- 開発環境と同じ鍵を使用（重要）

**鍵のローテーション:**
鍵を変更すると既存の暗号化データが復号化できなくなるため、以下の手順が必要です：

1. 全ての暗号化された回答を復号化
2. 新しい鍵を生成
3. 全ての回答を新しい鍵で再暗号化
4. 環境変数を更新
5. デプロイ

### セキュリティ上の考慮事項

**✓ 採用している対策:**
- ランダムな IV の使用（毎回異なる暗号文を生成）
- 256ビット鍵の使用（十分な鍵長）
- 環境変数による鍵の分離（ソースコードに含めない）

**✗ このシステムでは対応していない脅威:**
- サーバーへの不正アクセス（環境変数が漏洩した場合）
- 鍵漏洩時の検知機能
- 鍵の自動ローテーション

## 2. 認証・認可システム

### Cookie ベース認証

**Cookie 仕様:**

| 属性 | 値 | 説明 |
|------|-----|------|
| 名前 | `blog_auth` | 認証状態を保存 |
| 値 | `"slug1,slug2,slug3"` | 認証済み記事のスラグリスト |
| HttpOnly | `true` | JavaScript からアクセス不可 |
| Secure | `true` (本番のみ) | HTTPS 通信のみ |
| SameSite | `Strict` | CSRF 攻撃対策 |
| Max-Age | `2592000` (30日) | 有効期限 |
| Path | `/` | サイト全体で有効 |

### 実装

```typescript
// lib/utils/auth.ts

export async function setAuthCookie(slug: string): Promise<void> {
  const cookieStore = await cookies();
  const currentAuth = cookieStore.get('blog_auth')?.value || '';
  const authenticatedSlugs = currentAuth ? currentAuth.split(',') : [];

  if (!authenticatedSlugs.includes(slug)) {
    authenticatedSlugs.push(slug);
  }

  cookieStore.set('blog_auth', authenticatedSlugs.join(','), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30日
    path: '/'
  });
}
```

### セキュリティ上の利点

1. **XSS 攻撃対策**: HttpOnly により JavaScript からアクセス不可
2. **CSRF 攻撃対策**: SameSite=Strict により他サイトからのリクエストを拒否
3. **中間者攻撃対策**: Secure 属性により HTTPS 通信を強制（本番環境）

### 認証フロー

```
1. ユーザーが正解を入力
   ↓
2. Server Action で検証
   ↓ (正解の場合)
3. setAuthCookie(slug) を呼び出し
   ↓
4. Cookie に slug を追加
   "article1" → "article1,article2"
   ↓
5. クライアントに成功レスポンス
   ↓
6. ページリロード
   ↓
7. isAuthenticated(slug) で Cookie をチェック
   ↓ (認証済みの場合)
8. 記事本文を表示
```

## 3. レート制限システム

### 目的

ブルートフォース攻撃（総当たり攻撃）を防止します。

### 設定

```typescript
// lib/utils/rate-limit.ts

const MAX_ATTEMPTS = 5;        // 最大試行回数
const LOCK_DURATION = 15 * 60; // ロック期間（秒）= 15分
```

### 実装方式

Cookie ベースのレート制限を採用しています。

**Cookie 仕様:**

| 属性 | 値 |
|------|-----|
| 名前 | `rate_limit_{slug}` |
| 値 | `{"attempts": 3, "lockedUntil": 1234567890}` |
| HttpOnly | `true` |
| Max-Age | `900` (15分) |

**データ構造:**

```typescript
type RateLimitData = {
  attempts: number;      // 失敗回数
  lockedUntil?: number;  // ロック解除時刻（UNIX タイムスタンプ）
}
```

### レート制限フロー

```
初回試行:
  attempts: 0
  ↓ 不正解
  attempts: 1
  ↓ 不正解
  attempts: 2
  ↓ 不正解
  attempts: 3
  ↓ 不正解
  attempts: 4
  ↓ 不正解
  attempts: 5, lockedUntil: 現在時刻 + 900秒
  ↓
  [15分間ロック]
  ↓
  Cookie 期限切れ（自動的にリセット）
```

### 回避策とその対策

**潜在的な回避策:**
1. Cookie の削除
   - → 開発者ツールで削除可能
   - → 本番環境では HttpOnly により JavaScript からは削除不可

2. プライベートブラウジング
   - → Cookie が保存されないため、毎回リセット
   - → 対策: IP アドレスベースのレート制限（将来の拡張）

3. 複数ブラウザの使用
   - → 各ブラウザで独立した Cookie
   - → 対策: IP アドレスベースのレート制限（将来の拡張）

### 改善案

現在の Cookie ベースのレート制限には限界があります。より強固な対策として：

```typescript
// 将来の実装案: IP アドレスベースのレート制限

import { headers } from 'next/headers';

export async function checkRateLimitByIP(slug: string): Promise<number> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ||
             headersList.get('x-real-ip') ||
             'unknown';

  // Redis や データベースに IP アドレスごとの試行回数を保存
  // ...
}
```

## 4. サーバーサイド検証

### Server Actions の使用

回答の検証は必ずサーバーサイドで実行されます。

```typescript
// app/actions/validate-answer.ts
'use server';

export async function validateAnswers(
  slug: string,
  questionSetId: string,
  answers: UserAnswer[]
): Promise<ValidateResult> {
  // 1. レート制限チェック
  const remainingAttempts = await checkRateLimit(slug);
  if (remainingAttempts === 0) {
    return { success: false, message: '...' };
  }

  // 2. 質問セット取得（サーバーサイドのみ）
  const questionSet = questionConfig[questionSetId];

  // 3. 暗号化された正解を復号化
  const decryptedAnswers = questionSet.questions.map(q => ({
    id: q.id,
    correctAnswer: decrypt(q.encryptedAnswer),
    caseSensitive: q.caseSensitive ?? false
  }));

  // 4. 回答を検証
  // ...
}
```

### クライアントに送られるデータ

**送信されるデータ (ClientQuestion):**
```typescript
{
  id: "q1",
  text: "質問文",
  type: "text",
  options: ["選択肢1", "選択肢2"]  // choice タイプの場合のみ
  // encryptedAnswer は含まれない
  // caseSensitive は含まれない
}
```

**送信されないデータ:**
- `encryptedAnswer`: 暗号化された正解
- `caseSensitive`: 大文字小文字の区別設定

これにより、クライアント側で正解を推測することはできません。

## 5. CSRF 対策

### Next.js の組み込み CSRF 保護

Next.js 16 の Server Actions には、組み込みの CSRF 保護機能があります：

1. **Origin チェック**: リクエストの Origin ヘッダーを検証
2. **SameSite Cookie**: `SameSite=Strict` により他サイトからのリクエストを拒否

### 実装

特別な実装は不要です。Next.js が自動的に CSRF トークンを管理します。

## 6. XSS 対策

### React の自動エスケープ

React は自動的に XSS を防止しますが、以下の点に注意が必要です：

**✓ 安全な使用:**
```tsx
<h1>{post.title}</h1>  // 自動エスケープ
```

**✗ 危険な使用（現在の実装）:**
```tsx
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```

### 改善案

Markdown → HTML 変換時に、信頼できる HTML のみを許可：

```typescript
// 改善案: sanitize-html を使用
import sanitizeHtml from 'sanitize-html';

const sanitizedContent = sanitizeHtml(post.content, {
  allowedTags: ['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
  allowedAttributes: {
    'a': ['href']
  }
});
```

## 7. 環境変数の管理

### 秘密情報の分離

```
開発環境:
  .env.local (gitignore に含まれる)
  ├── ENCRYPTION_KEY
  └── その他の秘密情報

本番環境:
  Vercel Environment Variables
  ├── ENCRYPTION_KEY (Production, Preview, Development)
  └── その他の秘密情報
```

### ベストプラクティス

1. **絶対に公開しない:**
   - `.env.local` をコミットしない
   - ログに出力しない
   - エラーメッセージに含めない

2. **アクセス制限:**
   - 環境変数へのアクセスは最小限に
   - 本番環境の環境変数は信頼できる開発者のみがアクセス

3. **定期的な見直し:**
   - 使用されていない環境変数を削除
   - 鍵の強度を定期的に確認

## セキュリティ上の制限事項

このシステムには以下の制限事項があります：

### 1. Cookie ベースのレート制限

**制限:**
- Cookie を削除すれば回数制限をリセットできる
- IP アドレスベースの制限がない

**影響度:** 中
**緩和策:** 質問の難易度を適切に設定し、総当たり攻撃を実質的に困難にする

### 2. 静的な暗号化鍵

**制限:**
- 鍵のローテーション機能がない
- 鍵が漏洩した場合の対応が困難

**影響度:** 高
**緩和策:** 環境変数の厳重な管理、アクセス権限の最小化

### 3. クライアントサイドのリロード

**制限:**
- 認証成功後、クライアント側で `window.location.reload()` を実行
- この間に認証状態が変更される可能性（極めて低い）

**影響度:** 低
**緩和策:** 現状で問題なし

## セキュリティチェックリスト

デプロイ前に以下を確認してください：

- [ ] `ENCRYPTION_KEY` が本番環境に設定されている
- [ ] `ENCRYPTION_KEY` が開発環境と同じである
- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] 本番環境で `Secure` Cookie が有効である
- [ ] 質問の正解が暗号化されている
- [ ] `questions.ts` に平文の正解が含まれていない
- [ ] エラーメッセージに機密情報が含まれていない

## 関連ドキュメント

- [システム概要](./overview.md) - 全体アーキテクチャ
- [データフロー](./data-flow.md) - 処理の流れ
- [Server Actions リファレンス](../reference/server-actions.md) - API 仕様
- [ユーティリティ関数リファレンス](../reference/utilities.md) - 暗号化関数など
