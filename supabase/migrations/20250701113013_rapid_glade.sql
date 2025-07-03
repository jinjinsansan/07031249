/*
  # 日記エントリーの所有者変更防止

  1. 変更内容
    - 日記エントリーの所有者（user_id）が変更されないようにするトリガー関数を追加
    - 更新時に所有者が変更されようとした場合にエラーを発生させる

  2. 目的
    - カウンセラーがコメントを追加しても日記の作成者（ユーザー）が変わらないようにする
    - データの整合性を確保
    - 管理画面での表示問題を解決
*/

-- 1. 日記エントリーの所有者変更を防止するためのトリガー関数
CREATE OR REPLACE FUNCTION prevent_owner_change()
RETURNS TRIGGER AS $$
BEGIN
  -- user_idが変更されようとした場合にエラーを発生させる
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id is immutable';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. トリガーを作成
DROP TRIGGER IF EXISTS trg_prevent_owner_change ON diary_entries;
CREATE TRIGGER trg_prevent_owner_change
  BEFORE UPDATE ON diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_owner_change();

-- 3. コメント
COMMENT ON FUNCTION prevent_owner_change() IS '日記エントリーの所有者（user_id）が変更されないようにするトリガー関数';