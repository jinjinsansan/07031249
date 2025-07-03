-- かんじょうにっき カウンセラーコメント機能
-- 最小限の変更でカウンセラーコメント機能を追加（互換性バージョン）

-- diary_entriesテーブルにカウンセラーコメント関連のフィールドを追加
DO $$ 
BEGIN
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
  
  -- counselor_memoカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_memo'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_memo text;
  END IF;
END $$;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_is_visible_to_user ON diary_entries(is_visible_to_user);

-- コメント
COMMENT ON COLUMN diary_entries.is_visible_to_user IS 'カウンセラーメモをユーザーに表示するかどうか';
COMMENT ON COLUMN diary_entries.counselor_name IS 'メモを書いたカウンセラーの名前';
COMMENT ON COLUMN diary_entries.counselor_memo IS 'カウンセラーのメモ';

-- RLSポリシーの作成（すべてのユーザーがアクセス可能）
-- IF NOT EXISTS を使わない方法
DO $$ 
BEGIN
  -- 既存のポリシーを確認して削除
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'diary_entries' AND policyname = 'diary_entries_all_access'
  ) THEN
    DROP POLICY diary_entries_all_access ON diary_entries;
  END IF;
END $$;

-- ポリシーを作成
CREATE POLICY diary_entries_all_access ON diary_entries
    FOR ALL 
    USING (true)
    WITH CHECK (true);