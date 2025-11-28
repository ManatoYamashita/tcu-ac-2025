# 型定義リファレンス

このドキュメントでは、manapuraza blog で使用される TypeScript 型定義の詳細を説明します。

**定義場所:** `lib/types/index.ts`

## 目次

- [記事関連の型](#記事関連の型)
- [質問関連の型](#質問関連の型)
- [認証関連の型](#認証関連の型)

---

## 記事関連の型

### PostMeta

記事のメタデータ（Frontmatter から取得）を表す型です。

#### 定義

```typescript
export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  requiresAuth: boolean;
  questionSetId?: string;
}
```

#### フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `slug` | `string` | ✓ | 記事の一意識別子（ファイル名から生成） |
| `title` | `string` | ✓ | 記事のタイトル |
| `date` | `string` | ✓ | 公開日（YYYY-MM-DD形式） |
| `categories` | `string[]` | ✓ | カテゴリのリスト |
| `requiresAuth` | `boolean` | ✓ | 認証が必要か |
| `questionSetId` | `string?` | - | 質問セットのID（requiresAuth: true の場合に使用） |

#### 使用例

```typescript
const post: PostMeta = {
  slug: "restricted-article",
  title: "制限付き記事サンプル",
  date: "2025-11-28",
  categories: ["限定公開"],
  requiresAuth: true,
  questionSetId: "tcu-basic"
};
```

#### 使用箇所

- `lib/posts.ts` の `getAllPosts()` の戻り値
- `lib/posts.ts` の `getPostBySlug()` の戻り値（content フィールドと組み合わせ）

---

## 質問関連の型

### QuestionType

質問のタイプを表す型です。

#### 定義

```typescript
export type QuestionType = 'text' | 'choice' | 'password';
```

#### 値

| 値 | 説明 | UIコンポーネント |
|----|------|----------------|
| `'text'` | テキスト入力 | `<input type="text">` |
| `'choice'` | 選択式（ラジオボタン） | `<input type="radio">` |
| `'password'` | パスワード入力 | `<input type="password">` |

#### 使用例

```typescript
const questionType: QuestionType = 'text';
```

---

### Question

個別の質問設定を表す型です（サーバーサイドのみ使用）。

#### 定義

```typescript
export type Question = {
  id: string;
  text: string;
  imageUrl?: string;
  type: QuestionType;
  options?: string[];
  encryptedAnswer: string;
  caseSensitive?: boolean;
}
```

#### フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | `string` | ✓ | 質問の一意ID（例: "q1", "q2"） |
| `text` | `string` | ✓ | 質問文 |
| `imageUrl` | `string?` | - | 質問に添付する画像URL（public/ からの相対パス） |
| `type` | `QuestionType` | ✓ | 質問のタイプ |
| `options` | `string[]?` | - | 選択肢（type が 'choice' の場合に使用） |
| `encryptedAnswer` | `string` | ✓ | 暗号化された正解 |
| `caseSensitive` | `boolean?` | - | 大文字小文字を区別するか（type が 'text' の場合、デフォルト: false） |

#### 使用例

##### text タイプ

```typescript
const textQuestion: Question = {
  id: "q1",
  text: "東京都市大学の略称は？",
  type: "text",
  encryptedAnswer: "a1b2c3d4...f0e1d2c3:q7r8s9t0...",
  caseSensitive: true
};
```

##### choice タイプ

```typescript
const choiceQuestion: Question = {
  id: "q2",
  text: "このブログのテーマは？",
  type: "choice",
  options: ["技術ブログ", "日記", "ニュース", "その他"],
  encryptedAnswer: "d4e5f6g7...h8i9j0k1:l2m3n4o5..."
};
```

##### password タイプ

```typescript
const passwordQuestion: Question = {
  id: "q3",
  text: "パスワードを入力してください",
  type: "password",
  encryptedAnswer: "g7h8i9j0...k1l2m3n4:o5p6q7r8..."
};
```

##### 画像付き質問

```typescript
const imageQuestion: Question = {
  id: "q4",
  text: "この画像は何を表していますか？",
  imageUrl: "/images/question-image.png",
  type: "text",
  encryptedAnswer: "p9q0r1s2...t3u4v5w6:x7y8z9a0..."
};
```

#### 使用箇所

- `lib/config/questions.ts` の `QuestionSet.questions`
- `app/actions/validate-answer.ts` での回答検証

---

### ClientQuestion

クライアントに送信する質問データ（正解を含まない）を表す型です。

#### 定義

```typescript
export type ClientQuestion = Omit<Question, 'encryptedAnswer' | 'caseSensitive'> & {
  id: string;
  text: string;
  imageUrl?: string;
  type: QuestionType;
  options?: string[];
}
```

#### 特徴

`Question` 型から以下のフィールドを除外：
- `encryptedAnswer`: 暗号化された正解（クライアントに送信しない）
- `caseSensitive`: 大文字小文字の区別設定（クライアントに送信しない）

#### 使用例

```typescript
// サーバーサイドでの変換
const serverQuestion: Question = {
  id: "q1",
  text: "東京都市大学の略称は？",
  type: "text",
  encryptedAnswer: "a1b2c3d4...",
  caseSensitive: true
};

const clientQuestion: ClientQuestion = {
  id: serverQuestion.id,
  text: serverQuestion.text,
  type: serverQuestion.type,
  // encryptedAnswer と caseSensitive は含めない
};
```

#### 実際の変換コード

```typescript
// app/blogs/[slug]/page.tsx
const clientQuestions: ClientQuestion[] = questionSet.questions.map((q) => ({
  id: q.id,
  text: q.text,
  imageUrl: q.imageUrl,
  type: q.type,
  options: q.options,
  // encryptedAnswer と caseSensitive は除外
}));
```

#### 使用箇所

- `app/blogs/[slug]/page.tsx` でクライアントコンポーネントに渡すデータ
- `app/blogs/[slug]/_components/QuestionForm.tsx` の props

---

### QuestionSet

質問セット（記事ごとに定義）を表す型です。

#### 定義

```typescript
export type QuestionSet = {
  questions: Question[];
}
```

#### フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `questions` | `Question[]` | ✓ | 質問のリスト |

#### 使用例

```typescript
const questionSet: QuestionSet = {
  questions: [
    {
      id: "q1",
      text: "東京都市大学の略称は？",
      type: "text",
      encryptedAnswer: "...",
      caseSensitive: true
    },
    {
      id: "q2",
      text: "このブログのテーマは？",
      type: "choice",
      options: ["技術ブログ", "日記", "ニュース"],
      encryptedAnswer: "..."
    }
  ]
};
```

#### 使用箇所

- `lib/config/questions.ts` の `questionConfig` の値

---

### QuestionConfig

質問設定マップ（questionSetId → QuestionSet）を表す型です。

#### 定義

```typescript
export type QuestionConfig = {
  [questionSetId: string]: QuestionSet;
}
```

#### 使用例

```typescript
const questionConfig: QuestionConfig = {
  "tcu-basic": {
    questions: [/* ... */]
  },
  "javascript-basics": {
    questions: [/* ... */]
  }
};
```

#### 使用箇所

- `lib/config/questions.ts` で export される設定
- `app/actions/validate-answer.ts` で質問セットを取得

---

## 認証関連の型

### UserAnswer

ユーザーの回答データを表す型です。

#### 定義

```typescript
export type UserAnswer = {
  questionId: string;
  answer: string;
}
```

#### フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `questionId` | `string` | ✓ | 質問のID（Question.id に対応） |
| `answer` | `string` | ✓ | ユーザーの回答 |

#### 使用例

```typescript
const userAnswers: UserAnswer[] = [
  { questionId: "q1", answer: "TCU" },
  { questionId: "q2", answer: "技術ブログ" },
  { questionId: "q3", answer: "secret123" }
];
```

#### 使用箇所

- `app/blogs/[slug]/_components/QuestionForm.tsx` で回答を構築
- `app/actions/validate-answer.ts` のパラメータ

---

## 型の関係図

```
PostMeta
├─ slug: string
├─ requiresAuth: boolean
└─ questionSetId?: string
         │
         └──> QuestionConfig
              ├─ [questionSetId]: QuestionSet
              │                   └─ questions: Question[]
              │                                 ├─ id
              │                                 ├─ type: QuestionType
              │                                 ├─ encryptedAnswer
              │                                 └─ ...
              │
              └─> ClientQuestion (Question から一部除外)
                   ├─ id
                   ├─ type: QuestionType
                   └─ ... (encryptedAnswer, caseSensitive を除く)

UserAnswer
├─ questionId: string (Question.id に対応)
└─ answer: string
```

---

## 型ガード

### PostMeta の requiresAuth チェック

```typescript
function requiresAuthentication(post: PostMeta): boolean {
  return post.requiresAuth === true;
}

// 使用例
if (requiresAuthentication(post)) {
  // questionSetId が存在するはず
  const questionSetId = post.questionSetId!; // Non-null assertion
}
```

### QuestionType による分岐

```typescript
function renderQuestionInput(question: ClientQuestion) {
  switch (question.type) {
    case 'text':
      return <input type="text" />;
    case 'choice':
      return question.options?.map(option => (
        <label>
          <input type="radio" value={option} />
          {option}
        </label>
      ));
    case 'password':
      return <input type="password" />;
  }
}
```

---

## 型の拡張例

### 将来的な拡張

新しい質問タイプを追加する場合：

```typescript
// 1. QuestionType に新しいタイプを追加
export type QuestionType = 'text' | 'choice' | 'password' | 'multiple-choice';

// 2. Question 型を拡張（必要に応じて）
export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  // multiple-choice の場合
  multipleOptions?: string[];
  correctAnswers?: string[];  // 複数正解
  // ...
}
```

---

## 関連ドキュメント

- [Server Actions リファレンス](./server-actions.md) - これらの型を使用する API
- [ユーティリティ関数リファレンス](./utilities.md) - 関連する関数
- [システム概要](../architecture/overview.md) - 全体アーキテクチャ
- [データフロー](../architecture/data-flow.md) - 型の使用フロー
