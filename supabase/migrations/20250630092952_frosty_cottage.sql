/*
  # 日記エントリーテーブルに担当カウンセラーと緊急度フィールドを追加

  1. 変更内容
    - `diary_entries`テーブルに以下のフィールドを追加
      - `assigned_counselor` (text) - 担当カウンセラーの名前
      - `urgency_level` (text) - 緊急度（high, medium, low）

  2. 目的
    - カウンセラーの割り当てを管理するため
    - 緊急度に基づいて日記をフィルタリングするため
*/

-- diary_entriesテーブルに担当カウンセラーと緊急度フィールドを追加
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'assigned_counselor'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN assigned_counselor text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'urgency_level'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN urgency_level text CHECK (urgency_level IN ('high', 'medium', 'low') OR urgency_level IS NULL);
  END IF;
END $$;

-- コメント
COMMENT ON COLUMN diary_entries.assigned_counselor IS '担当カウンセラーの名前';
COMMENT ON COLUMN diary_entries.urgency_level IS '緊急度（high, medium, low）';

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_assigned_counselor ON diary_entries(assigned_counselor);
CREATE INDEX IF NOT EXISTS idx_diary_entries_urgency_level ON diary_entries(urgency_level);