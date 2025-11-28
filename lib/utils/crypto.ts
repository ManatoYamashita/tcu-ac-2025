import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

/**
 * 環境変数から暗号化キーを取得
 * @throws キーが設定されていない、または長さが不正な場合
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  // HEX文字列（64文字）をBufferに変換
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * 文字列を暗号化する
 * @param text 暗号化する平文
 * @returns "iv:encryptedData" 形式の文字列
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // IV と暗号化データを結合して返す
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * 暗号化された文字列を復号化する
 * @param encryptedText "iv:encryptedData" 形式の文字列
 * @returns 復号化された平文
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const [ivHex, encryptedData] = encryptedText.split(':');

  if (!ivHex || !encryptedData) {
    throw new Error('Invalid encrypted text format. Expected "iv:encryptedData"');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
