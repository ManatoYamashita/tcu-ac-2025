# ブランチ戦略

## 1. 基本方針
* **メインブランチ:** `main` (本番環境・直接Push禁止・Vercelデプロイ)
* **開発スタイル:** `main`から派生させたブランチで作業し、Github Actionsで作成したプルリクエスト（PR）経由でマージする。
* このリポジトリの開発に使用するアカウント
  * 個人用アカウント
  * name: `ManatoYamashita`
  * email: `info[at]manapuraza.com`

## 2. 命名規則（プレフィックス）
ブランチ名とコミットメッセージには、以下のプレフィックス付与が**必須**です。

| 種類 | プレフィックス | ブランチ名の例 | コミット/PR名の例 |
| :--- | :--- | :--- | :--- |
| **新機能** | `feature` / `FEATURE` | `feature/user-dashboard` | `FEATURE: ユーザー登録機能追加` |
| **バグ修正** | `fix` / `FIX` | `fix/login-error` | `FIX: ログインエラー修正` |
| **リファクタ** | `refactor` / `REFACTOR` | `refactor/components` | `REFACTOR: コード整理` |
| **ドキュメント** | `doc` / `DOC` | `doc/readme` | `DOC: 手順書更新` |
| **その他** | `style`, `test`, `chore` 等 | - | `STYLE: フォーマット修正` |

> **⚠️ 注意:** コミットメッセージは `PREFIX: 内容`（コロンの後にスペース）の形式を厳守してください。

## 3. 開発フロー
1.  **開始:** `main`をpullして最新にし、`git checkout -b feature/〇〇` でブランチを作成。
2.  **作業:** 細かくコミットする。コミット前にLint/型チェックを通す。
3.  **PR作成:** タイトルを `PREFIX: 内容` とし、詳細（変更点・影響範囲）を記述。
4.  **レビュー:** 最低1名の承認を得る。
5.  **マージ:** `main`へマージ（自動デプロイ）。

## 4. 自動化 (CI/CD)
GitHub Actionsにより、品質が自動的にチェックされます。
* **Feature(main以外) Push時:** Lint, Build検証, 検証に成功したらmainにサマリーをまとめてs自動PR作成。
* **Main Push時:** 本番Build検証, **Lighthouse CI（パフォーマンススコア90%以上必須）**。
