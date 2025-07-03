/*
  # UUID同期エラーの修正

  1. 変更内容
    - 無効なUUIDを自動的に修正するトリガー関数を作成
    - 既存の無効なUUIDを修正する関数を作成
    - diary_entriesテーブルにトリガーを設定

  2. 目的
    - 「invalid input syntax for type uuid」エラーの防止
    - データ同期時のエラーを減らす
    - 既存の無効なデータを修正
*/

-- 1. 無効なUUIDを自動的に修正するトリガー関数
CREATE OR REPLACE FUNCTION auto_fix_invalid_uuid() RETURNS TRIGGER AS $$
BEGIN
    -- IDが有効なUUID形式かチェック
    IF NEW.id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' THEN
        -- 無効な場合は新しいUUIDを生成
        NEW.id = gen_random_uuid();
        RAISE NOTICE 'Invalid UUID format detected. Generated new UUID: %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 既存の無効なUUIDを修正する関数
CREATE OR REPLACE FUNCTION fix_existing_invalid_uuids() RETURNS void AS $$
DECLARE
    invalid_record RECORD;
    new_uuid UUID;
BEGIN
    -- diary_entriesテーブルの無効なIDを検索して修正
    FOR invalid_record IN 
        SELECT id FROM diary_entries 
        WHERE id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    LOOP
        -- 新しいUUIDを生成
        SELECT gen_random_uuid() INTO new_uuid;
        
        -- レコードを更新
        UPDATE diary_entries
        SET id = new_uuid
        WHERE id = invalid_record.id;
        
        RAISE NOTICE 'Fixed invalid UUID: % -> %', invalid_record.id, new_uuid;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. 既存の無効なUUIDを修正
SELECT fix_existing_invalid_uuids();

-- 4. トリガーを作成
DROP TRIGGER IF EXISTS auto_fix_invalid_uuid_trigger ON diary_entries;
CREATE TRIGGER auto_fix_invalid_uuid_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION auto_fix_invalid_uuid();

-- 5. コメント
COMMENT ON FUNCTION auto_fix_invalid_uuid() IS '無効なUUIDを自動的に修正するトリガー関数';
COMMENT ON FUNCTION fix_existing_invalid_uuids() IS '既存の無効なUUIDを修正する関数';