/*
  # カウンセラーコメント同期問題の修正

  1. 変更内容
    - カウンセラーコメント関連のフィールドを確実に存在させる
    - NULL値を許容するように制約を修正
    - カウンセラーコメントの同期エラーを修正するためのトリガー関数を追加

  2. 目的
    - カウンセラーコメントがSupabaseに正しく保存されるようにする
    - 同期エラーの発生を防止
    - データの整合性を確保
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
    NEW.counselor_memo := COALESCE(NEW.counselor_memo, '');
    NEW.counselor_name := COALESCE(NEW.counselor_name, '');
    NEW.assigned_counselor := COALESCE(NEW.assigned_counselor, '');
    NEW.urgency_level := COALESCE(NEW.urgency_level, '');
    
    -- is_visible_to_userがNULLの場合はfalseに設定
    NEW.is_visible_to_user := COALESCE(NEW.is_visible_to_user, false);
    
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
  -- diary_entries_all_accessポリシーが存在するか確認
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'diary_entries' AND policyname = 'diary_entries_all_access_v8'
  ) THEN
    -- ポリシーが存在しない場合のみ作成
    EXECUTE 'CREATE POLICY "diary_entries_all_access_v8" ON diary_entries
      FOR ALL 
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- 6. コメント
COMMENT ON FUNCTION fix_counselor_memo_before_save() IS 'カウンセラーメモのNULLを空文字列に変換するトリガー関数';