-- Fix color constraint to match TypeScript types
-- The database had 'purple' but TypeScript uses 'cardinal'

-- First, drop the old constraint
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_color_check;

-- Add the new constraint with 'cardinal' instead of 'purple'
ALTER TABLE courses ADD CONSTRAINT courses_color_check
  CHECK (color IN ('cardinal', 'blue', 'red', 'green', 'orange', 'pink', 'indigo', 'teal'));

-- Update any existing 'purple' courses to 'cardinal' (in case any exist)
UPDATE courses SET color = 'cardinal' WHERE color = 'purple';