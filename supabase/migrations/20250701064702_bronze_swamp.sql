/*
  # 日記エントリーのユーザー情報保持機能

  1. 変更内容
    - 日記エントリーのユーザー情報を保持するためのトリガー関数を追加
    - 更新時にuser_idが変更されないようにする

  2. 目的
    - カウンセラーコメント追加時にユーザー情報が失われるのを防止
    - データの整合性確保
    - 管理画面でのユーザー表示を正確に保持
*/

-- 1. 日記エントリーのユーザー情報を保持するためのトリガー関数
CREATE OR REPLACE FUNCTION preserve_diary_user_info() RETURNS TRIGGER AS $$
BEGIN
    -- user_idが変更されないようにする
    IF TG_OP = 'UPDATE' THEN
        NEW.user_id := OLD.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. トリガーを作成
DROP TRIGGER IF EXISTS preserve_diary_user_info_trigger ON diary_entries;
CREATE TRIGGER preserve_diary_user_info_trigger
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION preserve_diary_user_info();

-- 3. コメント
COMMENT ON FUNCTION preserve_diary_user_info() IS '日記エントリーのユーザー情報が変更されないようにするトリガー関数';