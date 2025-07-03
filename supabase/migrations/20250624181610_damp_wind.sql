/*
  # カウンセラーコメント機能の拡張

  1. 変更内容
    - diary_entriesテーブルにカウンセラーコメント関連のフィールドを追加
      - `is_visible_to_user` (boolean) - カウンセラーメモをユーザーに表示するかどうか
      - `counselor_name` (text) - メモを書いたカウンセラーの名前
    - カウンセラー名の表示形式を「心理カウンセラー〇〇」に統一

  2. セキュリティ
    - RLSポリシーの更新
    - ユーザーは自分の日記と、表示設定がtrueのカウンセラーコメントを閲覧可能
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

-- カウンセラー名の表示形式を変更するための関数
CREATE OR REPLACE FUNCTION convert_counselor_name(old_name text) RETURNS text AS $$
DECLARE
  new_name text;
BEGIN
  -- 「〇〇カウンセラー」から「心理カウンセラー〇〇」への変換
  CASE
    WHEN old_name = '仁カウンセラー' THEN new_name := '心理カウンセラー仁';
    WHEN old_name = 'AOIカウンセラー' THEN new_name := '心理カウンセラーAOI';
    WHEN old_name = 'あさみカウンセラー' THEN new_name := '心理カウンセラーあさみ';
    WHEN old_name = 'SHUカウンセラー' THEN new_name := '心理カウンセラーSHU';
    WHEN old_name = 'ゆーちゃカウンセラー' THEN new_name := '心理カウンセラーゆーちゃ';
    WHEN old_name = 'sammyカウンセラー' THEN new_name := '心理カウンセラーSammy';
    ELSE new_name := old_name;
  END CASE;
  
  RETURN new_name;
END;
$$ LANGUAGE plpgsql;

-- カウンセラーテーブルの名前を更新
UPDATE counselors
SET name = convert_counselor_name(name)
WHERE name IN (
  '仁カウンセラー',
  'AOIカウンセラー',
  'あさみカウンセラー',
  'SHUカウンセラー',
  'ゆーちゃカウンセラー',
  'sammyカウンセラー'
);

-- 日記エントリーのカウンセラー名を更新
UPDATE diary_entries
SET 
  counselor_name = convert_counselor_name(counselor_name),
  assigned_counselor = convert_counselor_name(assigned_counselor)
WHERE counselor_name IN (
  '仁カウンセラー',
  'AOIカウンセラー',
  'あさみカウンセラー',
  'SHUカウンセラー',
  'ゆーちゃカウンセラー',
  'sammyカウンセラー'
) OR assigned_counselor IN (
  '仁カウンセラー',
  'AOIカウンセラー',
  'あさみカウンセラー',
  'SHUカウンセラー',
  'ゆーちゃカウンセラー',
  'sammyカウンセラー'
);

-- 関数を削除（一時的に使用するだけなので）
DROP FUNCTION IF EXISTS convert_counselor_name(text);

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