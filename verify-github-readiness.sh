#!/bin/bash

# かんじょうにっき GitHub 移行準備確認スクリプト

echo "かんじょうにっき GitHub 移行準備確認を開始します..."
echo ""

# 必要なファイルの確認
echo "必要なファイルの確認:"
required_files=(".env.example" "README.md" "package.json" "vite.config.ts" "tsconfig.json" "tailwind.config.js")
missing_files=0

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file が存在します"
  else
    echo "❌ $file が見つかりません"
    missing_files=$((missing_files+1))
  fi
done

# ディレクトリの確認
echo ""
echo "必要なディレクトリの確認:"
required_dirs=("src" "public" "supabase")
missing_dirs=0

for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir ディレクトリが存在します"
  else
    echo "❌ $dir ディレクトリが見つかりません"
    missing_dirs=$((missing_dirs+1))
  fi
done

# 移行ガイドの確認
echo ""
echo "移行ガイドの確認:"
if [ -f "GITHUB_MIGRATION_GUIDE.md" ]; then
  echo "✅ GITHUB_MIGRATION_GUIDE.md が存在します"
else
  echo "❌ GITHUB_MIGRATION_GUIDE.md が見つかりません"
  missing_files=$((missing_files+1))
fi

# .gitignoreの確認
echo ""
echo ".gitignoreの確認:"
if [ -f ".gitignore" ]; then
  echo "✅ .gitignore が存在します"
  
  # node_modulesが除外されているか確認
  if grep -q "node_modules" .gitignore; then
    echo "✅ node_modules が除外されています"
  else
    echo "⚠️ node_modules が.gitignoreに含まれていません"
  fi
  
  # .envが除外されているか確認
  if grep -q "\.env" .gitignore; then
    echo "✅ .env が除外されています"
  else
    echo "⚠️ .env が.gitignoreに含まれていません"
  fi
else
  echo "❌ .gitignore が見つかりません"
  missing_files=$((missing_files+1))
fi

# 結果の表示
echo ""
echo "確認結果:"
if [ $missing_files -eq 0 ] && [ $missing_dirs -eq 0 ]; then
  echo "✅ すべての必要なファイルとディレクトリが存在します"
  echo "GitHub移行の準備が整っています！"
else
  echo "⚠️ $missing_files 個のファイルと $missing_dirs 個のディレクトリが見つかりません"
  echo "GitHub移行前に上記の問題を解決してください"
fi

echo ""
echo "移行手順:"
echo "1. setup-github.sh スクリプトを実行"
echo "2. GitHubリポジトリを作成"
echo "3. リポジトリURLを入力"
echo "4. プッシュが完了したらNetlifyでデプロイを設定"
echo ""
echo "詳細は GITHUB_MIGRATION_GUIDE.md を参照してください"