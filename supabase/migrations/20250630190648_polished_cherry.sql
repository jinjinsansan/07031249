-- 1. 既存のポリシーを確認して削除
DO $$ 
BEGIN
  -- diary_entriesテーブルのポリシーを削除
  DROP POLICY IF EXISTS "diary_entries_all_access" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v2" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_policy_v5" ON diary_entries;
  DROP POLICY IF EXISTS "Users can read counselor comments" ON diary_entries;
  DROP POLICY IF EXISTS "Users can manage own diary entries" ON diary_entries;
  DROP POLICY IF EXISTS "Allow all operations on diary entries for authenticated users" ON diary_entries;
END $$;

-- 2. 新しいRLSポリシーの作成
-- 認証済みの全てのユーザーが全ての日記エントリーにアクセスできるようにする
CREATE POLICY "diary_entries_all_access_v3" ON diary_entries
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. RLSを有効化
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 4. コメント
COMMENT ON POLICY "diary_entries_all_access_v3" ON diary_entries IS 'すべての認証済みユーザーが全ての日記エントリーにアクセスできるようにするポリシー';