import { QuestionConfig } from '@/lib/types';

/**
 * 質問設定
 * encryptedAnswer は scripts/encrypt.ts で生成した暗号化文字列を設定
 *
 * 注意: 本ファイルはサーバーサイド専用（クライアントに送信しない）
 */
export const questionConfig: QuestionConfig = {
  // サンプル: 東京都市大学に関する質問セット
  'tcu-basic': {
    questions: [
      {
        id: 'q1',
        text: '東京都市大学の英語名は何ですか？（Tokyo City University の略称を大文字で入力）',
        type: 'text',
        encryptedAnswer: 'db8c6000c6e771cc0eceb08a69dad616:90a1001120977c83276ebcbad918fb81',
        caseSensitive: false,
      },
      {
        id: 'q2',
        text: '東京都市大学の主要キャンパスがある都市はどこですか？',
        type: 'choice',
        options: ['東京都世田谷区', '神奈川県横浜市', '埼玉県さいたま市', '千葉県千葉市'],
        encryptedAnswer: 'd66aee22d268512cd8fa187a0d6c3cb9:9b8dccdcc920f219dcd36c4f2be0aef1e25797f1ff0a44ee869e2d6a7342a043',
      },
      {
        id: 'q3',
        text: 'この記事のパスワードを入力してください（ヒント: tcu + 西暦年）',
        type: 'password',
        encryptedAnswer: '9f94805060b7502da5d048b9b65f12cc:b7f905c392426927f14a495e778d788f',
      },
    ],
  },

  // 別の記事用の質問セット例（未使用のサンプル）
  'special-article': {
    questions: [
      {
        id: 'q1',
        text: 'サンプル質問: この記事へのアクセスコードを入力してください',
        type: 'password',
        encryptedAnswer: '9f94805060b7502da5d048b9b65f12cc:b7f905c392426927f14a495e778d788f', // tcu2025
      },
    ],
  },
};
