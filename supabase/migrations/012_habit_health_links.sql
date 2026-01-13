-- Add health_link column to habits table
-- Values: 'wake_time', 'steps', 'bedtime', null (for normal habits)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS health_link TEXT;

-- Create index for quick lookup of health-linked habits
CREATE INDEX IF NOT EXISTS idx_habits_health_link ON habits(health_link) WHERE health_link IS NOT NULL;

-- Add bedtime_target to health_settings
ALTER TABLE health_settings ADD COLUMN IF NOT EXISTS bedtime_target TIME DEFAULT '23:00:00';

-- Update the 3 health-linked habits
UPDATE habits SET health_link = 'wake_time' WHERE id = '0a8ae9d0-d5c0-4e55-b0d0-74cc9248a037';
UPDATE habits SET health_link = 'steps' WHERE id = 'e8a9fd37-8794-4c6f-85e4-276b3790cb09';
UPDATE habits SET health_link = 'bedtime' WHERE id = '7c929fb8-2de5-4060-8507-d11f21dab165';

-- Deactivate habits now covered by Health OS or daily checkin
UPDATE habits SET is_active = false WHERE id = '6b96012f-a6e8-405c-866c-67333a9e0b39'; -- 15 min planning (covered by checkin)
UPDATE habits SET is_active = false WHERE id = '40e76393-4f9a-482e-87ae-ba6b2a61972a'; -- No alcohol (tracked in Health diet)
UPDATE habits SET is_active = false WHERE id = 'a9161653-4876-4096-8ef8-79edda9444e7'; -- Drink 2L water (tracked in Health diet)
UPDATE habits SET is_active = false WHERE id = 'c2e67e9b-ca56-4ede-8f78-ca084ca1b75d'; -- No masturbating (no longer tracking)
