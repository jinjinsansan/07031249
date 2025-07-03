/*
  # Add counselor comment fields to diary entries

  1. Changes
    - Add `is_visible_to_user` boolean field to diary_entries table
    - Add `counselor_name` text field to diary_entries table
    - Create index on is_visible_to_user for performance

  This migration ensures that counselor memos can be optionally shown to users,
  and tracks which counselor wrote the comment.
*/

-- Add fields if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'is_visible_to_user'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN is_visible_to_user boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_name'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_name text;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_diary_entries_is_visible_to_user ON diary_entries(is_visible_to_user);