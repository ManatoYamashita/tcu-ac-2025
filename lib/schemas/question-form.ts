import { z } from 'zod';

/**
 * 質問フォームの動的スキーマ生成関数
 * 質問の数に応じて動的にスキーマを生成します
 */
export function createQuestionFormSchema(questionIds: string[]) {
  const schema: Record<string, z.ZodString> = {};

  questionIds.forEach((id) => {
    schema[id] = z.string().min(1, { message: 'この質問への回答は必須です' });
  });

  return z.object(schema);
}

/**
 * フォームデータの型推論用
 */
export type QuestionFormValues = Record<string, string>;
