/*
  # 無価値感推移グラフの改善

  1. 変更内容
    - 無価値感推移グラフの起点を最初のスコア保存日に設定
    - 期間フィルタリングを日付ベースに変更
    - グラフ表示の最適化

  2. 新しい機能
    - 初期スコアを正確に表示
    - 日付ベースのフィルタリング
    - パフォーマンス改善
*/

-- diary_entriesテーブルにインデックスを追加して無価値感検索を高速化
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