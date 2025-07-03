# デプロイ情報

## 🚀 デプロイ状況

- **デプロイURL**: https://apl.namisapo2.love
- **デプロイ日時**: 2025年7月1日
- **デプロイプラットフォーム**: Netlify
- **ステータス**: 稼働中

## 📋 デプロイ設定

### Netlify設定
- **ビルドコマンド**: `npm run build`
- **公開ディレクトリ**: `dist`
- **リダイレクト**: `netlify.toml`で設定済み

### 環境変数
以下の環境変数をNetlifyの環境変数設定で設定する必要があります：

```
VITE_SUPABASE_URL=https://afojjlfuwglzukzinpzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2pqbGZ1d2dsenVremlucHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDc4MzEsImV4cCI6MjA2NjE4MzgzMX0.ovSwuxvBL5gHtW4XdDkipz9QxWL_njAkr7VQgy1uVRY
VITE_MAINTENANCE_MODE=false
```

### netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 🔄 デプロイ手順

### 手動デプロイ
1. `npm run build`でビルド
2. `dist`フォルダをNetlifyにアップロード
3. 環境変数を設定

### 自動デプロイ（GitHub連携時）
1. GitHubリポジトリをNetlifyに接続
2. ビルド設定を構成
3. 環境変数を設定
4. メインブランチへのプッシュで自動デプロイ

## 🔍 デプロイ後の確認事項

- [ ] ログイン機能が正常に動作するか
- [ ] 日記の作成・編集・削除が正常に動作するか
- [ ] 検索機能が正常に動作するか
- [ ] 無価値感推移グラフが正常に表示されるか
- [ ] SNSシェア機能が正常に動作するか
- [ ] カウンセラーログインが正常に動作するか
- [ ] 管理画面の各機能が正常に動作するか
- [ ] レスポンシブデザインが正常に表示されるか

## 🛠️ トラブルシューティング

### よくある問題
1. **Supabase接続エラー**: 環境変数の確認
2. **ビルドエラー**: 依存関係の確認
3. **ルーティングエラー**: netlify.tomlの設定確認
4. **認証エラー**: Supabaseの設定確認

### 対応方法
1. Netlifyのデプロイログを確認
2. 環境変数が正しく設定されているか確認
3. ローカル環境で`npm run build`を実行して問題がないか確認
4. 必要に応じて再デプロイを実行

## 📞 サポート情報

- **開発者**: 一般社団法人NAMIDAサポート協会
- **メール**: info@namisapo.com
- **受付時間**: 平日 9:00-17:00

---

**一般社団法人NAMIDAサポート協会**  
テープ式心理学による心の健康サポート

**最終更新日**: 2025年7月1日