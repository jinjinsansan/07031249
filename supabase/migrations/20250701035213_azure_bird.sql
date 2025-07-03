-- 1. カウンセラーコメント関連のフィールドを確実に存在させる
DO $$ 
BEGIN
  -- counselor_memoカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_memo'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_memo text DEFAULT '';
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
    ALTER TABLE diary_entries ADD COLUMN counselor_name text DEFAULT '';
  END IF;
  
  -- assigned_counselorカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'assigned_counselor'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN assigned_counselor text DEFAULT '';
  END IF;
  
  -- urgency_levelカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'urgency_level'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN urgency_level text DEFAULT '';
  END IF;
END $$;

-- 2. NULL値を空文字列に変換するトリガー関数
CREATE OR REPLACE FUNCTION fix_null_values_before_save() RETURNS TRIGGER AS $$
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

-- 3. トリガーを作成
DROP TRIGGER IF EXISTS fix_null_values_trigger ON diary_entries;
CREATE TRIGGER fix_null_values_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION fix_null_values_before_save();

-- 4. 既存のNULL値を修正
UPDATE diary_entries
SET 
  counselor_memo = COALESCE(counselor_memo, ''),
  counselor_name = COALESCE(counselor_name, ''),
  assigned_counselor = COALESCE(assigned_counselor, ''),
  urgency_level = COALESCE(urgency_level, ''),
  is_visible_to_user = COALESCE(is_visible_to_user, false);

-- 5. RLSポリシーの設定
DO $$ 
BEGIN
  -- 既存のポリシーを確認して削除
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "diary_entries_all_access_fixed" ON diary_entries';
  EXCEPTION
    WHEN OTHERS THEN
      -- エラーを無視して続行
      NULL;
  END;
END $$;

-- 新しいポリシーを作成
CREATE POLICY "admin_panel_search_fix" ON diary_entries
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. コメント
COMMENT ON FUNCTION fix_null_values_before_save() IS 'NULL値を適切なデフォルト値に変換するトリガー関数';
COMMENT ON POLICY "admin_panel_search_fix" ON diary_entries IS '認証済みユーザーが全ての日記エントリーにアクセスできるようにするポリシー';