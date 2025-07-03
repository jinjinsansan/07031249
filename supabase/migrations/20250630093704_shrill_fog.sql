/*
  # 不足しているカラムの追加

  1. 変更内容
    - `diary_entries`テーブルに以下のフィールドを追加（存在しない場合のみ）
      - `assigned_counselor` (text) - 担当カウンセラーの名前
      - `urgency_level` (text) - 緊急度（high, medium, low）
      - `counselor_memo` (text) - カウンセラーのメモ
      - `is_visible_to_user` (boolean) - ユーザーにメモを表示するかどうか
      - `counselor_name` (text) - メモを書いたカウンセラーの名前

  2. インデックス
    - 各フィールドに適切なインデックスを作成

  3. 目的
    - アプリケーションコードとデータベーススキーマの整合性を確保
    - 同期エラーの解決
*/

-- 不足しているカラムを追加
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

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_assigned_counselor ON diary_entries(assigned_counselor);
CREATE INDEX IF NOT EXISTS idx_diary_entries_urgency_level ON diary_entries(urgency_level);
CREATE INDEX IF NOT EXISTS idx_diary_entries_is_visible_to_user ON diary_entries(is_visible_to_user);
CREATE INDEX IF NOT EXISTS idx_diary_entries_counselor_memo ON diary_entries USING gin(to_tsvector('japanese', coalesce(counselor_memo, '')));

-- コメント
COMMENT ON COLUMN diary_entries.assigned_counselor IS '担当カウンセラーの名前';
COMMENT ON COLUMN diary_entries.urgency_level IS '緊急度（high, medium, low）';
COMMENT ON COLUMN diary_entries.counselor_memo IS 'カウンセラーのメモ';
COMMENT ON COLUMN diary_entries.is_visible_to_user IS 'カウンセラーメモをユーザーに表示するかどうか';
COMMENT ON COLUMN diary_entries.counselor_name IS 'メモを書いたカウンセラーの名前';