/*
  # ポジティブな感情スコア対応

  1. 変更内容
    - ポジティブな感情（嬉しい、感謝、達成感、幸せ）のスコア対応
    - 感情スコア検索用のインデックス追加
    - 感情別スコア統計情報取得関数の追加

  2. 目的
    - ポジティブな感情を選んだ場合もスコアを記録できるようにする
    - 感情スコア推移グラフにポジティブな感情も表示する
    - 感情別の統計情報を提供する
*/

-- 1. ポジティブな感情スコアのインデックスを最適化
CREATE INDEX IF NOT EXISTS idx_diary_entries_emotion_scores ON diary_entries(emotion, self_esteem_score, worthlessness_score);

-- 2. ポジティブな感情スコアの統計情報を取得するための関数
CREATE OR REPLACE FUNCTION get_emotion_score_stats(user_id_param uuid)
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

-- 3. 感情スコア推移グラフの表示期間を設定するための関数
CREATE OR REPLACE FUNCTION get_emotion_score_period(user_id_param uuid, period_type text)
RETURNS TABLE (
  start_date date,
  end_date date
) AS $$
DECLARE
  first_date date;
  today date := CURRENT_DATE;
BEGIN
  -- 最初の記録日を取得
  SELECT MIN(date) INTO first_date
  FROM diary_entries
  WHERE 
    user_id = user_id_param AND
    emotion IN ('無価値感', '嬉しい', '感謝', '達成感', '幸せ');
    
  -- 期間に応じて開始日と終了日を設定
  CASE period_type
    WHEN 'week' THEN
      RETURN QUERY SELECT today - INTERVAL '7 days', today;
    WHEN 'month' THEN
      RETURN QUERY SELECT today - INTERVAL '30 days', today;
    ELSE
      RETURN QUERY SELECT first_date, today;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 4. コメント
COMMENT ON FUNCTION get_emotion_score_stats IS '指定したユーザーの感情別スコアの統計情報を取得する関数';
COMMENT ON FUNCTION get_emotion_score_period IS '感情スコア推移グラフの表示期間を取得する関数';
COMMENT ON INDEX idx_diary_entries_emotion_scores IS '感情とスコアによる検索を高速化するためのインデックス';