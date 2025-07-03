# かんじょうにっき - 開発ガイド

## 🎯 開発継続のための重要情報

### ⚠️ 重要な制約事項（必須遵守）
```
# Bolt への指示
- pages ディレクトリ以外は変更しないこと
- Tailwind 設定ファイルに手を加えないこと
- 新しい依存パッケージはインストールしないこと
- supabase/migrations/ 内のファイルは変更しないこと
```

## 🚀 現在の開発状況（2025年6月30日時点）

### ✅ 完成済み機能
- **感情日記システム**: 作成・編集・削除・検索機能
- **無価値感推移グラフ**: データ可視化とSNSシェア
- **カウンセラー管理画面**: 
  - 日記管理・高度検索・カレンダー検索
  - カウンセラーメモ機能
  - 担当者割り当て・緊急度管理
- **🆕 自動同期システム**: ローカル↔Supabase自動同期
- **🆕 同意履歴管理**: プライバシーポリシー同意の完全追跡
- **🆕 デバイス認証システム**: PIN番号認証、秘密の質問、セキュリティダッシュボード
- **🆕 データバックアップ・復元機能**: ローカルデータのバックアップと復元
- **レスポンシブデザイン**: 全デバイス対応
- **🆕 ポジティブ感情対応**: 嬉しい、感謝、達成感、幸せなどのポジティブ感情にも対応

## 🆕 新機能の詳細

### 自動同期システム
- **場所**: `src/hooks/useAutoSync.ts`, `src/components/AutoSyncSettings.tsx`
- **機能**: 
  - アプリ起動時の自動ユーザー作成・確認
  - 5分間隔でのローカルデータ自動同期
  - 手動同期オプション
  - エラーハンドリングと状態表示
- **使用方法**: `src/App.tsx`で`useAutoSync()`フックを呼び出し済み

### 同意履歴管理
- **場所**: `src/components/ConsentHistoryManagement.tsx`
- **機能**:
  - プライバシーポリシー同意の完全追跡
  - 法的要件に対応した履歴保存
  - CSV出力機能
  - 管理画面での一覧・検索機能
- **データ**: `consent_histories`テーブルとローカルストレージ

### デバイス認証システム
- **場所**: `src/lib/deviceAuth.ts`, `src/components/DeviceAuthLogin.tsx`
- **機能**:
  - デバイスフィンガープリント生成・照合
  - PIN番号認証（6桁）
  - 秘密の質問による復旧機能
  - アカウントロック機能（5回失敗で24時間ロック）
  - セキュリティイベントログ
  - デバイス認証管理画面
  - セキュリティダッシュボード

### カウンセラーコメント機能
- **場所**: `src/components/AdminPanel.tsx`, `src/pages/DiarySearchPage.tsx`
- **機能**:
  - カウンセラーメモをユーザーに表示する機能
  - カウンセラー名の表示
  - 表示/非表示の切り替え
  - ユーザー検索画面での表示

### データバックアップ・復元機能
- **場所**: `src/components/DataBackupRecovery.tsx`, `src/components/UserDataManagement.tsx`
- **機能**:
  - ローカルデータのJSONバックアップ
  - バックアップファイルからの復元
  - 端末変更時のデータ移行サポート

### ポジティブ感情対応
- **場所**: `src/pages/DiaryPage.tsx`, `src/pages/EmotionTypes.tsx`
- **機能**:
  - 嬉しい、感謝、達成感、幸せなどのポジティブ感情にも対応
  - 感情選択UIの改善（ネガティブ/ポジティブのセクション分け）
  - 感情タイプ説明ページの拡充

## 📁 重要なファイル構成

### 新規追加されたファイル
```
src/
├── hooks/
│   └── useAutoSync.ts              # 自動同期フック
├── components/
│   ├── AutoSyncSettings.tsx        # 自動同期設定UI
│   ├── ConsentHistoryManagement.tsx # 同意履歴管理UI
│   ├── DataBackupRecovery.tsx      # データバックアップ・復元
│   ├── UserDataManagement.tsx      # ユーザーデータ管理
│   ├── DeviceAuthLogin.tsx         # デバイス認証ログイン
│   ├── DeviceAuthRegistration.tsx  # デバイス認証登録
│   ├── DeviceAuthManagement.tsx    # デバイス認証管理画面
│   └── SecurityDashboard.tsx       # セキュリティダッシュボード
└── lib/
    ├── deviceAuth.ts               # デバイス認証システム
    └── cleanupTestData.ts          # テストデータ削除ロジック
```

