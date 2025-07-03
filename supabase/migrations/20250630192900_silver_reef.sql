/*
  # 同期状態表示機能の追加

  1. 変更内容
    - 日記エントリーの同期状態を確認するための関数を追加
    - 複数の日記エントリーの同期状態を一括確認するための関数を追加

  2. 目的
    - 管理画面で日記エントリーの同期状態（SupabaseかLocalか）を表示できるようにする
    - 同期エラーの検出と診断を容易にする
*/

-- 1. 日記エントリーの同期状態を確認するための関数
CREATE OR REPLACE FUNCTION check_diary_sync_status(diary_id_param uuid) RETURNS boolean AS $$
DECLARE
  exists_in_db boolean;
BEGIN
  -- 指定されたIDの日記エントリーがデータベースに存在するか確認
  SELECT EXISTS(
    SELECT 1 FROM diary_entries WHERE id = diary_id_param
  ) INTO exists_in_db;
  
  RETURN exists_in_db;
END;
$$ LANGUAGE plpgsql;

-- 2. 複数の日記エントリーの同期状態を一括確認するための関数
CREATE OR REPLACE FUNCTION check_multiple_diary_sync_status(diary_ids uuid[]) RETURNS TABLE (
  diary_id uuid,
  is_synced boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as diary_id,
    true as is_synced
  FROM 
    unnest(diary_ids) as d(id)
  WHERE 
    EXISTS (SELECT 1 FROM diary_entries WHERE id = d.id);
END;
$$ LANGUAGE plpgsql;

-- 3. コメント
COMMENT ON FUNCTION check_diary_sync_status(uuid) IS '指定された日記エントリーがSupabaseに同期されているかどうかを確認する関数';
COMMENT ON FUNCTION check_multiple_diary_sync_status(uuid[]) IS '複数の日記エントリーの同期状態を一括確認するための関数';