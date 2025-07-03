/*
  # 無価値感推移グラフの改善

  1. 変更内容
    - 無価値感データの検索を高速化するためのインデックスを追加
    - 無価値感スコアの統計情報を取得するための関数を追加
    - 初期スコアの保存日を起点とするためのサポート

  2. 新しい機能
    - `get_worthlessness_stats` 関数: ユーザーごとの無価値感統計を取得
    - 最初の記録日を取得する機能
    - 平均・最小・最大値の計算

  3. パフォーマンス改善
    - 感情と日付の複合インデックスによる検索高速化
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