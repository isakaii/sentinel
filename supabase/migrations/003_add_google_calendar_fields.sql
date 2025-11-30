-- Add Google Calendar fields for OAuth and calendar management

-- Add refresh token to users table for persistent Google auth
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMPTZ;

-- Add Google Calendar ID to courses table to store the created calendar for each course
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
ADD COLUMN IF NOT EXISTS synced_to_google BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_google_calendar_id ON courses(google_calendar_id);