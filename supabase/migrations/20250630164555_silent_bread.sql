-- 1. Fix synchronization errors with diary entries

-- 2. Create a function to validate diary entries before insert/update
CREATE OR REPLACE FUNCTION validate_diary_entry() RETURNS TRIGGER AS $$
BEGIN
    -- Ensure self_esteem_score and worthlessness_score are not null for specific emotions
    IF NEW.emotion IN ('無価値感', '嬉しい', '感謝', '達成感', '幸せ') THEN
        NEW.self_esteem_score := COALESCE(NEW.self_esteem_score, 50);
        NEW.worthlessness_score := COALESCE(NEW.worthlessness_score, 50);
    END IF;
    
    -- Ensure counselor fields are properly handled
    NEW.counselor_memo := NEW.counselor_memo; -- Keep as is, even if NULL
    NEW.is_visible_to_user := COALESCE(NEW.is_visible_to_user, false);
    NEW.counselor_name := NEW.counselor_name; -- Keep as is, even if NULL
    NEW.assigned_counselor := NEW.assigned_counselor; -- Keep as is, even if NULL
    NEW.urgency_level := NEW.urgency_level; -- Keep as is, even if NULL
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to validate diary entries
DROP TRIGGER IF EXISTS validate_diary_entry_trigger ON diary_entries;
CREATE TRIGGER validate_diary_entry_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION validate_diary_entry();

-- 4. Ensure all RLS policies are properly set
DO $$ 
BEGIN
  -- Ensure diary_entries_all_access policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'diary_entries' AND policyname = 'diary_entries_all_access'
  ) THEN
    EXECUTE 'CREATE POLICY "diary_entries_all_access" ON diary_entries
      FOR ALL 
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- 5. Add comments
COMMENT ON FUNCTION validate_diary_entry() IS '日記エントリーのバリデーションを行い、NULL値を適切に処理するトリガー関数';