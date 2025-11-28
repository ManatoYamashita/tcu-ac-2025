/**
 * 正解文字列を暗号化するCLIツール
 * 使用方法: npx tsx scripts/encrypt.ts "正解文字列"
 */

import { encrypt } from '../lib/utils/crypto';

// 環境変数を読み込む
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('使用方法: npx tsx scripts/encrypt.ts "暗号化したい文字列"');
  process.exit(1);
}

const plainText = args[0];

try {
  const encrypted = encrypt(plainText);
  console.log('\n=== 暗号化成功 ===');
  console.log('平文:', plainText);
  console.log('暗号化:', encrypted);
  console.log('\nこの暗号化文字列を lib/config/questions.ts の encryptedAnswer に設定してください。');
} catch (error) {
  console.error('暗号化エラー:', error);
  process.exit(1);
}
