# GitHub移行ガイド - 最終版

## 🚀 GitHub リポジトリ作成手順

### 1. GitHub でリポジトリを作成
1. GitHub にログイン
2. 「New repository」をクリック
3. リポジトリ名: `kanjou-nikki` または `emotion-diary`
4. 説明: `感情日記アプリ - 自己肯定感を育てるテープ式心理学アプリ`
5. Public または Private を選択
6. 「Create repository」をクリック

### 2. ローカルでの Git 初期化

```bash
# プロジェクトディレクトリに移動
cd /path/to/your/project

# Git 初期化
git init

# .gitignore ファイルを作成
echo "node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
.DS_Store
*.log
.vscode/
.idea/" > .gitignore

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: 感情日記アプリ - 完全版"

# リモートリポジトリを追加（YOUR_USERNAMEとREPO_NAMEを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 3. 環境変数の設定

GitHub リポジトリには `.env` ファイルは含まれていません。
以下の手順で環境変数を設定してください：

1. `.env.example` をコピーして `.env` を作成
2. Supabase の設定値を入力
3. 必要に応じてメンテナンスモードの設定を追加

```env
# Supabase設定（必須）
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# メンテナンスモード設定（オプション）
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_MESSAGE=システムメンテナンス中です
VITE_MAINTENANCE_END_TIME=2025-01-22T10:00:00Z
```

### 4. README.md の更新

リポジトリの README.md を以下の内容で更新することをお勧めします：

```markdown
# かんじょうにっき - 感情日記アプリ

一般社団法人NAMIDAサポート協会が提唱するテープ式心理学に基づいた、自己肯定感を育てる感情日記アプリです。

## 🌟 主な機能

- 8種類のネガティブ感情の記録・分析
- 無価値感推移のグラフ表示
- 高度な検索機能
- カウンセラー管理画面
- 自動同期機能
- 同意履歴管理
- デバイス認証システム
- カウンセラーコメント機能
- データバックアップ・復元機能
- SNSシェア機能（X/Twitter対応）

## 🚀 技術スタック

- React + TypeScript
- Tailwind CSS
- Supabase
- Vite

## 📦 セットアップ

```bash
npm install
cp .env.example .env
# .env ファイルを編集
npm run dev
```

## 📄 ライセンス

一般社団法人NAMIDAサポート協会
```

### 5. GitHub Actions の設定（オプション）

自動デプロイを設定する場合は、`.github/workflows/deploy.yml` を作成：

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './dist'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 6. 協力者の招待

チーム開発の場合：
1. GitHub リポジトリの「Settings」→「Manage access」
2. 「Invite a collaborator」で協力者を招待
3. 適切な権限を設定

### 7. ブランチ戦略

推奨ブランチ戦略：
- `main`: 本番環境用
- `develop`: 開発環境用
- `feature/*`: 機能開発用

### 8. Issue テンプレートの作成

`.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: バグレポート
about: バグを報告する
title: '[BUG] '
labels: bug
assignees: ''
---

## バグの説明
バグの内容を簡潔に説明してください。

## 再現手順
1. '...' に移動
2. '...' をクリック
3. '...' まで下にスクロール
4. エラーを確認

## 期待される動作
何が起こるべきだったかを説明してください。

## スクリーンショット
可能であれば、問題を説明するスクリーンショットを追加してください。

## 環境
- OS: [例: iOS]
- ブラウザ: [例: chrome, safari]
- バージョン: [例: 22]
```

### 9. プルリクエストテンプレート

`.github/pull_request_template.md`:

```markdown
## 変更内容
この PR で何を変更したかを説明してください。

## 変更の種類
- [ ] バグ修正
- [ ] 新機能
- [ ] 破壊的変更
- [ ] ドキュメント更新

## テスト
- [ ] 既存のテストが通ることを確認
- [ ] 新しいテストを追加（該当する場合）

## チェックリスト
- [ ] コードレビューの準備ができている
- [ ] 自己レビューを実施済み
- [ ] 関連するドキュメントを更新済み
```

## 🎯 移行後の推奨アクション

1. **初回セットアップの確認**
   - `npm install` が正常に完了することを確認
   - 環境変数が正しく設定されていることを確認
   - `npm run dev` でアプリが起動することを確認

2. **Supabase の設定**
   - データベースマイグレーションの実行
   - RLS ポリシーの確認
   - 環境変数の設定

3. **デプロイの設定**
   - Netlify または他のホスティングサービスの設定
   - 環境変数の設定
   - ビルドコマンドの確認

4. **チーム開発の準備**
   - 協力者の招待
   - ブランチ保護ルールの設定
   - Issue・PR テンプレートの設定

## 🔄 最新の変更点

1. **シェア機能の強化**
   - 日記内容のプレビュー表示
   - 感情に対応する絵文字の追加
   - X/Twitterへの直接シェア機能
   - プライバシーに配慮した内容表示

2. **カウンセラーコメント機能の実装**
   - カウンセラーメモをユーザーに表示する機能
   - 表示/非表示の切り替え機能
   - カウンセラー名の表示機能

3. **自動同期システムの実装**
   - `useAutoSync`フックによる自動データ同期
   - `AutoSyncSettings`コンポーネントでの設定管理
   - バックグラウンドでの定期同期（5分間隔）

4. **同意履歴管理システム**
   - `ConsentHistoryManagement`コンポーネント
   - プライバシーポリシー同意の完全追跡
   - CSV出力機能

5. **デバイス認証システム**
   - `deviceAuth.ts`による認証ライブラリ
   - セキュアなPIN番号認証
   - 秘密の質問による復旧機能
   - セキュリティダッシュボード

これでGitHubへの移行が完了します！