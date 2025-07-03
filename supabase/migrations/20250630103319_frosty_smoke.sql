/*
  # 既存の無効なUUIDを修正

  1. 変更内容
    - 既存の無効なUUIDを検出して修正する関数を作成
    - 無効なUUIDを持つレコードを自動的に修正

  2. 目的
    - データベース内の無効なUUIDを修正
    - 同期エラーの発生を防止
    - データの整合性を確保
*/

-- 1. 既存の無効なUUIDを修正する関数
CREATE OR REPLACE FUNCTION fix_all_invalid_uuids() RETURNS void AS $$
DECLARE
    invalid_record RECORD;
    new_uuid UUID;
    fixed_count INTEGER := 0;
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
        
        fixed_count := fixed_count + 1;
    END LOOP;
    
    -- 無効なuser_idを持つレコードを検索して修正
    FOR invalid_record IN 
        SELECT id, user_id FROM diary_entries 
        WHERE user_id IS NOT NULL 
        AND user_id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    LOOP
        -- 無効なuser_idを持つレコードを削除
        DELETE FROM diary_entries
        WHERE id = invalid_record.id;
        
        fixed_count := fixed_count + 1;
    END LOOP;
    
    RAISE NOTICE '% invalid UUID records fixed or removed', fixed_count;
END;
$$ LANGUAGE plpgsql;

-- 2. 関数を実行して無効なUUIDを修正
SELECT fix_all_invalid_uuids();

-- 3. 関数を削除（一時的に使用するだけなので）
DROP FUNCTION IF EXISTS fix_all_invalid_uuids();

-- 4. UUID検証用のヘルパー関数
CREATE OR REPLACE FUNCTION is_valid_uuid(text) RETURNS boolean AS $$
BEGIN
    RETURN $1 ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. コメント
COMMENT ON FUNCTION is_valid_uuid(text) IS 'テキストが有効なUUID形式かどうかをチェックする関数';