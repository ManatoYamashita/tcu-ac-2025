# Repository Guidelines

## プロジェクト構成と配置
- `app/`: Next.js App Router（`layout.tsx`, `page.tsx`, `blogs/` など）。OGP・sitemap・robots もここで生成し、メタデータはここが入口。
- `lib/`: ドメインロジックとユーティリティ（`posts.ts`, `config/questions.ts`, `utils/`）。共通処理はここに集約し、重複を禁止。
- `posts/`: Markdown 記事。YAML フロントマター必須（`title`, `date`, `categories`, `requiresAuth` など）。スラッグはファイル名をケバブケースで合わせる。
- `docs/`: ルールと知見の SoT。追加・更新時は必ず `docs/index.md` を反映し、関連ガイド（setup/branch/ci-cd 等）へのリンク整合を確認。
- `scripts/`: `encrypt.ts` / `decrypt.ts` などの CLI。秘密値はここで扱い、結果は `.env.local` へ保存するのみ。
- `.github/workflows/`: CI（feature: lint→build→自動PR、main: build→Lighthouse 90+）。`lighthouserc.js` で閾値管理。

## ビルド・テスト・開発コマンド
- `npm run dev`：開発サーバー（http://localhost:3000）。記事追加はホットリロードで即反映。
- `npm run build`：本番ビルド。Markdown やメタデータ不備もここで検知し、OGP 生成も検証。
- `npm run start`：本番サーバー起動（`build` 済み前提）。ステージング確認時に使用。
- `npm run lint`：ESLint（Next.js + TypeScript ルール）。`npm run lint -- --fix` で自動修正可。
- 前提: Node.js 20+, `cp .env.example .env.local` 後に `ENCRYPTION_KEY` を設定し、必要なら `NEXT_PUBLIC_BASE_URL` を合わせる。

## コーディングスタイル & 命名
- TypeScript/React（App Router）。サーバーコンポーネントをデフォルトとし、クライアント必要時のみ `\"use client\"` を先頭に置く。
- インデント 2 スペース、シングルクォート、末尾セミコロンなし（ESLint 準拠）。不要な外部ライブラリ追加は原則禁止。
- ファイル/ディレクトリはケバブケース、コンポーネントはパスカルケース。ユーティリティは疎結合関数を小さく保つ。import は `react` → サードパーティ → ローカルの順。
- スタイルは Tailwind 優先。意味のあるクラス名をまとめ、不要なカスタム CSS を避ける。余白とフォントサイズはデザイントークン（Tailwind の scale）に合わせる。

## テスト指針
- 現状: Lint + CI ビルドが最小品質ゲート。変更前後で `npm run lint` / `npm run build` をローカル実行し、CI と同条件で失敗がないことを確認。
- 記事追加時はフロントマターの必須キーと日付形式を確認し、`requiresAuth` 記事は質問設定を `lib/config/questions.ts` に追加。公開前にローカルで回答→閲覧を通しで確認。
- UI 変更は PR にスクリーンショットを添付。アクセシビリティは基本属性（`alt`, `aria-*`）を必ず付与。将来的に E2E を導入する場合は Playwright を想定し、テスト ID を計画的に付与する。

## コミット & PR ガイド
- コミットプレフィックス: `FEATURE`（新機能）、`FIX`（修正）、`REFACTOR`、`DOC`（ドキュメント）。例: `FIX: 認証質問のバリデーション修正`。1コミット1論点を守る。
- PR には: 対応 Issue、目的と変更概要、動作確認手順、UI 変更のスクリーンショット、環境変数・移行手順の明記。差分を小さく保ち、レビューアの負担を減らす。
- ドキュメント追加/更新時は `docs/index.md` 更新と `DOC:` 系コミットをセットに。CI が全緑であることを確認してからレビュー依頼し、Lighthouse 阻害がないかを意識する。

## セキュリティ・設定
- 機密は `.env.local` に限定。`ENCRYPTION_KEY` は 64 桁 hex を使用し、Git へ絶対に含めない。環境差分は README の手順に沿って同期。
- 質問付き記事の正解値は暗号化ツールで生成し、平文を残さない。Cookie 設定（HttpOnly/Secure/SameSite=Strict）は変更しない。
