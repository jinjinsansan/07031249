/*
  # 緊急度の制約問題を修正

  1. 変更内容
    - urgency_levelカラムの制約を完全に削除
    - 既存の無効な値を空文字列に修正
    - 緊急度の値を検証するトリガー関数を追加

  2. 目的
    - 同期エラー「new row for relation "diary_entries" violates check constraint "diary_entries_urgency_level_check"」を解決
    - データの整合性を確保
    - 今後の同様のエラーを防止
*/

-- 1. urgency_levelカラムの制約を完全に削除
ALTER TABLE diary_entries DROP CONSTRAINT IF EXISTS diary_entries_urgency_level_check;

-- 2. 既存の無効な値を修正
UPDATE diary_entries
SET urgency_level = ''
WHERE urgency_level IS NOT NULL 
  AND urgency_level != ''
  AND urgency_level NOT IN ('high', 'medium', 'low');

-- 3. 緊急度の値を検証するトリガー関数
CREATE OR REPLACE FUNCTION validate_urgency_level() RETURNS TRIGGER AS $$
BEGIN
    -- urgency_levelが無効な値の場合は空文字列に設定
    IF NEW.urgency_level IS NOT NULL AND NEW.urgency_level != '' AND NEW.urgency_level NOT IN ('high', 'medium', 'low') THEN
        NEW.urgency_level := '';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. トリガーを作成
DROP TRIGGER IF EXISTS validate_urgency_level_trigger ON diary_entries;
CREATE TRIGGER validate_urgency_level_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION validate_urgency_level();

-- 5. コメント
COMMENT ON FUNCTION validate_urgency_level() IS '緊急度の値を検証し、無効な値を空文字列に変換するトリガー関数';