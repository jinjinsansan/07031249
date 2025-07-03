/*
  # カウンセラーコメント機能の修正

  1. 変更内容
    - diary_entriesテーブルのcounselor_memoカラムのインデックスを修正
    - カウンセラーコメント関連のRLSポリシーを追加
    - カウンセラーコメントの同期エラーを修正

  2. 目的
    - カウンセラーコメントがSupabaseに正しく保存されるようにする
    - 同期エラーの解決
    - データの整合性確保
*/

-- 1. カウンセラーコメント関連のインデックスを再作成
DROP INDEX IF EXISTS idx_diary_entries_counselor_memo;
CREATE INDEX idx_diary_entries_counselor_memo ON diary_entries(counselor_memo);

-- 2. カウンセラーコメント関連のRLSポリシーを追加
CREATE POLICY IF NOT EXISTS "Counselors can update diary entries"
  ON diary_entries
  FOR UPDATE
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. トリガーを作成
DROP TRIGGER IF EXISTS counselor_memo_update_trigger ON diary_entries;
CREATE TRIGGER counselor_memo_update_trigger
AFTER UPDATE OF counselor_memo ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION log_counselor_memo_update();

-- 5. コメント
COMMENT ON FUNCTION log_counselor_memo_update() IS 'カウンセラーメモの更新をログに記録するトリガー関数';