# トラブルシューティング

このガイドでは、manapuraza blog でよく発生する問題とその解決方法を説明します。

## セットアップ関連

### 問題: `ENCRYPTION_KEY is not defined` エラー

#### 症状
サーバー起動時またはビルド時に以下のエラーが表示される：
```
Error: ENCRYPTION_KEY is not defined or invalid
```

#### 原因
環境変数 `ENCRYPTION_KEY` が設定されていない、または形式が正しくありません。

#### 解決方法

1. `.env.local` ファイルが存在することを確認
```bash
ls -la .env.local
```

2. `.env.local` に `ENCRYPTION_KEY` が設定されているか確認
```bash
cat .env.local
```

3. キーが64文字のHEX文字列であることを確認（数字とa-fのみ）

4. キーが設定されていない場合は、新しく生成
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. 生成したキーを `.env.local` に設定
```env
ENCRYPTION_KEY=生成された64文字の文字列
```

6. 開発サーバーを再起動
```bash
npm run dev
```

### 問題: 依存パッケージのインストールエラー

#### 症状
`npm install` または `yarn install` 実行時にエラーが発生する。

#### 解決方法

1. Node.js のバージョンを確認（v18.17.0 以上が必要）
```bash
node --version
```

2. キャッシュをクリアして再インストール
```bash
# npm の場合
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# yarn の場合
rm -rf node_modules yarn.lock
yarn cache clean
yarn install
```

3. それでも解決しない場合は、Node.js を最新のLTS版に更新

## 認証・質問関連

### 問題: 正解を入力しても「不正解です」と表示される

#### 症状
質問に正しい答えを入力しているのに、不正解と判定される。

#### 原因
以下のいずれかが考えられます：
1. 大文字小文字の区別
2. 前後の空白文字
3. 暗号化キーの不一致
4. 暗号化された回答の設定ミス

#### 解決方法

**1. 大文字小文字の確認**

質問の設定で `caseSensitive: true` の場合、大文字小文字が完全に一致する必要があります。

```typescript
{
  id: 'q1',
  text: '東京都市大学の略称は？',
  type: 'text',
  encryptedAnswer: '...',
  caseSensitive: true  // true の場合、"TCU" と "tcu" は別物
}
```

**2. 暗号化された回答の確認**

復号化ツールで正解を確認します：

```bash
npx tsx scripts/decrypt.ts "暗号化された文字列"
```

期待する正解と一致しているか確認してください。

**3. 暗号化キーの確認**

本番環境とローカル環境で異なるキーを使用していないか確認します。

```bash
# ローカルのキーを確認
cat .env.local | grep ENCRYPTION_KEY

# Vercel の環境変数を確認
# Vercel ダッシュボード > Settings > Environment Variables
```

**4. 再暗号化**

正解を再度暗号化し、設定し直します：

```bash
npx tsx scripts/encrypt.ts "正しい正解"
```

### 問題: レート制限で15分間ロックされた

#### 症状
「回答の試行回数が上限に達しました。15分後に再度お試しください。」と表示される。

#### 原因
5回連続で不正解を入力したため、レート制限が発動しました。

#### 解決方法

**方法1: 15分待つ（推奨）**

セキュリティ機能として設計されているため、15分間待ってから再試行してください。

**方法2: Cookie を削除（開発時のみ）**

開発時に即座にリセットしたい場合：

1. ブラウザの開発者ツールを開く（F12）
2. Application タブ（Chrome）または Storage タブ（Firefox）を開く
3. Cookies から該当する Cookie を削除
   - `rate_limit_{記事のslug}` という名前の Cookie を削除
4. ページをリロード

**方法3: レート制限の設定変更（開発時のみ）**

`lib/utils/rate-limit.ts` の設定を変更：

```typescript
const MAX_ATTEMPTS = 5;        // 最大試行回数
const LOCK_DURATION = 15 * 60; // ロック時間（秒）
```

本番環境では、セキュリティのため元の設定を維持してください。

### 問題: 一度認証した記事が再び質問フォームを表示する

#### 症状
以前正解して記事を閲覧できたのに、再度アクセスすると質問フォームが表示される。

#### 原因
認証情報を保存している Cookie が削除された可能性があります。

#### 解決方法

1. ブラウザの Cookie 設定を確認
   - Cookie がブロックされていないか確認
   - サードパーティ Cookie の設定を確認

2. プライベートブラウジングモード（シークレットモード）を使用している場合
   - 通常モードでアクセスしてください
   - プライベートモードでは Cookie が保存されません

3. 再度質問に回答して認証してください

## ビルド・デプロイ関連

### 問題: Vercel デプロイ後に暗号化エラーが発生

#### 症状
ローカルでは動作するが、Vercel にデプロイすると暗号化関連のエラーが発生する。

#### 原因
Vercel に環境変数 `ENCRYPTION_KEY` が設定されていない、またはローカルと異なるキーが設定されている。

#### 解決方法

1. Vercel ダッシュボードにアクセス
2. プロジェクトを選択
3. Settings > Environment Variables に移動
4. `ENCRYPTION_KEY` を追加または更新
   - Name: `ENCRYPTION_KEY`
   - Value: ローカルの `.env.local` と同じ64文字のHEX文字列
   - Environment: Production, Preview, Development 全てにチェック
5. 再デプロイを実行

### 問題: ビルドエラー `Type error: ...`

#### 症状
`npm run build` 実行時に TypeScript の型エラーが発生する。

#### 解決方法

1. エラーメッセージを確認し、該当ファイルを修正

2. 型定義が不足している場合は `lib/types/index.ts` を確認

3. 依存パッケージの型定義をインストール
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

4. TypeScript のバージョンを確認
```bash
npx tsc --version
```

### 問題: 画像が表示されない

#### 症状
質問に設定した画像が表示されない。

#### 原因
画像のパスが間違っている、または画像ファイルが存在しない。

#### 解決方法

1. 画像を `public/` ディレクトリに配置
```
public/
  images/
    question-image.png
```

2. `imageUrl` を正しく設定
```typescript
{
  imageUrl: '/images/question-image.png',  // public/ からの相対パス
  // ...
}
```

3. 画像ファイルが存在することを確認
```bash
ls -la public/images/
```

## パフォーマンス関連

### 問題: ページの読み込みが遅い

#### 原因と解決方法

**原因1: 大きな画像ファイル**

解決方法：
- 画像を最適化（WebP形式、適切なサイズにリサイズ）
- Next.js の `Image` コンポーネントを使用（現在は `<img>` タグを使用）

**原因2: Markdown の HTML 変換処理**

解決方法：
- 記事は Static Site Generation (SSG) で事前ビルドされているため、基本的には高速
- ビルド時間が長い場合は、記事数を確認

## その他の問題

### 問題: 開発サーバーが起動しない

#### 解決方法

1. ポート 3000 が既に使用されていないか確認
```bash
lsof -i :3000
```

2. 別のポートを使用
```bash
PORT=3001 npm run dev
```

3. プロセスが残っている場合は終了
```bash
pkill -f next
```

### サポートが必要な場合

上記の方法で解決しない場合は、以下の情報を添えて問い合わせてください：

- エラーメッセージの全文
- 実行したコマンド
- Node.js のバージョン (`node --version`)
- npm/yarn のバージョン
- OS の情報

## 関連ドキュメント

- [セットアップガイド](./setup.md)
- [管理者マニュアル](./admin-manual.md)
- [セキュリティモデル](../architecture/security.md)
