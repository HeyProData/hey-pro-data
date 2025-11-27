-- ============================================================================
-- STEP 4: Create gig_skills Junction Table
-- ============================================================================
-- Purpose: Store required skills/roles for each gig (Producer, Director, etc.)
-- Tables Created: gig_skills
-- RLS Policies: 5 policies (public read, creator full CRUD)
-- Indexes: 3 indexes for performance
-- ============================================================================

-- Create gig_skills table
CREATE TABLE IF NOT EXISTS gig_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('required', 'preferred', 'nice-to-have')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate skills per gig
    CONSTRAINT unique_gig_skill UNIQUE(gig_id, skill_name)
);

-- Add table and column comments
COMMENT ON TABLE gig_skills IS 'Required skills and roles for gigs/projects (Producer, Director, Camera Operator, Editor, etc.)';
COMMENT ON COLUMN gig_skills.id IS 'Unique identifier for skill record';
COMMENT ON COLUMN gig_skills.gig_id IS 'Reference to parent gig (CASCADE DELETE)';
COMMENT ON COLUMN gig_skills.skill_name IS 'Skill or role name (e.g., Producer, Director, Camera Operator, Editor, Sound Engineer)';
COMMENT ON COLUMN gig_skills.skill_level IS 'Skill importance: required (must have), preferred (nice to have), nice-to-have (bonus)';
COMMENT ON COLUMN gig_skills.sort_order IS 'Display order for skills list (lower numbers appear first)';
COMMENT ON COLUMN gig_skills.created_at IS 'Timestamp when skill was added';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for joining with gigs (most common query)
CREATE INDEX IF NOT EXISTS idx_gig_skills_gig_id 
ON gig_skills(gig_id);

-- Composite index for ordered display
CREATE INDEX IF NOT EXISTS idx_gig_skills_gig_sort 
ON gig_skills(gig_id, sort_order);

-- Index for filtering by skill name (e.g., find all gigs needing "Director")
CREATE INDEX IF NOT EXISTS idx_gig_skills_name 
ON gig_skills(skill_name);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE gig_skills ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view skills for published gigs (not drafts)
CREATE POLICY "Public can view gig skills"
ON gig_skills FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
        AND gigs.status NOT IN ('draft', 'cancelled', 'archived')
    )
);

-- Policy 2: Gig creators can view ALL skills for their own gigs (including drafts)
CREATE POLICY "Creators can view own gig skills"
ON gig_skills FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 3: Gig creators can insert skills for their own gigs
CREATE POLICY "Creators can add skills to own gigs"
ON gig_skills FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 4: Gig creators can update skills for their own gigs
CREATE POLICY "Creators can update own gig skills"
ON gig_skills FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
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

-- Policy 5: Gig creators can delete skills from their own gigs
CREATE POLICY "Creators can delete own gig skills"
ON gig_skills FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check table was created
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name = 'gig_skills';

-- Check columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'gig_skills'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'gig_skills'
ORDER BY indexname;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'gig_skills';

-- Check RLS policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'gig_skills'
ORDER BY policyname;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample skills for testing
-- Replace {gig_id} with an actual UUID from your gigs table

/*
INSERT INTO gig_skills (gig_id, skill_name, skill_level, sort_order) VALUES
('{gig_id}', 'Producer', 'required', 1),
('{gig_id}', 'Director', 'required', 2),
('{gig_id}', 'Camera Operator', 'required', 3),
('{gig_id}', 'Sound Engineer', 'preferred', 4),
('{gig_id}', 'Editor', 'required', 5),
('{gig_id}', 'Production Assistant', 'nice-to-have', 6);
*/
