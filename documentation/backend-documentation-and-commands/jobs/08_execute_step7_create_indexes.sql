-- ============================================================================
-- STEP 7: Create Performance Indexes
-- ============================================================================
-- Purpose: Ensure optimal query performance for jobs listing and filtering
-- Tables: gigs, gig_skills, gig_dates, gig_project_details
-- Total Indexes: 9 new indexes + existing ones
-- ============================================================================

-- ============================================================================
-- INDEXES ON GIGS TABLE
-- ============================================================================

-- Index for filtering by company name
CREATE INDEX IF NOT EXISTS idx_gigs_company 
ON gigs(company) 
WHERE company IS NOT NULL;

-- Index for sorting by creation date (most common sort)
CREATE INDEX IF NOT EXISTS idx_gigs_created_at 
ON gigs(created_at DESC);

-- Composite index for type and status filtering (common combo)
CREATE INDEX IF NOT EXISTS idx_gigs_type_status 
ON gigs(type, status);

-- Index for company logo filtering/sorting
CREATE INDEX IF NOT EXISTS idx_gigs_company_logo 
ON gigs(company_logo) 
WHERE company_logo IS NOT NULL;

-- Composite index for jobs listing query (type, status, date)
CREATE INDEX IF NOT EXISTS idx_gigs_list_query 
ON gigs(type, status, created_at DESC) 
WHERE status NOT IN ('draft', 'cancelled', 'archived');

-- Full-text search index on title and description
-- Drop existing if different, then recreate
DROP INDEX IF EXISTS idx_gigs_search;

CREATE INDEX idx_gigs_search 
ON gigs USING gin(
    to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(company, '')
    )
);

-- Index for expiry date filtering (find expired/expiring gigs)
CREATE INDEX IF NOT EXISTS idx_gigs_expiry_date 
ON gigs(expiry_date) 
WHERE expiry_date IS NOT NULL;

-- Index for crew count filtering
CREATE INDEX IF NOT EXISTS idx_gigs_crew_count 
ON gigs(crew_count) 
WHERE crew_count IS NOT NULL;

-- Index for amount/rate filtering
CREATE INDEX IF NOT EXISTS idx_gigs_amount 
ON gigs(amount, currency) 
WHERE amount IS NOT NULL;

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Jobs browse page query (type + status + date + location join)
-- Frontend: GET /api/jobs?type=project&status=active&sort=date_desc
CREATE INDEX IF NOT EXISTS idx_gigs_browse_projects 
ON gigs(type, status, created_at DESC)
WHERE type = 'project' AND status NOT IN ('draft', 'cancelled', 'archived');

CREATE INDEX IF NOT EXISTS idx_gigs_browse_gigs 
ON gigs(type, status, created_at DESC)
WHERE type = 'gig' AND status NOT IN ('draft', 'cancelled', 'archived');

-- User's own gigs query
-- Frontend: GET /api/gigs/my
CREATE INDEX IF NOT EXISTS idx_gigs_user_created 
ON gigs(created_by, created_at DESC);

-- Active gigs by type
-- Frontend: GET /api/gigs?type=project&status=active
CREATE INDEX IF NOT EXISTS idx_gigs_active_by_type 
ON gigs(type, status, expiry_date)
WHERE status IN ('active', 'pre-production', 'production');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- List all indexes on gigs table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'gigs'
ORDER BY indexname;

-- Check index sizes
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
FROM pg_indexes
WHERE tablename = 'gigs'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- List all indexes on gig_skills table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'gig_skills'
ORDER BY indexname;

-- List all indexes on gig_dates table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'gig_dates'
ORDER BY indexname;

-- List all indexes on gig_project_details table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'gig_project_details'
ORDER BY indexname;

-- ============================================================================
-- QUERY PERFORMANCE TESTING
-- ============================================================================

-- Test query 1: Jobs listing (most common query)
EXPLAIN ANALYZE
SELECT 
    g.id,
    g.title,
    g.description,
    g.company,
    g.company_logo,
    g.type,
    g.status,
    g.amount,
    g.currency,
    g.crew_count,
    g.created_at
FROM gigs g
WHERE g.type IN ('project', 'gig')
  AND g.status NOT IN ('draft', 'cancelled', 'archived')
