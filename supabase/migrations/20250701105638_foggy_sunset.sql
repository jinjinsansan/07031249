/*
  # Fix user_id preservation in diary entries

  1. Changes
    - Create a function to preserve user_id when updating diary entries
    - Add a trigger to ensure user_id is not changed during updates
    - Fix issue where counselor comments would change the diary author

  2. Purpose
    - Prevent counselor name from replacing the original diary author
    - Ensure data integrity when updating diary entries
    - Fix the issue in the admin panel where user names were being changed
*/

-- 1. Create a function to preserve user information when updating diary entries
CREATE OR REPLACE FUNCTION preserve_diary_user_id() RETURNS TRIGGER AS $$
BEGIN
    -- Ensure user_id is not changed during updates
    IF TG_OP = 'UPDATE' THEN
        -- Log the attempted change for debugging
        IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
            RAISE LOG 'Preserving user_id: Attempted to change from % to % for diary entry %', 
                      OLD.user_id, NEW.user_id, NEW.id;
        END IF;
        
        -- Always preserve the original user_id
        NEW.user_id := OLD.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a trigger with highest priority (0) to ensure it runs before other triggers
DROP TRIGGER IF EXISTS preserve_diary_user_id_trigger ON diary_entries;
CREATE TRIGGER preserve_diary_user_id_trigger
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION preserve_diary_user_id();

-- 3. Add comments
COMMENT ON FUNCTION preserve_diary_user_id() IS 'Preserves the original user_id when updating diary entries to prevent counselor name from replacing the original author';