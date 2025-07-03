/*
  # カウンセラーコメント機能の修正

  1. 変更内容
    - カウンセラーコメント関連のフィールドを確実に存在させる
    - NULL値を許容するように制約を修正
    - NULL値を空文字列に変換するトリガー関数を追加
    - 重複するRLSポリシーを整理

  2. 目的
    - カウンセラーコメントの同期エラーを解決
    - データベースの整合性確保
    - アプリケーションの安定性向上
*/

-- 1. カウンセラーコメント関連のフィールドを確実に存在させる
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
  
  -- assigned_counselorカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'assigned_counselor'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN assigned_counselor text;
  END IF;
  
  -- urgency_levelカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'urgency_level'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN urgency_level text;
  END IF;
END $$;

-- 2. NULL値を許容するように制約を修正
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
  
  -- assigned_counselorカラムがNOT NULLの場合、制約を削除
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' 
    AND column_name = 'assigned_counselor' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE diary_entries ALTER COLUMN assigned_counselor DROP NOT NULL;
  END IF;
  
  -- urgency_levelカラムがNOT NULLの場合、制約を削除
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' 
    AND column_name = 'urgency_level' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE diary_entries ALTER COLUMN urgency_level DROP NOT NULL;
  END IF;
END $$;

-- 3. カウンセラーコメントの同期エラーを修正するためのトリガー関数
CREATE OR REPLACE FUNCTION fix_counselor_memo_before_save() RETURNS TRIGGER AS $$
BEGIN
    -- NULL値を空文字列に変換
    IF NEW.counselor_memo IS NULL THEN
        NEW.counselor_memo := '';
    END IF;
    
    IF NEW.counselor_name IS NULL THEN
        NEW.counselor_name := '';
    END IF;
    
    IF NEW.assigned_counselor IS NULL THEN
        NEW.assigned_counselor := '';
    END IF;
    
    IF NEW.urgency_level IS NULL THEN
        NEW.urgency_level := '';
    END IF;
    
    -- is_visible_to_userがNULLの場合はfalseに設定
    IF NEW.is_visible_to_user IS NULL THEN
        NEW.is_visible_to_user := false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. トリガーを作成
DROP TRIGGER IF EXISTS fix_counselor_memo_trigger ON diary_entries;
CREATE TRIGGER fix_counselor_memo_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION fix_counselor_memo_before_save();

-- 5. RLSポリシーの設定
DO $$ 
BEGIN
  -- 既存のポリシーを確認して削除
  DROP POLICY IF EXISTS "diary_entries_all_access" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v2" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v3" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v4" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v5" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v6" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v7" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v8" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v9" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_all_access_v10" ON diary_entries;
  DROP POLICY IF EXISTS "diary_entries_policy_v5" ON diary_entries;
  DROP POLICY IF EXISTS "Users can read counselor comments" ON diary_entries;
  DROP POLICY IF EXISTS "Users can manage own diary entries" ON diary_entries;
  DROP POLICY IF EXISTS "Allow all operations on diary entries for authenticated users" ON diary_entries;
EXCEPTION
  WHEN OTHERS THEN
    -- エラーを無視して続行
    NULL;
END $$;

-- 新しいポリシーを作成
CREATE POLICY "diary_entries_all_access_v11" ON diary_entries
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. コメント
COMMENT ON FUNCTION fix_counselor_memo_before_save() IS 'カウンセラーメモのNULLを空文字列に変換するトリガー関数';