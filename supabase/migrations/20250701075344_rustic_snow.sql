/*
  # Fix counselor name display issue in admin panel

  1. Changes
    - Add a trigger to preserve the original user_id when updating diary entries
    - Ensure that the user information is not overwritten when a counselor views a diary

  2. Purpose
    - Fix the issue where the counselor's name appears as the author of diary entries
    - Maintain data integrity by preserving the original user information
    - Improve the admin panel user experience
*/

-- 1. Create a function to preserve user information when updating diary entries
CREATE OR REPLACE FUNCTION preserve_diary_user_info() RETURNS TRIGGER AS $$
BEGIN
    -- Ensure user_id is not changed during updates
    IF TG_OP = 'UPDATE' THEN
        NEW.user_id := OLD.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a trigger to apply the function
DROP TRIGGER IF EXISTS preserve_diary_user_info_trigger ON diary_entries;
CREATE TRIGGER preserve_diary_user_info_trigger
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION preserve_diary_user_info();

-- 3. Add comments
COMMENT ON FUNCTION preserve_diary_user_info() IS 'Preserves the original user_id when updating diary entries to prevent counselor name from replacing the original author';