/*
  # カウンセラーコメント機能の拡張

  1. 新しいフィールド
    - `diary_entries` テーブルに追加:
      - `is_visible_to_user` (boolean) - ユーザーにコメントを表示するかどうか
      - `counselor_name` (text) - コメントを書いたカウンセラーの名前

  2. インデックス
    - `is_visible_to_user` フィールドにインデックスを追加
*/

-- diary_entriesテーブルにカウンセラーコメント関連のフィールドを追加
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

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_is_visible_to_user ON diary_entries(is_visible_to_user);