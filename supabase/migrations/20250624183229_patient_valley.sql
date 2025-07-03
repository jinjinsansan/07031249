/*
  # 無価値感推移グラフの改善

  1. 新しい機能
    - 無価値感データの検索を高速化するためのインデックス
    - 無価値感スコアの統計情報を取得するための関数
    - 最初の記録日を取得する機能

  2. 目的
    - 無価値感推移グラフの表示を最適化
    - 初回スコアを正確に表示
    - パフォーマンスの向上
*/

-- 無価値感データの検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_diary_entries_emotion_date ON diary_entries(emotion, date);

-- 無価値感スコアの統計情報を取得するための関数
CREATE OR REPLACE FUNCTION get_worthlessness_stats(user_id_param uuid)
RETURNS TABLE (
  avg_self_esteem numeric,
  avg_worthlessness numeric,
  min_self_esteem integer,
  max_self_esteem integer,
  min_worthlessness integer,
  max_worthlessness integer,
  first_record_date date
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(self_esteem_score)::numeric, 2) as avg_self_esteem,
    ROUND(AVG(worthlessness_score)::numeric, 2) as avg_worthlessness,
    MIN(self_esteem_score) as min_self_esteem,
    MAX(self_esteem_score) as max_self_esteem,
    MIN(worthlessness_score) as min_worthlessness,
    MAX(worthlessness_score) as max_worthlessness,
    MIN(date) as first_record_date
  FROM diary_entries
  WHERE 
    user_id = user_id_param AND
    emotion = '無価値感';
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON FUNCTION get_worthlessness_stats IS '指定したユーザーの無価値感スコアの統計情報を取得する関数';
COMMENT ON INDEX idx_diary_entries_emotion_date IS '感情と日付による検索を高速化するためのインデックス';

-- 無価値感推移グラフの表示期間を設定するための関数
CREATE OR REPLACE FUNCTION get_worthlessness_period(user_id_param uuid, period_type text)
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
    emotion = '無価値感';
    
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

COMMENT ON FUNCTION get_worthlessness_period IS '無価値感推移グラフの表示期間を取得する関数';