/*
  # カウンセラーメモ機能の追加

  1. 新しいフィールド
    - `diary_entries` テーブルに追加:
      - `counselor_memo` (text) - カウンセラーのメモ内容
      - `assigned_counselor` (text) - 担当カウンセラーの名前
      - `urgency_level` (text) - 緊急度（high, medium, low）

  2. インデックス
    - 各フィールドに対するインデックスを作成
*/

-- diary_entriesテーブルに不足しているカラムを追加
DO $$ 
BEGIN
  -- counselor_memoカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_memo'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_memo text;
  END IF;

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
END $$;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_counselor_memo ON diary_entries USING gin(to_tsvector('japanese', coalesce(counselor_memo, '')));
CREATE INDEX IF NOT EXISTS idx_diary_entries_assigned_counselor ON diary_entries(assigned_counselor);
CREATE INDEX IF NOT EXISTS idx_diary_entries_urgency_level ON diary_entries(urgency_level);

-- コメント
COMMENT ON COLUMN diary_entries.counselor_memo IS 'カウンセラーのメモ';
COMMENT ON COLUMN diary_entries.assigned_counselor IS '担当カウンセラーの名前';
COMMENT ON COLUMN diary_entries.urgency_level IS '緊急度（high, medium, low）';