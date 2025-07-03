/*
  # Fix urgency_level constraint and validation

  1. Changes
    - Remove the problematic CHECK constraint on urgency_level
    - Add a trigger to validate and fix invalid urgency_level values
    - Update existing records with invalid values

  2. Purpose
    - Fix "invalid input syntax for type uuid" errors during sync
    - Ensure only valid values are stored in urgency_level
    - Maintain data integrity
*/

-- 1. Remove any existing constraint on urgency_level
ALTER TABLE diary_entries DROP CONSTRAINT IF EXISTS diary_entries_urgency_level_check;

-- 2. Fix existing invalid values
UPDATE diary_entries
SET urgency_level = ''
WHERE urgency_level IS NOT NULL 
  AND urgency_level != ''
  AND urgency_level NOT IN ('high', 'medium', 'low');

-- 3. Create a function to validate urgency_level values
CREATE OR REPLACE FUNCTION validate_urgency_level() RETURNS TRIGGER AS $$
BEGIN
    -- If urgency_level has an invalid value, set it to empty string
    IF NEW.urgency_level IS NOT NULL AND NEW.urgency_level != '' AND NEW.urgency_level NOT IN ('high', 'medium', 'low') THEN
        NEW.urgency_level := '';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a trigger to validate urgency_level on insert/update
DROP TRIGGER IF EXISTS validate_urgency_level_trigger ON diary_entries;
CREATE TRIGGER validate_urgency_level_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION validate_urgency_level();

-- 5. Add comments
COMMENT ON FUNCTION validate_urgency_level() IS 'Validates urgency_level values and converts invalid values to empty string';