ORDER BY g.created_at DESC
LIMIT 20;

-- Test query 2: Full gig details with joins (detail page query)
EXPLAIN ANALYZE
SELECT 
    g.*,
    
    -- Aggregate skills
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'skill_name', gs.skill_name,
            'skill_level', gs.skill_level
        ) ORDER BY jsonb_build_object(
            'skill_name', gs.skill_name,
            'skill_level', gs.skill_level
        )) FILTER (WHERE gs.id IS NOT NULL),
        '[]'::json
    ) as skills,
    
    -- Aggregate locations
    COALESCE(
        json_agg(DISTINCT gl.location_name) FILTER (WHERE gl.id IS NOT NULL),
        '[]'::json
    ) as locations,
    
    -- Aggregate timeline
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'phase', gd.phase_name,
            'start_date', gd.start_date,
            'end_date', gd.end_date
        ) ORDER BY jsonb_build_object(
            'phase', gd.phase_name,
            'start_date', gd.start_date,
            'end_date', gd.end_date
        )) FILTER (WHERE gd.id IS NOT NULL AND gd.phase_name IS NOT NULL),
        '[]'::json
    ) as timeline,
    
    -- Aggregate project details
    COALESCE(
        json_object_agg(
            gpd.detail_key, 
            gpd.detail_value
        ) FILTER (WHERE gpd.id IS NOT NULL),
        '{}'::json
    ) as project_details
    
FROM gigs g
LEFT JOIN gig_skills gs ON g.id = gs.gig_id
LEFT JOIN gig_locations gl ON g.id = gl.gig_id
LEFT JOIN gig_dates gd ON g.id = gd.gig_id
LEFT JOIN gig_project_details gpd ON g.id = gpd.gig_id
WHERE g.status NOT IN ('draft', 'cancelled', 'archived')
GROUP BY g.id
ORDER BY g.created_at DESC
LIMIT 10;

-- Test query 3: Search query
EXPLAIN ANALYZE
SELECT 
    g.id,
    g.title,
    g.description,
    g.company,
    g.type,
    g.status,
    ts_rank(
        to_tsvector('english', g.title || ' ' || g.description),
        plainto_tsquery('english', 'director film')
    ) as rank
FROM gigs g
WHERE to_tsvector('english', g.title || ' ' || g.description) 
      @@ plainto_tsquery('english', 'director film')
  AND g.status NOT IN ('draft', 'cancelled', 'archived')
ORDER BY rank DESC, g.created_at DESC
LIMIT 20;

-- Test query 4: Filter by skills
EXPLAIN ANALYZE
SELECT DISTINCT
    g.id,
    g.title,
    g.company,
    g.type,
    g.status,
    g.created_at
FROM gigs g
INNER JOIN gig_skills gs ON g.id = gs.gig_id
WHERE gs.skill_name IN ('Director', 'Producer')
  AND g.status NOT IN ('draft', 'cancelled', 'archived')
ORDER BY g.created_at DESC
LIMIT 20;

-- ============================================================================
-- INDEX MAINTENANCE NOTES
-- ============================================================================
-- 
-- PostgreSQL automatically maintains indexes, but for large tables:
-- 
-- 1. Run ANALYZE periodically to update statistics:
--    ANALYZE gigs;
--    ANALYZE gig_skills;
--    ANALYZE gig_dates;
--    ANALYZE gig_project_details;
-- 
-- 2. Monitor index bloat:
--    SELECT * FROM pg_stat_user_indexes WHERE relname LIKE 'gigs%';
-- 
-- 3. Reindex if needed (usually not necessary):
--    REINDEX TABLE gigs;
-- 
-- 4. Monitor slow queries:
--    SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
-- 
-- ============================================================================

-- Update table statistics for query planner
ANALYZE gigs;
ANALYZE gig_skills;
ANALYZE gig_dates;
ANALYZE gig_project_details;
ANALYZE gig_locations;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ All indexes created successfully';
    RAISE NOTICE '📊 Run verification queries above to confirm';
    RAISE NOTICE '🔍 Run EXPLAIN ANALYZE on your queries to test performance';
END $$;
