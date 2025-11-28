# Server Actions リファレンス

このドキュメントでは、manapuraza blog で使用される Server Actions の API 仕様を説明します。

## 目次

- [validateAnswers](#validateanswers)

---

## validateAnswers

ユーザーの回答を検証し、認証状態を更新する Server Action です。

### 定義場所

`app/actions/validate-answer.ts`

### シグネチャ

```typescript
export async function validateAnswers(
  slug: string,
  questionSetId: string,
  answers: UserAnswer[]
): Promise<ValidateResult>
```

### パラメータ

#### `slug` (string, 必須)

認証対象の記事のスラグ。

**例:**
```typescript
"restricted-article"
"javascript-basics"
```

#### `questionSetId` (string, 必須)

質問セットの ID。`lib/config/questions.ts` で定義されている必要があります。

**例:**
```typescript
"tcu-basic"
"javascript-basics"
```

#### `answers` (UserAnswer[], 必須)

ユーザーの回答リスト。全ての質問に対する回答を含む必要があります。

**型定義:**
```typescript
type UserAnswer = {
  questionId: string;  // 質問のID
  answer: string;      // ユーザーの回答
}
```

**例:**
```typescript
[
  { questionId: "q1", answer: "TCU" },
  { questionId: "q2", answer: "技術ブログ" },
  { questionId: "q3", answer: "secret123" }
]
```

### 戻り値

#### `ValidateResult`

**型定義:**
```typescript
type ValidateResult = {
  success: boolean;             // 検証成功フラグ
  message: string;              // ユーザーへのメッセージ
  remainingLockTime?: number;   // ロック中の場合、残り時間（秒）
}
```

### 処理フロー

```
1. レート制限チェック
   ↓
2. 質問セットの存在確認
   ↓
3. 全質問に対する回答のチェック
   ↓ (各質問について)
4. 暗号化された正解の復号化
   ↓
5. ユーザー回答との比較
   ↓
   [全問正解の場合]
   ├─ 認証 Cookie を設定
   ├─ レート制限をリセット
   └─ 成功レスポンスを返す
   ↓
   [不正解がある場合]
   ├─ 失敗回数をインクリメント
   └─ 失敗レスポンスを返す
```

### レスポンス例

#### 成功（全問正解）

```typescript
{
  success: true,
  message: "正解です！記事を閲覧できます。"
}
```

#### 失敗（不正解）

```typescript
{
  success: false,
  message: "回答が間違っています。"
}
```

#### 失敗（回答漏れ）

```typescript
{
  success: false,
  message: "すべての質問に回答してください。"
}
```

#### 失敗（レート制限）

```typescript
{
  success: false,
  message: "回答が多すぎます。15分後に再試行してください。",
  remainingLockTime: 900  // 秒
}
```

#### 失敗（質問セットが存在しない）

```typescript
{
  success: false,
  message: "質問セットが見つかりません。"
}
```

#### 失敗（サーバーエラー）

```typescript
{
  success: false,
  message: "エラーが発生しました。"
}
```

### 回答の比較ロジック

#### text タイプ（caseSensitive: false）

大文字小文字を区別せず比較します。

```typescript
// 質問定義
{
  id: "q1",
  type: "text",
  encryptedAnswer: decrypt("tcu"),
  caseSensitive: false
}

// 比較
userAnswer.toLowerCase() === correctAnswer.toLowerCase()
"TCU".toLowerCase() === "tcu".toLowerCase()  // → true
"tcu" === "tcu"                              // → true
"Tcu" === "tcu"                              // → true (toLowerCase後)
```

#### text タイプ（caseSensitive: true）

大文字小文字を区別して比較します。

```typescript
// 質問定義
{
  id: "q1",
  type: "text",
  encryptedAnswer: decrypt("TCU"),
  caseSensitive: true
}

// 比較
userAnswer === correctAnswer
"TCU" === "TCU"  // → true
"tcu" === "TCU"  // → false
"Tcu" === "TCU"  // → false
```

#### choice タイプ

常に完全一致で比較します（caseSensitive は無視）。

```typescript
// 質問定義
{
  id: "q2",
  type: "choice",
  options: ["技術ブログ", "日記", "ニュース"],
  encryptedAnswer: decrypt("技術ブログ")
}

// 比較
userAnswer === correctAnswer
"技術ブログ" === "技術ブログ"  // → true
"日記" === "技術ブログ"        // → false
```

#### password タイプ

常に完全一致で比較します。

```typescript
// 質問定義
{
  id: "q3",
  type: "password",
  encryptedAnswer: decrypt("secret123")
}

// 比較
userAnswer === correctAnswer
"secret123" === "secret123"  // → true
"Secret123" === "secret123"  // → false
```

### 副作用

この関数は以下の副作用を持ちます：

#### 成功時

1. **認証 Cookie の設定**
   - Cookie 名: `blog_auth`
   - 追加される値: `slug`
   - 有効期限: 30日

2. **レート制限のリセット**
   - Cookie 名: `rate_limit_{slug}`
   - Cookie が削除される

#### 失敗時

1. **失敗回数のインクリメント**
   - Cookie 名: `rate_limit_{slug}`
   - `attempts` が 1 増加
   - `attempts` が 5 に達した場合、`lockedUntil` が設定される

### エラーハンドリング

#### try-catch ブロック

内部エラーが発生した場合（暗号化エラーなど）、以下のレスポンスを返します：

```typescript
{
  success: false,
  message: "エラーが発生しました。"
}
```

エラーはサーバーログに出力されます：

```typescript
console.error('Validation error:', error);
```

### 使用例

#### クライアントコンポーネントからの呼び出し

```typescript
// app/blogs/[slug]/_components/QuestionForm.tsx

import { validateAnswers } from '@/app/actions/validate-answer';

export default function QuestionForm({ slug, questionSetId, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 回答データを構築
    const userAnswers: UserAnswer[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || '',
    }));

    // Server Action を呼び出し
    const result = await validateAnswers(slug, questionSetId, userAnswers);

    if (result.success) {
      // 成功時: ページをリロード
      window.location.reload();
    } else {
      // 失敗時: エラーメッセージを表示
      alert(result.message);
    }
  };

  // ...
}
```

### セキュリティ考慮事項

1. **サーバーサイド検証**
   - 全ての検証処理はサーバーで実行される
   - クライアントは正解を知ることができない

2. **暗号化された正解**
   - `encryptedAnswer` はクライアントに送信されない
   - サーバーで復号化してから比較

3. **レート制限**
   - ブルートフォース攻撃を防ぐ
   - 5回失敗で 15分間ロック

4. **CSRF 保護**
   - Next.js の組み込み CSRF 保護が適用される

### パフォーマンス

- **平均実行時間**: 50-100ms
- **処理内容**:
  - Cookie の読み書き
  - 暗号化の復号化（各質問につき 1回）
  - 文字列比較

### 制限事項

1. **Cookie サイズ制限**
   - 認証済み記事が増えると Cookie サイズが大きくなる
   - ブラウザの Cookie サイズ制限（通常 4KB）に注意

2. **レート制限の回避**
   - Cookie ベースのため、Cookie を削除すればリセット可能
   - IP ベースの制限は未実装

### 関連ドキュメント

- [データフロー](../architecture/data-flow.md#5-質問への回答と認証) - 詳細な処理フロー
- [セキュリティモデル](../architecture/security.md) - セキュリティ設計
- [ユーティリティ関数リファレンス](./utilities.md) - 使用している関数の詳細
- [型定義リファレンス](./types.md) - UserAnswer, ValidateResult の定義
