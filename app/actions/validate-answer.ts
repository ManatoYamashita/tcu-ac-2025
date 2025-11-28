'use server';

import { decrypt } from '@/lib/utils/crypto';
import { questionConfig } from '@/lib/config/questions';
import { setAuthCookie } from '@/lib/utils/auth';
import { checkRateLimit, incrementFailedAttempts, resetRateLimit } from '@/lib/utils/rate-limit';
import { UserAnswer } from '@/lib/types';

type ValidateResult = {
  success: boolean;
  message: string;
  remainingLockTime?: number; // ロック中の場合、残り時間（秒）
};

/**
 * 回答を検証するServer Action
 * @param slug 記事のslug
 * @param questionSetId 質問セットのID
 * @param answers ユーザーの回答リスト
 */
export async function validateAnswers(
  slug: string,
  questionSetId: string,
  answers: UserAnswer[]
): Promise<ValidateResult> {
  // レートリミットチェック
  const lockTime = await checkRateLimit(slug);
  if (lockTime > 0) {
    return {
      success: false,
      message: `回答が多すぎます。${Math.ceil(lockTime / 60)}分後に再試行してください。`,
      remainingLockTime: lockTime,
    };
  }

  // 質問セットを取得
  const questionSet = questionConfig[questionSetId];
  if (!questionSet) {
    return {
      success: false,
      message: '質問セットが見つかりません。',
    };
  }

  // 全問正解かチェック
  try {
    for (const question of questionSet.questions) {
      const userAnswer = answers.find((a) => a.questionId === question.id);

      if (!userAnswer) {
        await incrementFailedAttempts(slug);
        return {
          success: false,
          message: 'すべての質問に回答してください。',
        };
      }

      // 正解を復号化
      const correctAnswer = decrypt(question.encryptedAnswer);

      // 回答の比較
      let isCorrect = false;
      if (question.type === 'text' && !question.caseSensitive) {
        // 大文字小文字を区別しない
        isCorrect = userAnswer.answer.toLowerCase() === correctAnswer.toLowerCase();
      } else {
        // 完全一致
        isCorrect = userAnswer.answer === correctAnswer;
      }

      if (!isCorrect) {
        await incrementFailedAttempts(slug);
        return {
          success: false,
          message: '回答が間違っています。',
        };
      }
    }

    // 全問正解
    await setAuthCookie(slug);
    await resetRateLimit(slug);

    return {
      success: true,
      message: '正解です！記事を閲覧できます。',
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      message: 'エラーが発生しました。',
    };
  }
}
