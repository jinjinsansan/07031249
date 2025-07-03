-- 1. カウンセラー管理画面の検索機能を修正するためのマイグレーション

-- 2. 既存のRLSポリシーを確認して削除
DO $$ 
BEGIN
  -- 既存のポリシーを確認して削除
  BEGIN
    DROP POLICY IF EXISTS "diary_entries_all_access" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v2" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v3" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v4" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v5" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v6" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v7" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v8" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v9" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v10" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_v11" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_final" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_all_access_fixed" ON diary_entries;
    DROP POLICY IF EXISTS "admin_panel_fix_policy" ON diary_entries;
    DROP POLICY IF EXISTS "admin_panel_search_fix" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_policy_v5" ON diary_entries;
    DROP POLICY IF EXISTS "Users can read counselor comments" ON diary_entries;
    DROP POLICY IF EXISTS "Users can manage own diary entries" ON diary_entries;
    DROP POLICY IF EXISTS "Allow all operations on diary entries for authenticated users" ON diary_entries;
  EXCEPTION
    WHEN OTHERS THEN
      -- エラーを無視して続行
      NULL;
  END;
END $$;

-- 3. 新しいRLSポリシーを作成
CREATE POLICY "diary_entries_full_access" ON diary_entries
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. 既存のNULL値を修正
UPDATE diary_entries
SET 
  counselor_memo = COALESCE(counselor_memo, ''),
  counselor_name = COALESCE(counselor_name, ''),
  assigned_counselor = COALESCE(assigned_counselor, ''),
  urgency_level = COALESCE(urgency_level, ''),
  is_visible_to_user = COALESCE(is_visible_to_user, false);

-- 5. 日記エントリーのインデックスを最適化
CREATE INDEX IF NOT EXISTS idx_diary_entries_emotion_date_user ON diary_entries(emotion, date, user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_counselor_memo_search ON diary_entries(counselor_memo);
CREATE INDEX IF NOT EXISTS idx_diary_entries_event_search ON diary_entries(event);
CREATE INDEX IF NOT EXISTS idx_diary_entries_realization_search ON diary_entries(realization);

-- 6. コメント
COMMENT ON POLICY "diary_entries_full_access" ON diary_entries IS '認証済みユーザーが全ての日記エントリーにアクセスできるようにするポリシー';