/**
 * 暗号化文字列を復号化するCLIツール（管理者用）
 * 使用方法: npx tsx scripts/decrypt.ts "iv:encryptedData"
 */

import { decrypt } from '../lib/utils/crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('使用方法: npx tsx scripts/decrypt.ts "iv:encryptedData"');
  process.exit(1);
}

const encryptedText = args[0];

try {
  const decrypted = decrypt(encryptedText);
  console.log('\n=== 復号化成功 ===');
  console.log('暗号化文字列:', encryptedText);
  console.log('復号化結果:', decrypted);
} catch (error) {
  console.error('復号化エラー:', error);
  process.exit(1);
}
