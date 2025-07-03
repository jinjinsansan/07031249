# GitHubリポジトリ作成手順

## 1. GitHubアカウントにログイン
まず、GitHubアカウントにログインしてください。アカウントをお持ちでない場合は、[GitHub](https://github.com/)で新規作成できます。

## 2. 新しいリポジトリを作成
1. GitHubのホームページ右上の「+」ボタンをクリックし、「New repository」を選択
2. 以下の情報を入力：
   - Repository name: `kanjou-nikki`（または希望の名前）
   - Description: `感情日記アプリ - 自己肯定感を育てるテープ式心理学アプリ`
   - Visibility: Private（推奨）またはPublic
   - 「Initialize this repository with a README」のチェックを外す
3. 「Create repository」ボタンをクリック

## 3. ローカルリポジトリの初期化とプッシュ

```bash
# プロジェクトディレクトリに移動
cd /path/to/your/project

# Gitを初期化
git init

# .gitignoreファイルを作成
cat > .gitignore << EOL
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
.DS_Store
*.log
.vscode/
.idea/
EOL

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "初回コミット: 感情日記アプリ - 完全版"

# リモートリポジトリを追加（URLを自分のリポジトリに置き換え）
git remote add origin https://github.com/YOUR_USERNAME/kanjou-nikki.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

## 4. 環境変数の設定

GitHubリポジトリには`.env`ファイルは含まれていません。以下の手順で環境変数を設定してください：

1. `.env.example`をコピーして`.env`を作成
2. Supabaseの設定値を入力
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

## 5. README.mdの更新

リポジトリのREADME.mdを以下の内容で更新することをお勧めします：

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

## 6. GitHub Actionsの設定（オプション）

自動デプロイを設定する場合は、`.github/workflows/deploy.yml`を作成：

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

## 7. 移行後の確認事項

1. **環境確認**: `npm run dev`でローカル環境が正常に動作することを確認
2. **Supabase接続**: 環境変数を設定してSupabase接続を確認
3. **自動同期テスト**: 新しいユーザーでアプリを開いて自動同期をテスト
4. **機能テスト**: 日記作成、検索、管理画面の動作確認
5. **カウンセラーログイン**: 管理画面へのアクセス確認
6. **デバイス認証**: 管理画面の「デバイス認証」「セキュリティ」タブの確認
7. **カウンセラーコメント**: コメント表示機能の確認
8. **データバックアップ**: バックアップ作成と復元機能の確認

これでGitHubへの移行が完了します！