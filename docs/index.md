# manapuraza blog - ドキュメント索引

このディレクトリには、manapuraza blog システムに関する全てのドキュメントが格納されています。

## クイックスタート

初めての方は、まず[セットアップガイド](./guides/setup.md)をご覧ください。

## ドキュメント構成

### 📘 ガイド (guides/)

開発者向けの実践的なガイドドキュメント

- [セットアップガイド](./guides/setup.md) - 環境構築と初期設定の手順
- [ブログ記事追加ガイド](./guides/blog-posting.md) - 記事の作成・管理方法
- [SEO設定ガイド](./guides/seo.md) - SEO機能の使い方と最適化
- [管理者マニュアル](./guides/admin-manual.md) - 記事・質問管理の運用ガイド
- [トラブルシューティング](./guides/troubleshooting.md) - よくある問題と解決方法

### 🏗️ アーキテクチャ (architecture/)

システム設計と技術的な背景に関するドキュメント

- [システム概要](./architecture/overview.md) - 全体構成とコンポーネント図
- [セキュリティモデル](./architecture/security.md) - 暗号化・認証・認可の仕組み
- [データフロー](./architecture/data-flow.md) - リクエストから応答までの処理の流れ

### 📚 リファレンス (reference/)

API仕様と関数の詳細なリファレンス

- [Server Actions](./reference/server-actions.md) - Server Actions APIの仕様
- [ユーティリティ関数](./reference/utilities.md) - 共通関数のリファレンス
- [型定義](./reference/types.md) - TypeScript型定義の一覧

### 📋 要件定義 (requirement/)

プロジェクトの要件定義と仕様書

- [システム仕様書](./requirement/spec.md) - 完全な要件定義と技術仕様

### 🛠️ 開発者向け (dev/)

開発フローとCI/CDに関するドキュメント

- [ブランチ戦略](./dev/branch.md) - Git運用とブランチ命名規則
- [CI/CDガイド](./dev/ci-cd.md) - GitHub Actions ワークフロー

## 推奨読み順

### 新規開発者向け

1. [セットアップガイド](./guides/setup.md) - 環境構築
2. [ブログ記事追加ガイド](./guides/blog-posting.md) - 記事の追加方法
3. [システム概要](./architecture/overview.md) - 全体像の把握
4. [管理者マニュアル](./guides/admin-manual.md) - 基本的な運用方法

### 技術詳細を知りたい方

1. [システム仕様書](./requirement/spec.md) - 完全な要件
2. [セキュリティモデル](./architecture/security.md) - セキュリティ設計
3. [データフロー](./architecture/data-flow.md) - 内部処理の詳細

### リファレンスとして活用する方

- [型定義](./reference/types.md) - 型情報を確認
- [Server Actions](./reference/server-actions.md) - API仕様を確認
- [ユーティリティ関数](./reference/utilities.md) - 便利関数を確認

## 貢献ガイドライン

ドキュメントの追加・修正を行う場合は、以下のルールに従ってください：

- 各ドキュメントは適切なサブディレクトリに配置する
- マークダウン形式で記述する
- 技術用語には適宜説明を付ける
- コード例を含める場合は、動作確認済みのものを使用する

## メンテナンス

ドキュメントは定期的に見直し、最新の実装状況を反映させてください。
