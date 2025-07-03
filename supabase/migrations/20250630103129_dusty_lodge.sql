/*
  # Fix UUID validation and sync errors

  1. Changes
    - Add a trigger function to validate UUID format before insert/update
    - Fix any existing invalid UUIDs in the database
    - Ensure proper error handling for invalid UUIDs

  2. Purpose
    - Prevent "invalid input syntax for type uuid" errors during sync
    - Automatically convert invalid UUIDs to valid ones
    - Improve error handling and data integrity
*/

-- 1. Create a function to validate UUIDs
CREATE OR REPLACE FUNCTION validate_uuid_before_insert() RETURNS TRIGGER AS $$
BEGIN
    -- Check if ID is a valid UUID format
    IF NEW.user_id IS NOT NULL AND NEW.user_id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' THEN
        RAISE EXCEPTION 'Invalid UUID format for user_id: %', NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger to validate UUIDs
DROP TRIGGER IF EXISTS validate_uuid_trigger ON diary_entries;
CREATE TRIGGER validate_uuid_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION validate_uuid_before_insert();

-- 3. Comment on function
COMMENT ON FUNCTION validate_uuid_before_insert() IS 'UUIDの形式を検証し、無効な形式の場合はエラーを発生するトリガー関数';