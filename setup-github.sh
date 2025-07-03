#!/bin/bash

# かんじょうにっき GitHub セットアップスクリプト

echo "かんじょうにっき GitHub セットアップを開始します..."
echo ""

# .gitignoreが存在するか確認
if [ ! -f .gitignore ]; then
  echo "Creating .gitignore file..."
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
  echo ".gitignore ファイルを作成しました"
fi

# .envファイルが存在するか確認
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo ".env ファイルを作成しました。必要に応じて編集してください。"
  else
    echo "Error: .env.example ファイルが見つかりません"
    exit 1
  fi
fi

# Gitリポジトリを初期化
if [ ! -d .git ]; then
  echo "Gitリポジトリを初期化しています..."
  git init
  echo "Gitリポジトリを初期化しました"
fi

# ファイルをステージング
echo "ファイルをステージングしています..."
git add .

# 初回コミット
echo "初回コミットを作成しています..."
git commit -m "初回コミット: 感情日記アプリ - 完全版"

echo ""
echo "GitHubリポジトリのURLを入力してください (例: https://github.com/username/kanjou-nikki.git):"
read repo_url

if [ -z "$repo_url" ]; then
  echo "リポジトリURLが入力されていません。後で手動で設定してください。"
  echo "コマンド例: git remote add origin https://github.com/username/kanjou-nikki.git"
else
  # リモートリポジトリを追加
  echo "リモートリポジトリを追加しています..."
  git remote add origin $repo_url
  
  # メインブランチにプッシュ
  echo "メインブランチにプッシュしています..."
  git branch -M main
  git push -u origin main
fi

echo ""
echo "セットアップが完了しました！"
echo "次のステップ:"
echo "1. Supabaseの設定を確認"
echo "2. .env ファイルを編集"
echo "3. npm run dev でアプリを起動"
echo ""
echo "詳細は README.md と GITHUB_MIGRATION_GUIDE.md を参照してください"