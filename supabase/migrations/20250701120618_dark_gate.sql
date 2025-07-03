-- BEFORE UPDATE: user_id を変更しようとしたら拒否
CREATE OR REPLACE FUNCTION prevent_owner_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'user_id is immutable';
  END IF;
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_owner_change ON diary_entries;
CREATE TRIGGER trg_prevent_owner_change
  BEFORE UPDATE ON diary_entries
  FOR EACH ROW EXECUTE FUNCTION prevent_owner_change();

COMMENT ON FUNCTION prevent_owner_change() IS '日記エントリーの所有者（user_id）が変更されないようにするトリガー関数';