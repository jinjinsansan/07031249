/*
  # 感情の種類ごとに日記の背景色を設定

  1. 変更内容
    - 感情の種類に応じた背景色を設定するための関数を追加
    - 感情の種類ごとに適切な色を定義

  2. 目的
    - 日記の視覚的な区別を容易にする
    - カウンセラー管理画面での日記表示を改善
    - ユーザー体験の向上
*/

-- 1. 感情の種類に応じた背景色を取得する関数
CREATE OR REPLACE FUNCTION get_emotion_color(emotion text) RETURNS text AS $$
BEGIN
  RETURN CASE emotion
    -- ネガティブな感情
    WHEN '恐怖' THEN 'purple'
    WHEN '悲しみ' THEN 'blue'
    WHEN '怒り' THEN 'red'
    WHEN '悔しい' THEN 'green'
    WHEN '無価値感' THEN 'gray'
    WHEN '罪悪感' THEN 'orange'
    WHEN '寂しさ' THEN 'indigo'
    WHEN '恥ずかしさ' THEN 'pink'
    -- ポジティブな感情
    WHEN '嬉しい' THEN 'yellow'
    WHEN '感謝' THEN 'teal'
    WHEN '達成感' THEN 'lime'
    WHEN '幸せ' THEN 'amber'
    ELSE 'gray'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. コメント
COMMENT ON FUNCTION get_emotion_color(text) IS '感情の種類に応じた背景色を取得する関数';