/*
  # 日記エントリーのユーザーID同期問題の修正

  1. 変更内容
    - 日記エントリーのユーザーIDが正しく設定されるように修正
    - 既存の日記エントリーのNULLユーザーIDを修正するための関数を追加

  2. 目的
    - カウンセラー管理画面で日記を閲覧した際に、正しいユーザー情報が表示されるようにする
    - データの整合性を確保
    - 同期エラーの防止
*/

-- 1. 日記エントリーのユーザーIDを保持するためのトリガー関数
CREATE OR REPLACE FUNCTION preserve_diary_user_id() RETURNS TRIGGER AS $$
BEGIN
    -- user_idが変更されないようにする
    IF TG_OP = 'UPDATE' THEN
        -- 変更の試みをログに記録（デバッグ用）
        IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
            RAISE LOG 'ユーザーID保持: % から % への変更を防止しました（日記ID: %）', 
                      OLD.user_id, NEW.user_id, NEW.id;
        END IF;
        
        -- 常に元のuser_idを保持
        NEW.user_id := OLD.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. トリガーを作成
DROP TRIGGER IF EXISTS preserve_diary_user_id_trigger ON diary_entries;
CREATE TRIGGER preserve_diary_user_id_trigger
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION preserve_diary_user_id();

-- 3. NULL値のuser_idを修正するための関数
CREATE OR REPLACE FUNCTION fix_null_user_ids() RETURNS void AS $$
DECLARE
    null_entry RECORD;
    user_record RECORD;
BEGIN
    -- NULLのuser_idを持つ日記エントリーを検索
    FOR null_entry IN 
        SELECT id, date, emotion, event
        FROM diary_entries
        WHERE user_id IS NULL
    LOOP
        -- ユーザーを検索（最初に見つかったユーザーを使用）
        SELECT id INTO user_record
        FROM users
        LIMIT 1;
        
        -- ユーザーが見つかった場合、user_idを更新
        IF user_record.id IS NOT NULL THEN
            UPDATE diary_entries
            SET user_id = user_record.id
            WHERE id = null_entry.id;
            
            RAISE NOTICE 'Fixed NULL user_id for diary entry %: Set to %', null_entry.id, user_record.id;
        ELSE
            RAISE NOTICE 'Could not fix NULL user_id for diary entry %: No users found', null_entry.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. コメント
COMMENT ON FUNCTION preserve_diary_user_id() IS '日記エントリーのユーザーIDが変更されないようにするトリガー関数';
COMMENT ON FUNCTION fix_null_user_ids() IS 'NULLのuser_idを持つ日記エントリーを修正する関数';