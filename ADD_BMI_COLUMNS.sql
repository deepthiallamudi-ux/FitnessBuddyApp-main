-- Add BMI tracking columns to existing profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_weight FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_bmi FLOAT;

-- Verify the columns were added
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='profiles';
