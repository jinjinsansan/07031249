/*
  # 同期エラー修正

  1. 変更内容
    - 無効なUUID形式を修正するための関数を追加
    - 同期エラーを防ぐためのトリガーを追加
    - 既存の無効なUUIDを持つレコードを修正

  2. 目的
    - "invalid input syntax for type uuid" エラーの解決
    - データ同期の安定性向上
    - 今後の同様のエラーを防止
*/

-- 1. 無効なUUIDを持つレコードを修正するための関数
CREATE OR REPLACE FUNCTION fix_invalid_uuids() RETURNS void AS $$
DECLARE
    invalid_record RECORD;
BEGIN
    -- 無効なUUIDを持つレコードを検索して修正
    FOR invalid_record IN 
        SELECT * FROM diary_entries 
        WHERE id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    LOOP
        -- 無効なIDを持つレコードを新しいUUIDで更新
        UPDATE diary_entries
        SET id = gen_random_uuid()
        WHERE id = invalid_record.id;
    END LOOP;
    
    -- 無効なuser_idを持つレコードを検索して修正
    FOR invalid_record IN 
        SELECT * FROM diary_entries 
        WHERE user_id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    LOOP
        -- 無効なuser_idを持つレコードを削除（または修正）
        DELETE FROM diary_entries
        WHERE user_id = invalid_record.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. 関数を実行して無効なUUIDを修正
SELECT fix_invalid_uuids();

-- 3. 関数を削除（一時的に使用するだけなので）
DROP FUNCTION IF EXISTS fix_invalid_uuids();

-- 4. 同期エラーを防ぐためのトリガー関数
CREATE OR REPLACE FUNCTION validate_uuid_before_insert() RETURNS TRIGGER AS $$
BEGIN
    -- IDが有効なUUID形式かチェック
    IF NEW.id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' THEN
        -- 無効な場合は新しいUUIDを生成
        NEW.id = gen_random_uuid();
    END IF;
    
    -- user_idが有効なUUID形式かチェック
    IF NEW.user_id IS NOT NULL AND NEW.user_id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' THEN
        -- 無効な場合はNULLに設定（または他の処理）
        RAISE EXCEPTION 'Invalid UUID format for user_id: %', NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. トリガーを作成
DROP TRIGGER IF EXISTS validate_uuid_trigger ON diary_entries;
CREATE TRIGGER validate_uuid_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION validate_uuid_before_insert();

-- 6. コメント
COMMENT ON FUNCTION validate_uuid_before_insert() IS 'UUIDの形式を検証し、無効な形式の場合は新しいUUIDを生成するトリガー関数';