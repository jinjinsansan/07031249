/*
  # カウンセラーコメント時のユーザーID保持

  1. 変更内容
    - 日記エントリーのユーザー情報を保持するためのトリガー関数を追加
    - 更新時に元のuser_idを保持するトリガーを作成

  2. 目的
    - カウンセラーがコメントを追加しても日記の作成者（ユーザー）が変わらないようにする
    - 日記データの整合性を確保
    - 管理画面での表示問題を解決
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