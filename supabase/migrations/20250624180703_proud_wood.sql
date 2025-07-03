/*
  # カウンセラー名の表示形式変更

  1. 変更内容
    - カウンセラー名の表示形式を「仁カウンセラー」から「心理カウンセラー仁」に変更
    - 既存のカウンセラー名を新しい形式に更新
    - 日記エントリーのカウンセラー名も更新

  2. 対象テーブル
    - `counselors` - カウンセラー情報
    - `diary_entries` - 日記エントリー（カウンセラー名フィールド）
*/

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

-- コメント
COMMENT ON TABLE counselors IS 'カウンセラー情報を管理するテーブル';
COMMENT ON COLUMN counselors.name IS 'カウンセラーの表示名（例: 心理カウンセラー仁）';
COMMENT ON COLUMN diary_entries.counselor_name IS 'メモを書いたカウンセラーの名前（例: 心理カウンセラー仁）';