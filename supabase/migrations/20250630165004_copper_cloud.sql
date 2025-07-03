-- 1. 同期エラーを修正するためのマイグレーション

-- 2. 日記エントリーのバリデーションと修正を行うトリガー関数
CREATE OR REPLACE FUNCTION validate_and_fix_diary_entry() RETURNS TRIGGER AS $$
BEGIN
    -- 感情が「無価値感」「嬉しい」「感謝」「達成感」「幸せ」の場合、スコアが設定されていることを確認
    IF NEW.emotion IN ('無価値感', '嬉しい', '感謝', '達成感', '幸せ') THEN
        NEW.self_esteem_score := COALESCE(NEW.self_esteem_score, 50);
        NEW.worthlessness_score := COALESCE(NEW.worthlessness_score, 50);
    END IF;
    
    -- カウンセラー関連フィールドの処理
    -- NULL値をそのまま保持するが、is_visible_to_userはデフォルトでfalseに設定
    NEW.is_visible_to_user := COALESCE(NEW.is_visible_to_user, false);
    
    -- 日記エントリーの処理中にエラーが発生した場合のログ
    RAISE LOG 'Processing diary entry: id=%, emotion=%, user_id=%', 
              NEW.id, 
              NEW.emotion, 
              NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. トリガーを作成
DROP TRIGGER IF EXISTS validate_and_fix_diary_entry_trigger ON diary_entries;
CREATE TRIGGER validate_and_fix_diary_entry_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION validate_and_fix_diary_entry();

-- 4. RLSポリシーの設定
DO $$ 
BEGIN
  -- diary_entries_all_accessポリシーが存在するか確認
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'diary_entries' AND policyname = 'diary_entries_all_access'
  ) THEN
    -- ポリシーが存在しない場合のみ作成
    EXECUTE 'CREATE POLICY "diary_entries_all_access" ON diary_entries
      FOR ALL 
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- 5. コメント
COMMENT ON FUNCTION validate_and_fix_diary_entry() IS '日記エントリーのバリデーションを行い、NULL値を適切に処理するトリガー関数';