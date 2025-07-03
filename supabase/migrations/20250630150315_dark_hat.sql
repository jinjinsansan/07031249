/*
  # カウンセラーコメント機能の修正

  1. 変更内容
    - カウンセラーコメント関連のフィールドを確実に存在させる
    - 既存のカラムの制約を修正
    - RLSポリシーの更新

  2. 目的
    - 「Could not find the 'assigned_counselor' column of 'diary_entries'」エラーの解決
    - カウンセラーコメント機能の安定化
    - データ同期エラーの防止
*/

-- 1. カウンセラーコメント関連のフィールドを確実に存在させる
DO $$ 
BEGIN
  -- assigned_counselorカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'assigned_counselor'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN assigned_counselor text;
  END IF;

  -- urgency_levelカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'urgency_level'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN urgency_level text CHECK (urgency_level IN ('high', 'medium', 'low') OR urgency_level IS NULL);
  END IF;
  
  -- counselor_memoカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_memo'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_memo text;
  END IF;
  
  -- is_visible_to_userカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'is_visible_to_user'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN is_visible_to_user boolean DEFAULT false;
  END IF;
  
  -- counselor_nameカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_name'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_name text;
  END IF;
END $$;

-- 2. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_assigned_counselor ON diary_entries(assigned_counselor);
CREATE INDEX IF NOT EXISTS idx_diary_entries_urgency_level ON diary_entries(urgency_level);
CREATE INDEX IF NOT EXISTS idx_diary_entries_is_visible_to_user ON diary_entries(is_visible_to_user);
CREATE INDEX IF NOT EXISTS idx_diary_entries_counselor_memo ON diary_entries(counselor_memo);

-- 3. RLSポリシーの設定
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを確認してから新しいポリシーを作成
DO $$ 
BEGIN
  -- diary_entries_all_accessポリシーが存在するか確認
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'diary_entries' AND policyname = 'diary_entries_all_access'
  ) THEN
    -- ポリシーが存在しない場合のみ作成
    EXECUTE 'CREATE POLICY "diary_entries_all_access" ON diary_entries
      FOR ALL 
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- 4. コメント
COMMENT ON COLUMN diary_entries.assigned_counselor IS '担当カウンセラーの名前';
COMMENT ON COLUMN diary_entries.urgency_level IS '緊急度（high, medium, low）';
COMMENT ON COLUMN diary_entries.counselor_memo IS 'カウンセラーのメモ';
COMMENT ON COLUMN diary_entries.is_visible_to_user IS 'カウンセラーメモをユーザーに表示するかどうか';
COMMENT ON COLUMN diary_entries.counselor_name IS 'メモを書いたカウンセラーの名前';