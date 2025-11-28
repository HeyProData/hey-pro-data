-- ============================================================================
-- STEP 6: Create gig_project_details Table
-- ============================================================================
-- Purpose: Store key-value pairs for project-specific details
-- Tables Created: gig_project_details
-- RLS Policies: 5 policies (public read, creator full CRUD)
-- Indexes: 3 indexes for performance
-- Trigger: Auto-update updated_at timestamp
-- ============================================================================

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically update updated_at column';

-- Create gig_project_details table
CREATE TABLE IF NOT EXISTS gig_project_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    detail_key TEXT NOT NULL,
    detail_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate keys per gig
    CONSTRAINT unique_gig_detail UNIQUE(gig_id, detail_key)
);

-- Add table and column comments
COMMENT ON TABLE gig_project_details IS 'Project-specific details as key-value pairs for flexible structured data storage';
COMMENT ON COLUMN gig_project_details.id IS 'Unique identifier for detail record';
COMMENT ON COLUMN gig_project_details.gig_id IS 'Reference to parent gig (CASCADE DELETE)';
COMMENT ON COLUMN gig_project_details.detail_key IS 'Detail key/field name (e.g., projectName, projectType, projectDuration, projectBudget, projectDescription)';
COMMENT ON COLUMN gig_project_details.detail_value IS 'Detail value as text (any content type)';
COMMENT ON COLUMN gig_project_details.sort_order IS 'Display order for details (lower numbers appear first)';
COMMENT ON COLUMN gig_project_details.created_at IS 'Timestamp when detail was created';
COMMENT ON COLUMN gig_project_details.updated_at IS 'Timestamp when detail was last updated (auto-updated by trigger)';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for joining with gigs (most common query)
CREATE INDEX IF NOT EXISTS idx_gig_project_details_gig_id 
ON gig_project_details(gig_id);

-- Composite index for ordered display
CREATE INDEX IF NOT EXISTS idx_gig_project_details_gig_sort 
ON gig_project_details(gig_id, sort_order);

-- Index for filtering/searching by key
CREATE INDEX IF NOT EXISTS idx_gig_project_details_key 
ON gig_project_details(detail_key);

-- ============================================================================
-- TRIGGER FOR AUTO-UPDATE TIMESTAMP
-- ============================================================================

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_gig_project_details_updated_at ON gig_project_details;

CREATE TRIGGER update_gig_project_details_updated_at
    BEFORE UPDATE ON gig_project_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE gig_project_details ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view details for published gigs (not drafts)
CREATE POLICY "Public can view gig project details"
ON gig_project_details FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
        AND gigs.status NOT IN ('draft', 'cancelled', 'archived')
    )
);

-- Policy 2: Creators can view ALL details for their own gigs (including drafts)
CREATE POLICY "Creators can view own gig project details"
ON gig_project_details FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 3: Creators can insert details for their own gigs
CREATE POLICY "Creators can add details to own gigs"
ON gig_project_details FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 4: Creators can update details for their own gigs
CREATE POLICY "Creators can update own gig project details"
ON gig_project_details FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
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

-- Policy 5: Creators can delete details from their own gigs
CREATE POLICY "Creators can delete own gig project details"
ON gig_project_details FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
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
WHERE table_name = 'gig_project_details';

-- Check columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'gig_project_details'
ORDER BY ordinal_position;

-- Check unique constraint
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'gig_project_details' AND con.conname = 'unique_gig_detail';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'gig_project_details'
ORDER BY indexname;

-- Check trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'gig_project_details';

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'gig_project_details';

-- Check RLS policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'gig_project_details'
ORDER BY policyname;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample project details for testing
-- Replace {gig_id} with an actual UUID from your gigs table

/*
INSERT INTO gig_project_details (gig_id, detail_key, detail_value, sort_order) VALUES
('{gig_id}', 'projectName', 'NIGHTHAWK', 1),
('{gig_id}', 'projectType', 'Film', 2),
('{gig_id}', 'projectDuration', '3 months', 3),
('{gig_id}', 'projectBudget', '$500,000', 4),
('{gig_id}', 'projectLocation', 'Dubai Design District +2', 5),
('{gig_id}', 'projectDescription', 'A thrilling short film set in a dystopian future where technology and humanity collide. The story follows a lone vigilante known as Nighthawk, who fights against a corrupt regime to restore justice and freedom.', 6),
('{gig_id}', 'director', 'Sarah Mitchell', 7),
('{gig_id}', 'producer', 'James Rodriguez', 8),
('{gig_id}', 'cinematographer', 'Alex Chen', 9),
('{gig_id}', 'genre', 'Sci-Fi Thriller', 10);
*/

-- ============================================================================
-- USAGE GUIDELINES
-- ============================================================================
-- 
-- Common detail_key Values:
-- 
-- Basic Info:
-- - projectName: Official project name
-- - projectType: Film, TV Show, Commercial, Documentary, Music Video, etc.
-- - projectDuration: Duration string (e.g., "3 months", "6 weeks")
-- - projectBudget: Budget string (e.g., "$500,000", "AED 2M")
-- - projectLocation: Primary location(s)
-- - projectDescription: Long-form description
-- 
-- Credits:
-- - director: Director name(s)
-- - producer: Producer name(s)
-- - writer: Writer name(s)
-- - cinematographer: DoP name(s)
-- - editor: Editor name(s)
-- 
-- Genre/Style:
-- - genre: Genre classification
-- - style: Visual or narrative style
-- - tone: Tone description
-- 
-- Technical:
-- - format: Shooting format (4K, 6K, 8K, Film)
-- - aspect_ratio: Aspect ratio (16:9, 2.39:1, etc.)
-- - runtime: Expected runtime
-- 
-- Distribution:
-- - release_date: Target release date
-- - platform: Release platform (Theatrical, Streaming, TV)
-- - distributor: Distribution company
-- 
-- Custom fields can be added as needed without schema changes
-- ============================================================================
