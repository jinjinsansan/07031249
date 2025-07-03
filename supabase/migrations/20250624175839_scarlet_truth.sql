/*
  # カウンセラーコメント機能の拡張

  1. 変更内容
    - `diary_entries`テーブルに以下のフィールドを追加
      - `is_visible_to_user` (boolean): カウンセラーメモをユーザーに表示するかどうか
      - `counselor_name` (text): メモを書いたカウンセラーの名前
    
  2. インデックス
    - `is_visible_to_user`フィールドにインデックスを作成
    
  3. コメント
    - 各フィールドに説明コメントを追加
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

-- コメント
COMMENT ON COLUMN diary_entries.is_visible_to_user IS 'カウンセラーメモをユーザーに表示するかどうか';
COMMENT ON COLUMN diary_entries.counselor_name IS 'メモを書いたカウンセラーの名前';

-- RLSポリシーの更新
CREATE POLICY IF NOT EXISTS "Users can read counselor comments"
  ON diary_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE line_username = auth.uid()::text)
    OR (is_visible_to_user = true AND EXISTS (
      SELECT 1 FROM counselors 
      WHERE email = auth.email() AND is_active = true
    ))
  );