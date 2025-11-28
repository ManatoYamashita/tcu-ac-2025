# ユーティリティ関数リファレンス

このドキュメントでは、`lib/utils/` 配下のユーティリティ関数の詳細を説明します。

## 目次

- [暗号化関数 (crypto.ts)](#暗号化関数-cryptots)
- [認証関数 (auth.ts)](#認証関数-authts)
- [レート制限関数 (rate-limit.ts)](#レート制限関数-rate-limitts)

---

## 暗号化関数 (crypto.ts)

### 概要

AES-256-CBC アルゴリズムを使用した暗号化・復号化機能を提供します。

**定義場所:** `lib/utils/crypto.ts`

### 定数

```typescript
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;  // 256 bits
const IV_LENGTH = 16;   // 128 bits
```

---

### encrypt()

文字列を暗号化します。

#### シグネチャ

```typescript
export function encrypt(text: string): string
```

#### パラメータ

- **text** (string): 暗号化する平文

#### 戻り値

`"iv:encryptedData"` 形式の文字列（両方とも HEX エンコード）

**例:**
```
"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6:q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
│                                  │                                  │
└─ IV (32文字)                     └─ 暗号化データ (可変長)
```

#### 使用例

```typescript
import { encrypt } from '@/lib/utils/crypto';

const plainText = "TCU";
const encrypted = encrypt(plainText);

console.log(encrypted);
// 出力例: "3f2a1b4c5d6e7f8g9h0i1j2k3l4m5n6o:7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e"
```

#### 処理フロー

```
1. 環境変数から暗号化キーを取得
   ↓
2. ランダムな IV (16バイト) を生成
   ↓
3. AES-256-CBC で暗号化
   ↓
4. IV と暗号化データを HEX エンコード
   ↓
5. "iv:encryptedData" 形式で返す
```

#### 例外

- **Error**: `ENCRYPTION_KEY is not defined in environment variables`
  - 環境変数 `ENCRYPTION_KEY` が設定されていない

- **Error**: `ENCRYPTION_KEY must be 64 hex characters (32 bytes)`
  - 暗号化キーの長さが 64文字でない

---

### decrypt()

暗号化された文字列を復号化します。

#### シグネチャ

```typescript
export function decrypt(encryptedText: string): string
```

#### パラメータ

- **encryptedText** (string): `"iv:encryptedData"` 形式の暗号化文字列

#### 戻り値

復号化された平文

#### 使用例

```typescript
import { decrypt } from '@/lib/utils/crypto';

const encrypted = "3f2a1b4c5d6e7f8g9h0i1j2k3l4m5n6o:7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e";
const plainText = decrypt(encrypted);

console.log(plainText);
// 出力: "TCU"
```

#### 処理フロー

```
1. 環境変数から暗号化キーを取得
   ↓
2. 入力を ":" で分割
   ├─ ivHex
   └─ encryptedData
   ↓
3. HEX デコード
   ↓
4. AES-256-CBC で復号化
   ↓
5. 平文を返す
```

#### 例外

- **Error**: `ENCRYPTION_KEY is not defined in environment variables`
  - 環境変数 `ENCRYPTION_KEY` が設定されていない

- **Error**: `ENCRYPTION_KEY must be 64 hex characters (32 bytes)`
  - 暗号化キーの長さが 64文字でない

- **Error**: `Invalid encrypted text format. Expected "iv:encryptedData"`
  - 暗号化文字列の形式が不正

---

### getEncryptionKey() (内部関数)

環境変数から暗号化キーを取得します（外部には公開されていません）。

#### シグネチャ

```typescript
function getEncryptionKey(): Buffer
```

#### 戻り値

32バイトの Buffer

#### 処理

1. `process.env.ENCRYPTION_KEY` を取得
2. 64文字の HEX 文字列であることを検証
3. Buffer に変換して返す

---

## 認証関数 (auth.ts)

### 概要

Cookie ベースの認証状態管理機能を提供します。

**定義場所:** `lib/utils/auth.ts`

### 定数

```typescript
const AUTH_COOKIE_NAME = 'blog_auth';
```

---

### setAuthCookie()

認証 Cookie に記事の slug を追加します。

#### シグネチャ

```typescript
export async function setAuthCookie(slug: string): Promise<void>
```

#### パラメータ

- **slug** (string): 認証済みとしてマークする記事のスラグ

#### 戻り値

なし（Promise<void>）

#### 使用例

```typescript
import { setAuthCookie } from '@/lib/utils/auth';

// 認証成功時
await setAuthCookie("restricted-article");
```

#### 処理フロー

```
1. 既存の Cookie 値を取得
   例: "welcome,another-article"
   ↓
2. カンマ区切りで配列に変換
   ["welcome", "another-article"]
   ↓
3. 重複を避けて slug を追加
   ["welcome", "another-article", "restricted-article"]
   ↓
4. カンマ区切りに戻して Cookie に保存
   "welcome,another-article,restricted-article"
```

#### Cookie 仕様

| 属性 | 値 |
|------|-----|
| 名前 | `blog_auth` |
| 値 | カンマ区切りの slug リスト |
| HttpOnly | `true` |
| Secure | `true` (本番環境のみ) |
| SameSite | `Strict` |
| Max-Age | `2592000` (30日) |
| Path | `/` |

---

### isAuthenticated()

指定された記事が認証済みかチェックします。

#### シグネチャ

```typescript
export async function isAuthenticated(slug: string): Promise<boolean>
```

#### パラメータ

- **slug** (string): チェックする記事のスラグ

#### 戻り値

認証済みなら `true`、未認証なら `false`

#### 使用例

```typescript
import { isAuthenticated } from '@/lib/utils/auth';

const authenticated = await isAuthenticated("restricted-article");

if (authenticated) {
  // 記事を表示
} else {
  // 質問フォームを表示
}
```

#### 処理フロー

```
1. Cookie "blog_auth" を取得
   例: "welcome,restricted-article"
   ↓
2. カンマ区切りで配列に変換
   ["welcome", "restricted-article"]
   ↓
3. 配列に slug が含まれるかチェック
   "restricted-article" in ["welcome", "restricted-article"]
   ↓
4. 結果を返す (true)
```

---

### clearAuthCookie()

認証 Cookie を削除します（ログアウト）。

#### シグネチャ

```typescript
export async function clearAuthCookie(): Promise<void>
```

#### パラメータ

なし

#### 戻り値

なし（Promise<void>）

#### 使用例

```typescript
import { clearAuthCookie } from '@/lib/utils/auth';

// ログアウト処理
await clearAuthCookie();
```

#### 処理

Cookie `blog_auth` を削除します。

---

## レート制限関数 (rate-limit.ts)

### 概要

Cookie ベースのレート制限機能を提供し、ブルートフォース攻撃を防ぎます。

**定義場所:** `lib/utils/rate-limit.ts`

### 定数

```typescript
const RATE_LIMIT_COOKIE_NAME = 'rate_limit';
const MAX_ATTEMPTS = 5;                    // 最大試行回数
const LOCK_DURATION = 15 * 60 * 1000;      // 15分（ミリ秒）
```

### 型定義

```typescript
type RateLimitData = {
  attempts: number;      // 失敗回数
  lockedUntil?: number;  // ロック解除時刻（UNIXタイムスタンプ）
}
```

---

### checkRateLimit()

レート制限の状態をチェックします。

#### シグネチャ

```typescript
export async function checkRateLimit(slug: string): Promise<number>
```

#### パラメータ

- **slug** (string): 記事のスラグ

#### 戻り値

- ロック中の場合: ロック解除までの残り時間（秒）
- ロックされていない場合: `0`

#### 使用例

```typescript
import { checkRateLimit } from '@/lib/utils/rate-limit';

const lockTime = await checkRateLimit("restricted-article");

if (lockTime > 0) {
  console.log(`${Math.ceil(lockTime / 60)}分後に再試行してください`);
} else {
  // 試行可能
}
```

#### 処理フロー

```
1. Cookie "rate_limit_{slug}" を取得
   ↓
2. JSON パース
   { attempts: 5, lockedUntil: 1700000000 }
   ↓
3. lockedUntil と現在時刻を比較
   ├─ lockedUntil > 現在時刻
   │  └─ ロック中 → 残り秒数を返す
   └─ lockedUntil <= 現在時刻 or なし
      └─ ロックなし → 0 を返す
```

---

### incrementFailedAttempts()

不正解時に失敗回数をインクリメントします。

#### シグネチャ

```typescript
export async function incrementFailedAttempts(slug: string): Promise<void>
```

#### パラメータ

- **slug** (string): 記事のスラグ

#### 戻り値

なし（Promise<void>）

#### 使用例

```typescript
import { incrementFailedAttempts } from '@/lib/utils/rate-limit';

// 不正解の場合
await incrementFailedAttempts("restricted-article");
```

#### 処理フロー

```
1. 現在のデータを取得
   { attempts: 3 }
   ↓
2. attempts をインクリメント
   { attempts: 4 }
   ↓
3. attempts が MAX_ATTEMPTS (5) 以上か確認
   ├─ Yes
   │  └─ lockedUntil = 現在時刻 + 15分 を設定
   │     { attempts: 5, lockedUntil: 1700000900 }
   └─ No
      └─ そのまま
   ↓
4. Cookie に保存
```

---

### resetRateLimit()

正解時にレート制限をリセットします。

#### シグネチャ

```typescript
export async function resetRateLimit(slug: string): Promise<void>
```

#### パラメータ

- **slug** (string): 記事のスラグ

#### 戻り値

なし（Promise<void>）

#### 使用例

```typescript
import { resetRateLimit } from '@/lib/utils/rate-limit';

// 正解の場合
await resetRateLimit("restricted-article");
```

#### 処理

Cookie `rate_limit_{slug}` を削除します。

---

### getRateLimitData() (内部関数)

レート制限データを取得します（外部には公開されていません）。

#### シグネチャ

```typescript
async function getRateLimitData(slug: string): Promise<RateLimitData>
```

#### 戻り値

- Cookie が存在する場合: パースされた RateLimitData
- Cookie が存在しない場合: `{ attempts: 0 }`

---

### setRateLimitData() (内部関数)

レート制限データを保存します（外部には公開されていません）。

#### シグネチャ

```typescript
async function setRateLimitData(slug: string, data: RateLimitData): Promise<void>
```

#### Cookie 仕様

| 属性 | 値 |
|------|-----|
| 名前 | `rate_limit_{slug}` |
| 値 | JSON 文字列 |
| HttpOnly | `true` |
| Secure | `true` (本番環境のみ) |
| SameSite | `Strict` |
| Max-Age | `900` (15分) |
| Path | `/` |

---

## 関数の組み合わせ例

### 認証フロー全体

```typescript
import { validateAnswers } from '@/app/actions/validate-answer';
import { checkRateLimit, incrementFailedAttempts, resetRateLimit } from '@/lib/utils/rate-limit';
import { setAuthCookie, isAuthenticated } from '@/lib/utils/auth';
import { encrypt, decrypt } from '@/lib/utils/crypto';

// 1. 管理者が正解を暗号化（事前準備）
const encryptedAnswer = encrypt("TCU");
// "a1b2c3d4...f0e1d2c3:q7r8s9t0..."

// 2. ユーザーが回答を送信
const userAnswer = "TCU";

// 3. レート制限チェック
const lockTime = await checkRateLimit("restricted-article");
if (lockTime > 0) {
  // ロック中
  return;
}

// 4. 正解を復号化
const correctAnswer = decrypt(encryptedAnswer);
// "TCU"

// 5. 回答を比較
if (userAnswer === correctAnswer) {
  // 正解
  await setAuthCookie("restricted-article");
  await resetRateLimit("restricted-article");
} else {
  // 不正解
  await incrementFailedAttempts("restricted-article");
}

// 6. 認証状態を確認
const authenticated = await isAuthenticated("restricted-article");
if (authenticated) {
  // 記事を表示
}
```

---

## セキュリティ考慮事項

### 暗号化関数

1. **鍵の管理**
   - 環境変数で管理し、ソースコードに含めない
   - `.env.local` を `.gitignore` に追加

2. **IV のランダム性**
   - 毎回異なる IV を生成
   - 同じ平文でも異なる暗号文を生成

### 認証関数

1. **HttpOnly Cookie**
   - JavaScript から Cookie にアクセス不可
   - XSS 攻撃を軽減

2. **SameSite=Strict**
   - CSRF 攻撃を防止

3. **Secure 属性**
   - 本番環境では HTTPS 通信のみ

### レート制限関数

1. **Cookie ベースの制限**
   - Cookie を削除すればリセット可能
   - より強固な制限には IP ベースの実装が必要

2. **ロック期間**
   - 15分間のロック
   - Cookie の有効期限と同じ

---

## 関連ドキュメント

- [セキュリティモデル](../architecture/security.md) - セキュリティ設計の詳細
- [Server Actions リファレンス](./server-actions.md) - これらの関数を使用する API
- [データフロー](../architecture/data-flow.md) - 処理の流れ
- [型定義リファレンス](./types.md) - 使用している型の定義
