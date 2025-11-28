/**
 * 記事メタデータ（Frontmatter）
 */
export type PostMeta = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD形式
  categories: string[];
  requiresAuth: boolean; // 閲覧制限の有無
  questionSetId?: string; // 制限時に使用する質問群のID
};

/**
 * 質問タイプ
 */
export type QuestionType = 'text' | 'choice' | 'password';

/**
 * 個別の質問設定
 */
export type Question = {
  id: string; // 質問の一意ID
  text: string; // 質問文
  imageUrl?: string; // 質問に添付する画像URL（オプション）
  type: QuestionType;
  options?: string[]; // 選択式の場合の選択肢
  encryptedAnswer: string; // 暗号化された正解
  caseSensitive?: boolean; // 大文字小文字を区別するか（text型の場合）
};

/**
 * 質問セット（記事ごとに定義）
 */
export type QuestionSet = {
  questions: Question[];
};

/**
 * 質問設定マップ（questionSetId → QuestionSet）
 */
export type QuestionConfig = {
  [questionSetId: string]: QuestionSet;
};

/**
 * クライアントに送信する質問データ（正解を含まない）
 */
export type ClientQuestion = Omit<Question, 'encryptedAnswer' | 'caseSensitive'> & {
  id: string;
  text: string;
  imageUrl?: string;
  type: QuestionType;
  options?: string[];
};

/**
 * ユーザーの回答データ
 */
export type UserAnswer = {
  questionId: string;
  answer: string;
};
