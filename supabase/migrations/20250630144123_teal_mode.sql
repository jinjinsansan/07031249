/*
  # カウンセラーコメント同期問題の修正

  1. 変更内容
    - カウンセラーコメント関連のインデックスを最適化
    - RLSポリシーを追加して認証済みユーザーがすべての操作を行えるようにする
    - カウンセラーコメントの更新をログに記録するトリガー関数を追加
    - NULL値を許容するように制約を修正

  2. 目的
    - カウンセラーコメントの同期エラーを解決
    - データベースのパフォーマンスを向上
    - 更新操作の監視とデバッグを容易にする
*/

-- 1. カウンセラーコメント関連のインデックスを最適化
DROP INDEX IF EXISTS idx_diary_entries_counselor_memo;
CREATE INDEX idx_diary_entries_counselor_memo ON diary_entries(counselor_memo);

-- 2. カウンセラーコメント関連のRLSポリシーを追加
CREATE POLICY IF NOT EXISTS "Allow all operations on diary entries for authenticated users"
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
    
    -- カウンセラー名が更新された場合にログを記録
    IF NEW.counselor_name IS DISTINCT FROM OLD.counselor_name THEN
        RAISE NOTICE 'Counselor name updated for diary entry %: % -> %', 
                     NEW.id, 
                     COALESCE(OLD.counselor_name, 'NULL'), 
                     COALESCE(NEW.counselor_name, 'NULL');
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

-- 5. NULL値を許容するように制約を修正
DO $$ 
BEGIN
  -- counselor_memoカラムがNOT NULLの場合、制約を削除
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' 
    AND column_name = 'counselor_memo' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE diary_entries ALTER COLUMN counselor_memo DROP NOT NULL;
  END IF;
  
  -- is_visible_to_userのデフォルト値を設定
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' 
    AND column_name = 'is_visible_to_user'
  ) THEN
    ALTER TABLE diary_entries ALTER COLUMN is_visible_to_user SET DEFAULT false;
  END IF;
  
  -- counselor_nameカラムがNOT NULLの場合、制約を削除
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' 
    AND column_name = 'counselor_name' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE diary_entries ALTER COLUMN counselor_name DROP NOT NULL;
  END IF;
END $$;

-- 6. コメント
COMMENT ON FUNCTION log_counselor_memo_update() IS 'カウンセラーメモの更新をログに記録するトリガー関数';

-- 7. カウンセラーコメント関連のフィールドを確実に存在させる
DO $$ 
BEGIN
  -- counselor_memoカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_memo'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_memo text;
  END IF;
  
  -- is_visible_to_userカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'is_visible_to_user'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN is_visible_to_user boolean DEFAULT false;
  END IF;
  
  -- counselor_nameカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_name'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_name text;
  END IF;
END $$;