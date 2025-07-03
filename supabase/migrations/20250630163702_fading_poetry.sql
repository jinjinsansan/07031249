-- 1. ポジティブな感情スコアのサポートを追加
CREATE OR REPLACE FUNCTION get_all_emotion_scores(user_id_param uuid)
RETURNS TABLE (
  emotion text,
  avg_self_esteem numeric,
  avg_worthlessness numeric,
  entry_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.emotion,
    ROUND(AVG(d.self_esteem_score)::numeric, 2) as avg_self_esteem,
    ROUND(AVG(d.worthlessness_score)::numeric, 2) as avg_worthlessness,
    COUNT(*) as entry_count
  FROM diary_entries d
  WHERE 
    d.user_id = user_id_param AND
    d.emotion IN ('無価値感', '嬉しい', '感謝', '達成感', '幸せ') AND
    d.self_esteem_score IS NOT NULL AND
    d.worthlessness_score IS NOT NULL
  GROUP BY d.emotion
  ORDER BY entry_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. 同期エラーを修正するためのトリガー関数
CREATE OR REPLACE FUNCTION fix_null_values_before_insert() RETURNS TRIGGER AS $$
BEGIN
    -- NULL値を適切なデフォルト値に置き換える
    NEW.counselor_memo := COALESCE(NEW.counselor_memo, NULL);
    NEW.is_visible_to_user := COALESCE(NEW.is_visible_to_user, false);
    NEW.counselor_name := COALESCE(NEW.counselor_name, NULL);
    NEW.assigned_counselor := COALESCE(NEW.assigned_counselor, NULL);
    NEW.urgency_level := COALESCE(NEW.urgency_level, NULL);
    
    -- 感情が「無価値感」「嬉しい」「感謝」「達成感」「幸せ」の場合、スコアが設定されていることを確認
    IF NEW.emotion IN ('無価値感', '嬉しい', '感謝', '達成感', '幸せ') THEN
        NEW.self_esteem_score := COALESCE(NEW.self_esteem_score, 50);
        NEW.worthlessness_score := COALESCE(NEW.worthlessness_score, 50);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. トリガーを作成
DROP TRIGGER IF EXISTS fix_null_values_trigger ON diary_entries;
CREATE TRIGGER fix_null_values_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION fix_null_values_before_insert();

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
COMMENT ON FUNCTION get_all_emotion_scores IS '指定したユーザーのすべての感情スコアの統計情報を取得する関数';
COMMENT ON FUNCTION fix_null_values_before_insert IS 'NULL値を適切なデフォルト値に置き換えるトリガー関数';