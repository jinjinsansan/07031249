/*
  # 日記エントリーのNOT NULL制約を修正

  1. 変更内容
    - self_esteem_scoreとworthlessness_scoreのNOT NULL制約を削除
    - デフォルト値を50に設定
    - NULL値を適切に処理するトリガー関数を追加

  2. 目的
    - 「null value in column "self_esteem_score" of relation "diary_entries" violates not-null constraint」エラーの解決
    - データ同期の安定性向上
    - 今後同様のエラーが発生しないようにする
*/

-- 1. NOT NULL制約を削除
ALTER TABLE diary_entries ALTER COLUMN self_esteem_score DROP NOT NULL;
ALTER TABLE diary_entries ALTER COLUMN worthlessness_score DROP NOT NULL;

-- 2. デフォルト値を設定
ALTER TABLE diary_entries ALTER COLUMN self_esteem_score SET DEFAULT 50;
ALTER TABLE diary_entries ALTER COLUMN worthlessness_score SET DEFAULT 50;

-- 3. NULL値を適切に処理するトリガー関数
CREATE OR REPLACE FUNCTION fix_null_scores() RETURNS TRIGGER AS $$
BEGIN
    -- NULL値をデフォルト値に変換
    IF NEW.self_esteem_score IS NULL THEN
        NEW.self_esteem_score := 50;
    END IF;
    
    IF NEW.worthlessness_score IS NULL THEN
        NEW.worthlessness_score := 50;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. トリガーを作成
DROP TRIGGER IF EXISTS fix_null_scores_trigger ON diary_entries;
CREATE TRIGGER fix_null_scores_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION fix_null_scores();

-- 5. 既存のNULL値を修正
UPDATE diary_entries
SET 
  self_esteem_score = 50
WHERE self_esteem_score IS NULL;

UPDATE diary_entries
SET 
  worthlessness_score = 50
WHERE worthlessness_score IS NULL;

-- 6. コメント
COMMENT ON FUNCTION fix_null_scores() IS 'NULL値のスコアをデフォルト値に変換するトリガー関数';