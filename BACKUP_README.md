# かんじょうにっき - プロジェクトバックアップ

## バックアップ日時
2025年1月21日

## プロジェクト概要
一般社団法人NAMIDAサポート協会が提唱するテープ式心理学に基づいた、自己肯定感を育てる感情日記アプリです。

## 🌟 主な機能

### ユーザー向け機能
- **感情日記**: 8種類のネガティブ感情を記録・分析
- **無価値感推移**: グラフによる自己肯定感の可視化
- **日記検索**: キーワード・日付・感情での高度な検索
- **SNSシェア**: 成長の記録をシェア
- **レスポンシブデザイン**: 全デバイス対応

### 管理者向け機能
- **管理画面**: カウンセラー専用の統合管理システム
- **カレンダー検索**: 視覚的な日付検索機能
- **カウンセラーメモ**: 各日記への専門的なメモ機能
- **担当者管理**: ワンクリックでの担当者割り当て
- **緊急度管理**: 3段階の緊急度設定・監視
- **データ管理**: Supabaseとの連携・同期機能

### 新機能（このバックアップ時点）
- **自動同期機能**: ローカルデータの自動Supabase同期
- **同意履歴管理**: プライバシーポリシー同意の完全追跡
- **LINE認証対応**: セキュアな認証システム（設定済み）
- **メンテナンスモード**: システム保守時の適切な案内

## 🚀 技術スタック

- **フロントエンド**: React + TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: LINE認証 + カスタム認証システム
- **デプロイ**: Netlify
- **開発環境**: Vite

## 📦 セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`を参考に`.env`ファイルを作成：

```env
# Supabase設定
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# LINE認証設定（オプション）
VITE_LINE_CHANNEL_ID=your_line_channel_id
VITE_LINE_CHANNEL_SECRET=your_line_channel_secret
VITE_LINE_REDIRECT_URI=your_redirect_uri
```

### 3. Supabaseデータベースの設定
`supabase/migrations/20250621151756_delicate_limit.sql`を実行してデータベーススキーマを作成

### 4. 開発サーバーの起動
```bash
npm run dev
```

## 🗄️ データベース構成

### 主要テーブル
- **users**: ユーザー情報
- **diary_entries**: 日記エントリー
- **counselors**: カウンセラー情報
- **chat_rooms**: チャットルーム
- **messages**: メッセージ
- **consent_histories**: 同意履歴（新規追加）

## 👥 カウンセラーアカウント

| 名前 | メールアドレス |
|------|----------------|
| 仁カウンセラー | jin@namisapo.com |
| AOIカウンセラー | aoi@namisapo.com |
| あさみカウンセラー | asami@namisapo.com |
| SHUカウンセラー | shu@namisapo.com |
| ゆーちゃカウンセラー | yucha@namisapo.com |
| sammyカウンセラー | sammy@namisapo.com |

**共通パスワード**: `counselor123`

## 🔧 新機能の詳細

### 自動同期機能
- アプリ起動時の自動ユーザー作成・確認
- 5分間隔でのローカルデータ自動同期
- 手動同期オプションも利用可能
- エラーハンドリングと状態表示

### 同意履歴管理
- プライバシーポリシー同意の完全追跡
- 法的要件に対応した履歴保存
- CSV出力機能
- 管理画面での一覧・検索機能

### LINE認証システム
- セキュアなOAuth2.0認証
- CSRF攻撃対策
- トークン管理とリフレッシュ
- 既存システムとの互換性維持

## 📱 対応環境

- **ブラウザ**: Chrome, Firefox, Safari, Edge (最新版)
- **デバイス**: デスクトップ, タブレット, スマートフォン
- **OS**: Windows, macOS, iOS, Android

## 🚀 デプロイ

### Netlifyデプロイ手順
1. `npm run build`でビルド
2. `dist`フォルダをNetlifyにアップロード
3. 環境変数を設定
4. `netlify.toml`の設定を確認

## 🔒 セキュリティ

- Row Level Security (RLS) による適切なデータアクセス制御
- カウンセラー専用認証システム
- ユーザーデータの適切な保護
- 同意履歴の法的要件対応

## 📄 重要な制約事項

- `pages`ディレクトリ以外は変更しないこと
- Tailwind設定ファイルに手を加えないこと
- 新しい依存パッケージはインストールしないこと
- データベースマイグレーションファイルは変更しないこと

## 🤝 開発者向け情報

### プロジェクト構造
```
src/
├── components/          # 共通コンポーネント
│   ├── AdminPanel.tsx   # 管理画面
│   ├── AutoSyncSettings.tsx # 自動同期設定
│   ├── ConsentHistoryManagement.tsx # 同意履歴管理
│   └── ...
├── pages/               # ページコンポーネント
├── lib/                 # ライブラリ
│   ├── supabase.ts      # Supabase設定
│   └── lineAuth.ts      # LINE認証
├── hooks/               # カスタムフック
│   ├── useSupabase.ts   # Supabase連携
│   ├── useAutoSync.ts   # 自動同期
│   └── useMaintenanceStatus.ts # メンテナンス状態
└── ...
```

## 📞 サポート

- **メール**: info@namisapo.com
- **受付時間**: 平日 9:00-17:00

---

**一般社団法人NAMIDAサポート協会**  
テープ式心理学による心の健康サポート

## バックアップ時点での主な変更点

1. **自動同期システムの実装**
   - `useAutoSync`フックによる自動データ同期
   - `AutoSyncSettings`コンポーネントでの設定管理
   - バックグラウンドでの定期同期（5分間隔）

2. **同意履歴管理システム**
   - `ConsentHistoryManagement`コンポーネント
   - プライバシーポリシー同意の完全追跡
   - CSV出力機能

3. **LINE認証システム**
   - `lineAuth.ts`による認証ライブラリ
   - セキュアなOAuth2.0実装
   - 既存システムとの互換性維持

4. **UI/UX改善**
   - カウンセラーログインボタンの文字色修正
   - データ管理画面の改善
   - エラーハンドリングの強化

5. **開発環境の最適化**
   - 不要なログ出力の削除
   - パフォーマンス改善
   - コードの整理とリファクタリング