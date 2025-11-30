-- Add user preference columns for theme and notifications
ALTER TABLE users
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
ADD COLUMN IF NOT EXISTS notification_timing TEXT[] DEFAULT ARRAY['1_day']::TEXT[];

-- Comment explaining the notification_timing options
COMMENT ON COLUMN users.notification_timing IS 'Array of notification timing preferences: 1_day, 3_days, 1_week';
