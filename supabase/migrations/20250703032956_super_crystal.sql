/*
  # 重複エントリー問題の修正

  1. 変更内容
    - 重複エントリーを検出して削除する関数を追加
    - 既存の重複エントリーを削除
    - 重複チェック用のインデックスを追加

  2. 目的
    - 「duplicate key value violates unique constraint "diary_entries_pkey"」エラーの解決
    - 同期エラーの防止
    - データの整合性確保
*/

-- 1. 重複エントリーを検出して削除する関数
CREATE OR REPLACE FUNCTION remove_duplicate_entries() RETURNS void AS $$
DECLARE
  duplicate_count INTEGER := 0;
  deleted_count INTEGER := 0;
BEGIN
  -- 重複を検出するための一時テーブルを作成
  CREATE TEMP TABLE duplicate_entries AS
  WITH duplicates AS (
    SELECT 
      id,
      user_id,
      date,
      emotion,
      LEFT(event, 50) as event_prefix,
      LEFT(realization, 50) as realization_prefix,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, date, emotion, LEFT(event, 50), LEFT(realization, 50)
        ORDER BY created_at DESC
      ) as row_num
    FROM diary_entries
  )
  SELECT id FROM duplicates WHERE row_num > 1;

  -- 重複数をカウント
  SELECT COUNT(*) INTO duplicate_count FROM duplicate_entries;
  
  -- 重複を削除
  DELETE FROM diary_entries
  WHERE id IN (SELECT id FROM duplicate_entries);
  
  -- 削除数をカウント
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- 結果をログに出力
  RAISE NOTICE '重複データの削除: % 件の重複を検出し、% 件を削除しました', duplicate_count, deleted_count;
  
  -- 一時テーブルを削除
  DROP TABLE duplicate_entries;
END;
$$ LANGUAGE plpgsql;

-- 2. 既存の重複エントリーを削除
SELECT remove_duplicate_entries();

-- 3. 重複エントリーを防止するためのインデックスを追加
CREATE UNIQUE INDEX IF NOT EXISTS idx_diary_entries_unique_content 
ON diary_entries (user_id, date, emotion, LEFT(event, 50), LEFT(realization, 50))
WHERE user_id IS NOT NULL;

-- 4. コメント
COMMENT ON FUNCTION remove_duplicate_entries() IS '重複した日記エントリーを検出して削除する関数';