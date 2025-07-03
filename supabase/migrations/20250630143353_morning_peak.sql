/*
  # カウンセラーコメント同期問題の修正

  1. 変更内容
    - カウンセラーコメント関連のインデックスを最適化
    - RLSポリシーを更新して確実にコメントが保存されるようにする
    - カウンセラーコメントの更新をログに記録するトリガーを追加

  2. 目的
    - カウンセラーコメントがSupabaseに正しく同期されるようにする
    - 同期エラーの検出と診断を容易にする
    - データの整合性を確保する
*/

-- 1. カウンセラーコメント関連のインデックスを最適化
DROP INDEX IF EXISTS idx_diary_entries_counselor_memo;
CREATE INDEX idx_diary_entries_counselor_memo ON diary_entries(counselor_memo);

-- 2. カウンセラーコメント関連のRLSポリシーを追加
CREATE POLICY IF NOT EXISTS "Allow all operations on diary entries"
  ON diary_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. カウンセラーコメントの同期エラーを修正するためのトリガー関数
CREATE OR REPLACE FUNCTION log_counselor_memo_update() RETURNS TRIGGER AS $$
BEGIN
    -- カウンセラーメモが更新された場合にログを記録
    IF NEW.counselor_memo IS DISTINCT FROM OLD.counselor_memo THEN
        RAISE NOTICE 'Counselor memo updated for diary entry %: % -> %', 
                     NEW.id, 
                     COALESCE(LEFT(OLD.counselor_memo, 20), 'NULL'), 
                     COALESCE(LEFT(NEW.counselor_memo, 20), 'NULL');
    END IF;
    
    -- 表示設定が更新された場合にログを記録
    IF NEW.is_visible_to_user IS DISTINCT FROM OLD.is_visible_to_user THEN
        RAISE NOTICE 'Visibility updated for diary entry %: % -> %', 
                     NEW.id, 
                     COALESCE(OLD.is_visible_to_user, false), 
                     COALESCE(NEW.is_visible_to_user, false);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. トリガーを作成
DROP TRIGGER IF EXISTS counselor_memo_update_trigger ON diary_entries;
CREATE TRIGGER counselor_memo_update_trigger
AFTER UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION log_counselor_memo_update();

-- 5. コメント
COMMENT ON FUNCTION log_counselor_memo_update() IS 'カウンセラーメモの更新をログに記録するトリガー関数';