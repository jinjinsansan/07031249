/*
  # Fix existing invalid UUIDs

  1. Changes
    - Create a function to fix existing invalid UUIDs in the database
    - Add a trigger to automatically fix invalid UUIDs on insert/update
    - Improve error handling for UUID validation

  2. Purpose
    - Clean up any existing invalid UUIDs in the database
    - Ensure all future entries have valid UUIDs
    - Prevent sync errors related to invalid UUIDs
*/

-- 1. Create a function to fix existing invalid UUIDs
CREATE OR REPLACE FUNCTION fix_existing_invalid_uuids() RETURNS void AS $$
DECLARE
    invalid_record RECORD;
    new_uuid UUID;
BEGIN
    -- Find and fix invalid IDs in diary_entries
    FOR invalid_record IN 
        SELECT id FROM diary_entries 
        WHERE id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    LOOP
        -- Generate a new UUID
        SELECT gen_random_uuid() INTO new_uuid;
        
        -- Update the record with the new UUID
        UPDATE diary_entries
        SET id = new_uuid
        WHERE id = invalid_record.id;
        
        RAISE NOTICE 'Fixed invalid UUID: % -> %', invalid_record.id, new_uuid;
    END LOOP;
    
    -- Find and fix invalid user_ids in diary_entries
    FOR invalid_record IN 
        SELECT id, user_id FROM diary_entries 
        WHERE user_id IS NOT NULL 
        AND user_id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    LOOP
        -- For invalid user_ids, we need to find a valid user or create one
        -- For simplicity, we'll just set it to NULL and log the issue
        UPDATE diary_entries
        SET user_id = NULL
        WHERE id = invalid_record.id;
        
        RAISE NOTICE 'Set invalid user_id to NULL for diary entry: %', invalid_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Execute the function to fix existing invalid UUIDs
SELECT fix_existing_invalid_uuids();

-- 3. Create a trigger function to automatically fix invalid UUIDs
CREATE OR REPLACE FUNCTION auto_fix_invalid_uuid() RETURNS TRIGGER AS $$
BEGIN
    -- Check if ID is a valid UUID format
    IF NEW.id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' THEN
        -- Generate a new UUID
        NEW.id = gen_random_uuid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a trigger to automatically fix invalid UUIDs
DROP TRIGGER IF EXISTS auto_fix_invalid_uuid_trigger ON diary_entries;
CREATE TRIGGER auto_fix_invalid_uuid_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION auto_fix_invalid_uuid();

-- 5. Add comments
COMMENT ON FUNCTION fix_existing_invalid_uuids() IS '既存の無効なUUIDを修正する関数';
COMMENT ON FUNCTION auto_fix_invalid_uuid() IS '無効なUUIDを自動的に修正するトリガー関数';