# GitHubリポジトリ作成手順

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

## 4. Netlifyデプロイ設定

Netlifyでデプロイする場合は、以下の設定を行ってください：

1. Netlifyにログインし、「New site from Git」をクリック
2. GitHubを選択し、リポジトリを選択
3. ビルド設定を入力：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 環境変数を設定：
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. 「Deploy site」をクリック

## 5. 移行後の確認事項

1. **環境確認**: `npm run dev`でローカル環境が正常に動作することを確認
2. **Supabase接続**: 環境変数を設定してSupabase接続を確認
3. **自動同期テスト**: 新しいユーザーでアプリを開いて自動同期をテスト
4. **機能テスト**: 日記作成、検索、管理画面の動作確認
5. **カウンセラーログイン**: 管理画面へのアクセス確認
6. **デバイス認証**: 管理画面の「デバイス認証」「セキュリティ」タブの確認
7. **カウンセラーコメント**: コメント表示機能の確認
8. **データバックアップ**: バックアップ作成と復元機能の確認

これでGitHubへの移行が完了します！