/*
  # Add counselor_memo column to diary_entries table

  1. Changes
    - Add `counselor_memo` column to diary_entries table
    - Create index on counselor_memo for text search performance

  2. Purpose
    - Allow counselors to add private notes to diary entries
    - Support the counselor comment feature
*/

-- Add counselor_memo column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_memo'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_memo text;
  END IF;
END $$;

-- Create index for text search on counselor_memo
CREATE INDEX IF NOT EXISTS idx_diary_entries_counselor_memo ON diary_entries USING gin(to_tsvector('japanese', coalesce(counselor_memo, '')));

-- Add comment
COMMENT ON COLUMN diary_entries.counselor_memo IS 'カウンセラーのメモ（ユーザーに表示するかどうかはis_visible_to_userフィールドで制御）';