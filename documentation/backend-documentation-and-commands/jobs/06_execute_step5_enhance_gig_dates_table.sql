-- ============================================================================
-- STEP 5: Enhance gig_dates Table for Timeline Phases
-- ============================================================================
-- Purpose: Support structured timeline phases like "Pre-Production: 2024-10-01 to 2024-11-01"
-- Tables Modified: gig_dates
-- New Columns: phase_name, start_date, end_date, sort_order
-- RLS Policies: Verify/create 5 policies
-- Indexes: 3 new indexes
-- ============================================================================

-- Add new columns to gig_dates table
ALTER TABLE gig_dates 
ADD COLUMN IF NOT EXISTS phase_name TEXT;

ALTER TABLE gig_dates 
ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE gig_dates 
ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE gig_dates 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add constraint to ensure end_date is after start_date
ALTER TABLE gig_dates DROP CONSTRAINT IF EXISTS gig_dates_valid_range;

ALTER TABLE gig_dates 
ADD CONSTRAINT gig_dates_valid_range 
CHECK (
    (start_date IS NULL AND end_date IS NULL) OR 
    (end_date IS NULL) OR 
    (end_date >= start_date)
);

-- Add column comments
COMMENT ON COLUMN gig_dates.phase_name IS 'Timeline phase name (e.g., Pre-Production, Production, Post-Production, Release)';
COMMENT ON COLUMN gig_dates.start_date IS 'Phase start date';
COMMENT ON COLUMN gig_dates.end_date IS 'Phase end date (can be NULL for TBC dates)';
COMMENT ON COLUMN gig_dates.sort_order IS 'Display order for timeline phases (lower numbers appear first)';

-- ============================================================================
-- BACKWARD COMPATIBILITY NOTES
-- ============================================================================
-- Old columns (month, days) are retained for backward compatibility
-- New columns (phase_name, start_date, end_date) provide structured timeline
-- Both can coexist - use new columns for projects, old columns for gigs
-- ============================================================================

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_gig_dates_gig_sort;
DROP INDEX IF EXISTS idx_gig_dates_phase;
DROP INDEX IF EXISTS idx_gig_dates_date_range;

-- Composite index for ordered display
CREATE INDEX idx_gig_dates_gig_sort 
ON gig_dates(gig_id, sort_order);

-- Index for filtering by phase name
CREATE INDEX idx_gig_dates_phase 
ON gig_dates(phase_name) 
WHERE phase_name IS NOT NULL;

-- Index for date range queries
CREATE INDEX idx_gig_dates_date_range 
ON gig_dates(start_date, end_date) 
WHERE start_date IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS (if not already enabled)
ALTER TABLE gig_dates ENABLE ROW LEVEL SECURITY;

-- Check if policies already exist
DO $$
BEGIN
    -- Drop existing policies to recreate them (ensures consistency)
    DROP POLICY IF EXISTS "Public can view gig dates" ON gig_dates;
    DROP POLICY IF EXISTS "Creators can view own gig dates" ON gig_dates;
    DROP POLICY IF EXISTS "Creators can add dates to own gigs" ON gig_dates;
    DROP POLICY IF EXISTS "Creators can update own gig dates" ON gig_dates;
    DROP POLICY IF EXISTS "Creators can delete own gig dates" ON gig_dates;
END $$;

-- Policy 1: Public can view dates for published gigs (not drafts)
CREATE POLICY "Public can view gig dates"
ON gig_dates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.status NOT IN ('draft', 'cancelled', 'archived')
    )
);

-- Policy 2: Creators can view dates for their own gigs (including drafts)
CREATE POLICY "Creators can view own gig dates"
ON gig_dates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 3: Creators can insert dates for their own gigs
CREATE POLICY "Creators can add dates to own gigs"
ON gig_dates FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 4: Creators can update dates for their own gigs
CREATE POLICY "Creators can update own gig dates"
ON gig_dates FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 5: Creators can delete dates from their own gigs
CREATE POLICY "Creators can delete own gig dates"
ON gig_dates FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check new columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'gig_dates' 
AND column_name IN ('phase_name', 'start_date', 'end_date', 'sort_order')
ORDER BY ordinal_position;

-- Check constraint
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'gig_dates' AND con.conname = 'gig_dates_valid_range';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'gig_dates'
ORDER BY indexname;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'gig_dates';

-- Check RLS policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'gig_dates'
ORDER BY policyname;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample timeline for testing
-- Replace {gig_id} with an actual UUID from your gigs table

/*
INSERT INTO gig_dates (gig_id, phase_name, start_date, end_date, sort_order) VALUES
('{gig_id}', 'Pre-Production', '2024-10-01', '2024-11-01', 1),
('{gig_id}', 'Production', '2024-11-02', '2025-01-15', 2),
('{gig_id}', 'Post-Production', '2025-01-16', '2025-02-28', 3),
('{gig_id}', 'Release', '2025-03-15', '2025-03-15', 4);
*/

-- ============================================================================
-- USAGE GUIDELINES
-- ============================================================================
-- 
-- Common Timeline Phases:
-- - Pre-Production: Planning, scripting, casting, location scouting
-- - Production: Principal photography, filming, shooting
-- - Post-Production: Editing, color grading, VFX, sound design
-- - Release: Distribution, premiere, launch
-- 
-- Additional Phases (as needed):
-- - Development: Initial concept and funding phase
-- - Wrap: Final wrap-up and deliverables
-- - Distribution: Marketing and distribution phase
-- - Archive: Long-term storage and archiving
-- ============================================================================
