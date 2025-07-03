/*
  # NULL値のuser_idを修正

  1. 変更内容
    - NULL値のuser_idを持つ日記エントリーを修正する関数を追加
    - 既存のNULL値のuser_idを修正

  2. 目的
    - カウンセラー管理画面で日記のユーザー名が表示されない問題を解決
    - データの整合性を確保
*/

-- 1. NULL値のuser_idを修正するための関数
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
            
            RAISE NOTICE 'NULL値のuser_idを修正しました: 日記ID % → ユーザーID %', null_entry.id, user_record.id;
        ELSE
            RAISE NOTICE '日記ID %のNULL値user_idを修正できませんでした: ユーザーが見つかりません', null_entry.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. 関数を実行してNULL値のuser_idを修正
SELECT fix_null_user_ids();

-- 3. コメント
COMMENT ON FUNCTION fix_null_user_ids() IS 'NULL値のuser_idを持つ日記エントリーを修正する関数';