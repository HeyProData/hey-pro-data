-- ============================================================================
-- STEP 3: Update gigs.status Enum Values
-- ============================================================================
-- Purpose: Support production workflow phases shown in frontend UI
-- Tables Modified: gigs
-- Changes: Update CHECK constraint to include production phases
-- ============================================================================

-- Drop existing status constraint if it exists
ALTER TABLE gigs DROP CONSTRAINT IF EXISTS gigs_status_check;

-- Add comprehensive status constraint with production workflow phases
ALTER TABLE gigs 
ADD CONSTRAINT gigs_status_check 
CHECK (status IN (
    -- Original recruitment statuses
    'active',           -- Actively recruiting / Accepting applications
    'closed',           -- No longer accepting applications
    'draft',            -- Not yet published / visible to public
    
    -- Production workflow phases (for type='project')
    'pre-production',   -- Planning, preparation, pre-production phase
    'production',       -- Active filming, shooting, production phase
    'post-production',  -- Editing, color grading, finishing phase
    'completed',        -- Project completed successfully
    
    -- Additional statuses
    'on-hold',          -- Temporarily paused / postponed
    'cancelled',        -- Cancelled / abandoned project
    'archived'          -- Archived for historical reference
));

COMMENT ON COLUMN gigs.status IS 'Status: active (recruiting), closed, draft, pre-production, production, post-production, completed, on-hold, cancelled, archived';

-- ============================================================================
-- STATUS WORKFLOW GUIDELINES
-- ============================================================================
-- 
-- FOR GIGS (type='gig'):
--   draft -> active -> closed
--   draft -> cancelled
--   active -> on-hold -> active
-- 
-- FOR PROJECTS (type='project'):
--   draft -> active (recruiting) -> pre-production -> production -> 
--   post-production -> completed
--   
--   Any phase can go to: on-hold, cancelled, archived
-- 
-- VISIBILITY RULES:
--   - 'draft': Only visible to creator
--   - 'cancelled', 'archived': Hidden from public listings by default
--   - All others: Publicly visible
-- ============================================================================

-- Verification Query
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'gigs' AND con.conname = 'gigs_status_check';

-- Check current status distribution
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM gigs
GROUP BY status
ORDER BY count DESC;
