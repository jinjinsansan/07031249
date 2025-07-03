-- 所有者列の不変制約
CREATE OR REPLACE FUNCTION prevent_owner_change()
RETURNS TRIGGER AS $$
BEGIN
  -- user_idが変更されようとした場合は元の値を保持
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    NEW.user_id := OLD.user_id;
    RAISE NOTICE 'user_id の変更が防止されました: % -> %', NEW.user_id, OLD.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存のトリガーを削除して再作成
DROP TRIGGER IF EXISTS trg_prevent_owner_change ON diary_entries;
CREATE TRIGGER trg_prevent_owner_change
  BEFORE UPDATE ON diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION prevent_owner_change();

-- コメント
COMMENT ON FUNCTION prevent_owner_change() IS '日記エントリーの所有者（user_id）が変更されないようにするトリガー関数';