# GitHubリポジトリ設定ガイド

## 1. GitHubでリポジトリを作成

1. GitHubにログインします
2. 右上の「+」ボタンをクリックし、「New repository」を選択します
3. 以下の情報を入力します：
   - Repository name: `kanjou-nikki`（または希望の名前）
   - Description: `感情日記アプリ - 自己肯定感を育てるテープ式心理学アプリ`
   - Visibility: Private（推奨）またはPublic
4. 「Create repository」ボタンをクリックします

## 2. ローカルリポジトリをGitHubにプッシュ

以下のコマンドを実行してリポジトリをGitHubにプッシュします：

```bash
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

## 3. 環境変数の設定

GitHubリポジトリには`.env`ファイルは含まれていません。以下の手順で環境変数を設定してください：

1. `.env.example`をコピーして`.env`を作成
2. Supabaseの設定値を入力
3. 必要に応じてローカルモードやメンテナンスモードの設定を追加

```env
# Supabase設定
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ローカルモード設定（オプション）
VITE_LOCAL_MODE=false

# メンテナンスモード設定（オプション）
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_MESSAGE=システムメンテナンス中です
VITE_MAINTENANCE_END_TIME=2025-01-22T10:00:00Z
```

これでGitHubリポジトリの設定は完了です！