/*
  # Add counselor comment fields to diary entries

  1. New Fields
    - `is_visible_to_user` (boolean) - Flag to determine if the memo should be visible to the user
    - `counselor_name` (text) - Name of the counselor who wrote the memo

  2. Indexes
    - Create index on is_visible_to_user for performance
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