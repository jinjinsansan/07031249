/*
  # ポジティブな感情スコア対応

  1. 変更内容
    - ポジティブな感情（嬉しい、感謝、達成感、幸せ）を選択した場合もスコアを記録できるように対応
    - 無価値感推移グラフでポジティブな感情のスコアも表示できるように対応

  2. 目的
    - ポジティブな感情選択時もスコアを記録できるようにする
    - 感情の種類に関わらず、自己肯定感と無価値感の推移を追跡できるようにする
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

-- 3. コメント
COMMENT ON FUNCTION get_emotion_score_stats IS '指定したユーザーの感情別スコアの統計情報を取得する関数';
COMMENT ON INDEX idx_diary_entries_emotion_scores IS '感情とスコアによる検索を高速化するためのインデックス';