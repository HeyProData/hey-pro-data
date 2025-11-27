-- =====================================================
-- GIGS BACKEND: ALTER STATEMENTS
-- =====================================================
-- Purpose: Add missing columns to existing tables to match frontend requirements
-- Execute Order: 1st (before CREATE statements)
-- Created: January 2025

-- =====================================================
-- 1. ALTER gigs TABLE - Add 11 new columns
-- =====================================================

-- Add slug (unique URL-friendly identifier)
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add crew count (default 1)
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS crew_count INTEGER DEFAULT 1 CHECK (crew_count >= 1);

-- Add role (director, producer, cinematographer, etc.)
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS role TEXT;

-- Add type (contract, full-time, part-time)
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS type TEXT;

-- Add department
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add company (production company)
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add TBC flag
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS is_tbc BOOLEAN DEFAULT false;

-- Add request quote flag
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS request_quote BOOLEAN DEFAULT false;

-- Add expiry date (application deadline)
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;

-- Add supporting file label
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS supporting_file_label TEXT;

-- Add reference URL
ALTER TABLE gigs
ADD COLUMN IF NOT EXISTS reference_url TEXT;

COMMENT ON COLUMN gigs.slug IS 'URL-friendly identifier for routing (e.g., "4-video-editors-shortfilm")';
COMMENT ON COLUMN gigs.crew_count IS 'Number of crew members needed (minimum 1)';
COMMENT ON COLUMN gigs.role IS 'GIG role: director, producer, cinematographer, etc.';
COMMENT ON COLUMN gigs.type IS 'GIG type: contract, full-time, part-time';
COMMENT ON COLUMN gigs.department IS 'Department or specialty area';
COMMENT ON COLUMN gigs.company IS 'Production company name (optional)';
COMMENT ON COLUMN gigs.is_tbc IS '"To Be Confirmed" flag for flexible scheduling';
COMMENT ON COLUMN gigs.request_quote IS 'Whether rate is "Request quote" instead of fixed amount';
COMMENT ON COLUMN gigs.expiry_date IS 'Application deadline ("Apply before" date)';
COMMENT ON COLUMN gigs.supporting_file_label IS 'Label for supporting/reference file';
COMMENT ON COLUMN gigs.reference_url IS 'URL for reference link';

-- =====================================================
-- 2. ALTER crew_availability TABLE - Change availability type
-- =====================================================

-- Step 1: Add new status column
ALTER TABLE crew_availability
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('available', 'hold', 'na'));

-- Step 2: Migrate data from is_available to status
-- (Only run if data exists and status is NULL)
UPDATE crew_availability
SET status = CASE
  WHEN is_available = true THEN 'available'
  WHEN is_available = false THEN 'na'
  ELSE 'na'
END
WHERE status IS NULL;

-- Step 3: Make status NOT NULL after migration
ALTER TABLE crew_availability
ALTER COLUMN status SET NOT NULL;

-- Step 4: Set default value
ALTER TABLE crew_availability
ALTER COLUMN status SET DEFAULT 'na';

-- Step 5: Drop old is_available column (OPTIONAL - only after verifying migration)
-- Uncomment the following line after confirming data migration is successful:
-- ALTER TABLE crew_availability DROP COLUMN IF EXISTS is_available;

COMMENT ON COLUMN crew_availability.status IS 'Availability status: available (P1 priority), hold (confirmed), na (not available)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify gigs table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'gigs'
AND column_name IN (
  'slug', 'crew_count', 'role', 'type', 'department', 'company',
  'is_tbc', 'request_quote', 'expiry_date', 'supporting_file_label', 'reference_url'
)
ORDER BY ordinal_position;

-- Verify crew_availability table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'crew_availability'
AND column_name IN ('status', 'is_available')
ORDER BY ordinal_position;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================

/*
-- To rollback gigs table changes:
ALTER TABLE gigs DROP COLUMN IF EXISTS slug;
ALTER TABLE gigs DROP COLUMN IF EXISTS crew_count;
ALTER TABLE gigs DROP COLUMN IF EXISTS role;
ALTER TABLE gigs DROP COLUMN IF EXISTS type;
ALTER TABLE gigs DROP COLUMN IF EXISTS department;
ALTER TABLE gigs DROP COLUMN IF EXISTS company;
ALTER TABLE gigs DROP COLUMN IF EXISTS is_tbc;
ALTER TABLE gigs DROP COLUMN IF EXISTS request_quote;
ALTER TABLE gigs DROP COLUMN IF EXISTS expiry_date;
ALTER TABLE gigs DROP COLUMN IF EXISTS supporting_file_label;
ALTER TABLE gigs DROP COLUMN IF EXISTS reference_url;

-- To rollback crew_availability changes:
ALTER TABLE crew_availability DROP COLUMN IF EXISTS status;
-- (Restore is_available column manually if dropped)
*/

-- =====================================================
-- NOTES
-- =====================================================

/*
1. The slug column should be populated with a URL-friendly version of the title
   - Example: "4 Video Editors for Shortfilm" → "4-video-editors-shortfilm"
   - Consider adding a trigger or handle in application code

2. For existing gigs without expiry_date, consider setting a default:
   UPDATE gigs SET expiry_date = created_at + INTERVAL '3 days' WHERE expiry_date IS NULL;

3. The crew_availability migration preserves existing data:
   - is_available = true → status = 'available'
   - is_available = false → status = 'na'
   - Only drop is_available column after verifying all data migrated correctly

4. Consider adding a CHECK constraint for role and type if you have a fixed set of values:
   ALTER TABLE gigs ADD CONSTRAINT check_role CHECK (role IN ('director', 'producer', 'cinematographer', ...));
   ALTER TABLE gigs ADD CONSTRAINT check_type CHECK (type IN ('contract', 'full-time', 'part-time'));
*/