### 主要な変更があったファイル
```
src/
├── App.tsx                         # 自動同期フック追加、UI改善、データ管理メニュー追加
├── lib/supabase.ts                 # 同意履歴サービス追加、本番環境対応
├── hooks/useSupabase.ts            # 自動同期対応
├── components/
│   ├── AdminPanel.tsx              # カウンセラーコメント機能追加
│   ├── DataMigration.tsx           # 自動同期タブ追加、統計表示
│   ├── PrivacyConsent.tsx          # 同意履歴記録機能追加
├── hooks/useMaintenanceStatus.ts   # パフォーマンス改善
├── pages/
│   ├── DiaryPage.tsx               # ポジティブ感情対応
│   ├── DiarySearchPage.tsx         # カウンセラーコメント表示
│   ├── EmotionTypes.tsx            # ポジティブ感情追加
│   └── NextSteps.tsx               # ポジティブ感情説明追加
```

## 🎯 開発継続時の注意点

### 1. 自動同期機能
- `useAutoSync`フックは既に`App.tsx`で呼び出し済み
- ユーザーがアプリを開くと自動的にSupabaseユーザーが作成される
- 5分間隔で自動同期が実行される
- 手動での操作は基本的に不要

### 2. 同意履歴管理
- プライバシーポリシー同意時に自動的に履歴が記録される
- 管理画面の「カウンセラー」タブから履歴を確認可能
- CSV出力機能で法的要件に対応

### 3. データバックアップ・復元
- ユーザーはデータ管理画面からバックアップを作成可能
- バックアップファイルからデータを復元可能
- 端末変更時のデータ移行に活用

### 4. ポジティブ感情対応
- ポジティブな感情を選択した場合もスコアを入力可能
- 無価値感推移グラフにポジティブ感情のスコアも表示
- 感情タイプ説明ページにポジティブ感情の説明を追加

## 🔄 データフロー

### 自動同期フロー
1. アプリ起動 → `useAutoSync`フック実行
2. Supabase接続確認 → ユーザー存在確認
3. ユーザー未存在の場合 → 自動作成
4. ローカルデータ存在確認 → 自動同期実行
5. 5分間隔で定期同期実行

### 同意履歴フロー
1. プライバシーポリシー表示 → ユーザー同意/拒否
2. 同意履歴をローカルストレージに記録
3. 自動同期により Supabase に同期
4. 管理画面で履歴確認・CSV出力

### データバックアップフロー
1. ユーザーがデータ管理画面でバックアップ作成
2. ローカルストレージのデータをJSONに変換
3. JSONファイルをダウンロード
4. 必要に応じてバックアップファイルから復元

## 🔧 環境変数設定
```env
# Supabase設定（必須）
VITE_SUPABASE_URL=https://afojjlfuwglzukzinpzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2pqbGZ1d2dsenVremlucHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDc4MzEsImV4cCI6MjA2NjE4MzgzMX0.ovSwuxvBL5gHtW4XdDkipz9QxWL_njAkr7VQgy1uVRY

# ローカルモード設定（オプション）
VITE_LOCAL_MODE=false

# メンテナンスモード設定（オプション）
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_MESSAGE=システムメンテナンス中です
VITE_MAINTENANCE_END_TIME=2025-01-22T10:00:00Z
```

## 👥 カウンセラーアカウント
| メールアドレス | パスワード |
|----------------|------------|
| jin@namisapo.com (心理カウンセラー仁) | counselor123 |
| aoi@namisapo.com (心理カウンセラーAOI) | counselor123 |
| asami@namisapo.com (心理カウンセラーあさみ) | counselor123 |
| shu@namisapo.com (心理カウンセラーSHU) | counselor123 |
| yucha@namisapo.com (心理カウンセラーゆーちゃ) | counselor123 |
| sammy@namisapo.com (心理カウンセラーSammy) | counselor123 |

## 🔍 トラブルシューティング

### よくある問題
1. **Supabase接続エラー**: 環境変数の確認
2. **自動同期が動作しない**: ブラウザのコンソールでエラー確認
3. **カウンセラーログインできない**: パスワード`counselor123`を確認
4. **バックアップが復元できない**: ファイル形式の確認

### デバッグ方法
- ブラウザのコンソールでエラーを確認
- ローカルストレージの内容を確認
- 開発者ツールのネットワークタブでAPI通信を確認

## 🎯 次回開発時の推奨アクション

1. **環境確認**: `npm run dev`でローカル環境が正常に動作することを確認
2. **Supabase接続**: 環境変数を設定してSupabase接続を確認
3. **自動同期テスト**: 新しいユーザーでアプリを開いて自動同期をテスト
4. **機能テスト**: 日記作成、検索、管理画面の動作確認
5. **新機能開発**: 既存の制約事項を守りながら新機能を追加
6. **デバイス認証テスト**: 管理画面の「デバイス認証」「セキュリティ」タブの確認
7. **データバックアップテスト**: バックアップ作成と復元機能の確認

---

**一般社団法人NAMIDAサポート協会**  
テープ式心理学による心の健康サポート