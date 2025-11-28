-- ============================================================================
-- STEP 2: Update gigs.type Enum Values
-- ============================================================================
-- Purpose: Clearly distinguish between projects and gigs using the type field
-- Tables Modified: gigs
-- Changes: Update CHECK constraint to include new type values
-- ============================================================================

-- Drop existing type constraint if it exists
ALTER TABLE gigs DROP CONSTRAINT IF EXISTS gigs_type_check;

-- Add new CHECK constraint with comprehensive type values
ALTER TABLE gigs 
ADD CONSTRAINT gigs_type_check 
CHECK (type IN (
    -- Original job types
    'contract',     -- Contract-based work
    'full-time',    -- Full-time position
    'part-time',    -- Part-time position
    
    -- New primary types for jobs feature
    'project',      -- Multi-phase project (Pre-Production -> Post-Production)
    'gig',          -- Single engagement gig (one-time work)
    
    -- Additional flexible types
    'freelance',    -- Freelance engagement
    'temporary',    -- Temporary assignment
    'internship',   -- Internship opportunity
    'volunteer'     -- Volunteer opportunity
));

COMMENT ON COLUMN gigs.type IS 'Job type: project (multi-phase), gig (single engagement), contract, full-time, part-time, freelance, temporary, internship, volunteer';

-- ============================================================================
-- USAGE GUIDELINES
-- ============================================================================
-- 'project': Use for multi-phase productions with timeline (films, TV shows, documentaries)
--            Frontend will show project details, timeline phases, budget
-- 
-- 'gig': Use for single-engagement work (one-day shoot, event coverage, specific task)
--        Frontend will show simpler interface focused on rate and dates
-- 
-- Other types: Can be used based on employment nature
-- ============================================================================

-- Verification Query
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'gigs' AND con.conname = 'gigs_type_check';
