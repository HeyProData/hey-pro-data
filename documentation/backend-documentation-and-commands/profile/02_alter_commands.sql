-- =====================================================
-- ALTER COMMANDS FOR PROFILE SCHEMA
-- =====================================================
-- Execute these commands in Supabase SQL Editor
-- These modify existing tables to support profile UI
-- =====================================================

-- 1. ALTER user_profiles table - Add missing columns
-- =====================================================

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Available' CHECK (availability IN ('Available', 'Not Available')),
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comment to describe columns
COMMENT ON COLUMN user_profiles.email IS 'User email for contact (separate from auth email)';
COMMENT ON COLUMN user_profiles.country_code IS 'ISO country code for phone number (e.g., US, IN, GB)';
COMMENT ON COLUMN user_profiles.availability IS 'Work availability status - Available or Not Available';
COMMENT ON COLUMN user_profiles.profile_completion_percentage IS 'Profile completion percentage (0-100)';
COMMENT ON COLUMN user_profiles.updated_at IS 'Last profile update timestamp';

-- 2. ALTER applicant_skills table - Add description and ordering
-- =====================================================

ALTER TABLE applicant_skills
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop old unique constraint and create new one
ALTER TABLE applicant_skills DROP CONSTRAINT IF EXISTS applicant_skills_user_id_skill_name_key;
ALTER TABLE applicant_skills ADD CONSTRAINT applicant_skills_user_id_skill_name_unique UNIQUE (user_id, skill_name);

-- Add comment to describe columns
COMMENT ON COLUMN applicant_skills.id IS 'Unique identifier for each skill entry';
COMMENT ON COLUMN applicant_skills.description IS 'Detailed description of the skill and expertise level';
COMMENT ON COLUMN applicant_skills.sort_order IS 'Display order for skills (lower numbers first)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_applicant_skills_user_id_sort ON applicant_skills(user_id, sort_order);

-- =====================================================
-- END OF ALTER COMMANDS
-- =====================================================
