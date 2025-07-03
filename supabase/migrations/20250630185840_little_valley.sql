/*
  # 日記同期問題の修正

  1. 変更内容
    - 日記エントリーテーブルのRLSポリシーを修正
    - 認証済みの全てのユーザーが全ての日記エントリーにアクセスできるようにする

  2. 目的
    - カウンセラー管理画面で全ての日記データを表示できるようにする
    - 同期エラーの解決
    - データの整合性確保
*/

-- 1. 既存のポリシーを確認して削除
DO $$ 
BEGIN
  -- diary_entriesテーブルのポリシーを削除
  DROP POLICY IF EXISTS "diary_entries_all_access" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_policy_v5" ON diary_entries;
  DROP POLICY IF EXISTS "Users can read counselor comments" ON diary_entries;
  DROP POLICY IF EXISTS "Users can manage own diary entries" ON diary_entries;
END $$;

-- 2. 新しいRLSポリシーの作成
-- 認証済みの全てのユーザーが全ての日記エントリーにアクセスできるようにする
CREATE POLICY "diary_entries_all_access" ON diary_entries
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. RLSを有効化
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 4. コメント
COMMENT ON POLICY "diary_entries_all_access" ON diary_entries IS 'すべての認証済みユーザーが全ての日記エントリーにアクセスできるようにするポリシー';