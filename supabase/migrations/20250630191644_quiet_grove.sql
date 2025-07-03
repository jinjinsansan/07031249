/*
  # 重複データ問題の修正

  1. 変更内容
    - 重複データを検出して削除するための関数を追加
    - 同期時に重複チェックを行うためのトリガー関数を追加
    - 既存の重複データを削除

  2. 目的
    - データの重複増殖問題を解決
    - 同期エラーの防止
    - データベースの整合性確保
*/

-- 1. 重複データを検出して削除するための関数
CREATE OR REPLACE FUNCTION remove_duplicate_diary_entries() RETURNS integer AS $$
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
  
  -- 削除した件数を返す
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 2. 同期時に重複チェックを行うためのトリガー関数
CREATE OR REPLACE FUNCTION prevent_diary_duplication() RETURNS TRIGGER AS $$
DECLARE
  existing_entry_id UUID;
BEGIN
  -- 同じuser_id, date, emotion, event(先頭50文字), realization(先頭50文字)を持つエントリーが既に存在するか確認
  SELECT id INTO existing_entry_id
  FROM diary_entries
  WHERE 
    user_id = NEW.user_id AND
    date = NEW.date AND
    emotion = NEW.emotion AND
    LEFT(event, 50) = LEFT(NEW.event, 50) AND
    LEFT(realization, 50) = LEFT(NEW.realization, 50) AND
    id != NEW.id
  LIMIT 1;
  
  -- 既存のエントリーが見つかった場合
  IF existing_entry_id IS NOT NULL THEN
    -- 既存のエントリーを更新（最新の値で上書き）
    UPDATE diary_entries
    SET 
      self_esteem_score = NEW.self_esteem_score,
      worthlessness_score = NEW.worthlessness_score,
      counselor_memo = COALESCE(NEW.counselor_memo, diary_entries.counselor_memo),
      is_visible_to_user = COALESCE(NEW.is_visible_to_user, diary_entries.is_visible_to_user),
      counselor_name = COALESCE(NEW.counselor_name, diary_entries.counselor_name),
      assigned_counselor = COALESCE(NEW.assigned_counselor, diary_entries.assigned_counselor),
      urgency_level = COALESCE(NEW.urgency_level, diary_entries.urgency_level),
      created_at = GREATEST(NEW.created_at, diary_entries.created_at)
    WHERE id = existing_entry_id;
    
    -- 新しいエントリーの挿入をキャンセル
    RETURN NULL;
  END IF;
  
  -- 重複がない場合は新しいエントリーを挿入
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. トリガーを作成
DROP TRIGGER IF EXISTS prevent_diary_duplication_trigger ON diary_entries;
CREATE TRIGGER prevent_diary_duplication_trigger
BEFORE INSERT ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_diary_duplication();

-- 4. 既存の重複データを削除
SELECT remove_duplicate_diary_entries();

-- 5. コメント
COMMENT ON FUNCTION remove_duplicate_diary_entries() IS '重複した日記エントリーを検出して削除する関数';
COMMENT ON FUNCTION prevent_diary_duplication() IS '日記エントリーの重複を防止するトリガー関数';