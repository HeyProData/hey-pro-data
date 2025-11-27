-- =====================================================
-- DESIGN PROJECTS FEATURE - PERFORMANCE INDEXES
-- =====================================================
-- Version: 1.0
-- Created: January 2025
-- Purpose: Create performance indexes for Design Projects
--
-- Index Strategy:
-- - Foreign key columns for JOIN performance
-- - Frequently filtered columns (status, privacy, type)
-- - Sort columns (created_at, updated_at, sort_order)
-- - Unique constraint columns (slug)
-- - Composite indexes for common query patterns
-- - Full-text search indexes for title and description
-- =====================================================


-- =====================================================
-- TABLE 1: design_projects INDEXES (12 indexes)
-- =====================================================

-- Index 1.1: Filter by owner (most common query)
CREATE INDEX IF NOT EXISTS idx_design_projects_user_id 
ON design_projects(user_id);

-- Index 1.2: Filter by status (active, draft, completed, etc.)
CREATE INDEX IF NOT EXISTS idx_design_projects_status 
ON design_projects(status);

-- Index 1.3: Filter by privacy (public, private, team_only)
CREATE INDEX IF NOT EXISTS idx_design_projects_privacy 
ON design_projects(privacy);

-- Index 1.4: Filter by project type (commercial, film, tv, etc.)
CREATE INDEX IF NOT EXISTS idx_design_projects_project_type 
ON design_projects(project_type);

-- Index 1.5: Sort by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_design_projects_created_at 
ON design_projects(created_at DESC);

-- Index 1.6: Sort by last updated (recently modified)
CREATE INDEX IF NOT EXISTS idx_design_projects_updated_at 
ON design_projects(updated_at DESC);

-- Index 1.7: Lookup by slug (for URL routing)
CREATE INDEX IF NOT EXISTS idx_design_projects_slug 
ON design_projects(slug);

-- Index 1.8: Filter by remote/location
CREATE INDEX IF NOT EXISTS idx_design_projects_is_remote 
ON design_projects(is_remote);

-- Index 1.9: Common browse query (public, active projects)
CREATE INDEX IF NOT EXISTS idx_design_projects_browse 
ON design_projects(privacy, status, created_at DESC)
WHERE privacy = 'public' AND status NOT IN ('draft', 'cancelled', 'archived');

-- Index 1.10: User's projects query (owner + status)
CREATE INDEX IF NOT EXISTS idx_design_projects_user_status 
ON design_projects(user_id, status, created_at DESC);

-- Index 1.11: Filter by project type + status
CREATE INDEX IF NOT EXISTS idx_design_projects_type_status 
ON design_projects(project_type, status, created_at DESC);

-- Index 1.12: Date range queries (for timeline filtering)
CREATE INDEX IF NOT EXISTS idx_design_projects_dates 
ON design_projects(start_date, end_date)
WHERE start_date IS NOT NULL;

-- Index 1.13: Full-text search on title and description
CREATE INDEX IF NOT EXISTS idx_design_projects_search 
ON design_projects USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

COMMENT ON INDEX idx_design_projects_search IS 'Full-text search index for title and description';


-- =====================================================
-- TABLE 2: project_tags INDEXES (4 indexes)
-- =====================================================

-- Index 2.1: Join with projects
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id 
ON project_tags(project_id);

-- Index 2.2: Filter by tag name
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_name 
ON project_tags(tag_name);

-- Index 2.3: Case-insensitive tag search
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_name_lower 
ON project_tags(LOWER(tag_name));

-- Index 2.4: Composite for tag filtering
CREATE INDEX IF NOT EXISTS idx_project_tags_composite 
ON project_tags(tag_name, project_id);

COMMENT ON INDEX idx_project_tags_tag_name_lower IS 'Case-insensitive tag search and filtering';


-- =====================================================
-- TABLE 3: project_team INDEXES (6 indexes)
-- =====================================================

-- Index 3.1: Join with projects
CREATE INDEX IF NOT EXISTS idx_project_team_project_id 
ON project_team(project_id);

-- Index 3.2: Find user's projects (reverse lookup)
CREATE INDEX IF NOT EXISTS idx_project_team_user_id 
ON project_team(user_id);

-- Index 3.3: Filter by permission level
CREATE INDEX IF NOT EXISTS idx_project_team_permission 
ON project_team(permission);

-- Index 3.4: Filter by role
CREATE INDEX IF NOT EXISTS idx_project_team_role 
ON project_team(role)
WHERE role IS NOT NULL;

-- Index 3.5: Composite for team listing
CREATE INDEX IF NOT EXISTS idx_project_team_composite 
ON project_team(project_id, permission, added_at DESC);

-- Index 3.6: User's team memberships with permission
CREATE INDEX IF NOT EXISTS idx_project_team_user_permission 
ON project_team(user_id, permission, project_id);

COMMENT ON INDEX idx_project_team_composite IS 'Optimized for listing team members with permissions';


-- =====================================================
-- TABLE 4: project_files INDEXES (7 indexes)
-- =====================================================

-- Index 4.1: Join with projects
CREATE INDEX IF NOT EXISTS idx_project_files_project_id 
ON project_files(project_id);

-- Index 4.2: Find files uploaded by user
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by 
ON project_files(uploaded_by);

-- Index 4.3: Filter by file type
CREATE INDEX IF NOT EXISTS idx_project_files_file_type 
ON project_files(file_type);

-- Index 4.4: Sort by upload date
CREATE INDEX IF NOT EXISTS idx_project_files_created_at 
ON project_files(created_at DESC);

-- Index 4.5: Composite for project file listing
CREATE INDEX IF NOT EXISTS idx_project_files_composite 
ON project_files(project_id, file_type, created_at DESC);

-- Index 4.6: User's uploads across projects
CREATE INDEX IF NOT EXISTS idx_project_files_user_uploads 
ON project_files(uploaded_by, created_at DESC);

-- Index 4.7: File size queries (for storage management)
CREATE INDEX IF NOT EXISTS idx_project_files_size 
ON project_files(file_size DESC)
WHERE file_size > 1048576; -- Files larger than 1MB

COMMENT ON INDEX idx_project_files_composite IS 'Optimized for listing project files by type';


-- =====================================================
-- TABLE 5: project_links INDEXES (3 indexes)
-- =====================================================

-- Index 5.1: Join with projects
CREATE INDEX IF NOT EXISTS idx_project_links_project_id 
ON project_links(project_id);

-- Index 5.2: Sort by display order
CREATE INDEX IF NOT EXISTS idx_project_links_sort_order 
ON project_links(project_id, sort_order);

-- Index 5.3: Sort by creation date
CREATE INDEX IF NOT EXISTS idx_project_links_created_at 
ON project_links(created_at DESC);

COMMENT ON INDEX idx_project_links_sort_order IS 'Optimized for displaying links in order';


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify indexes are correctly created
-- =====================================================

-- Count indexes per table
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
GROUP BY tablename
ORDER BY tablename;

-- List all indexes with details
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
ORDER BY tablename, indexname;

-- Check index sizes (to monitor storage usage)
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid::regclass)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
ORDER BY pg_relation_size(indexrelid::regclass) DESC;

-- Analyze index usage statistics (run after some queries)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
ORDER BY idx_scan DESC;


-- =====================================================
-- INDEX SUMMARY
-- =====================================================
-- Total: 35+ indexes across 5 tables
--
-- design_projects: 13 indexes
--   - Single column: user_id, status, privacy, project_type, 
--     created_at, updated_at, slug, is_remote
--   - Composite: browse, user_status, type_status, dates
--   - Full-text: title + description
--
-- project_tags: 4 indexes
--   - Single column: project_id, tag_name, tag_name_lower
--   - Composite: tag_name + project_id
--
-- project_team: 6 indexes
--   - Single column: project_id, user_id, permission, role
--   - Composite: team listing, user permissions
--
-- project_files: 7 indexes
--   - Single column: project_id, uploaded_by, file_type, 
--     created_at, size
--   - Composite: project files, user uploads
--
-- project_links: 3 indexes
--   - Single column: project_id, created_at
--   - Composite: sort_order
-- =====================================================

-- =====================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- =====================================================
--
-- Common Query Patterns and Optimized Indexes:
--
-- 1. Browse public projects:
--    SELECT * FROM design_projects 
--    WHERE privacy = 'public' AND status = 'active' 
--    ORDER BY created_at DESC;
--    → Uses: idx_design_projects_browse
--
-- 2. User's projects:
--    SELECT * FROM design_projects 
--    WHERE user_id = ? ORDER BY created_at DESC;
--    → Uses: idx_design_projects_user_status
--
-- 3. Search projects:
--    SELECT * FROM design_projects 
--    WHERE to_tsvector('english', title || ' ' || description) 
--    @@ plainto_tsquery('english', ?);
--    → Uses: idx_design_projects_search
--
-- 4. Filter by tags:
--    SELECT dp.* FROM design_projects dp
--    JOIN project_tags pt ON pt.project_id = dp.id
--    WHERE pt.tag_name = ?;
--    → Uses: idx_project_tags_tag_name, idx_project_tags_project_id
--
-- 5. Project team members:
--    SELECT * FROM project_team 
--    WHERE project_id = ? ORDER BY added_at DESC;
--    → Uses: idx_project_team_composite
--
-- 6. User's team memberships:
--    SELECT * FROM project_team WHERE user_id = ?;
--    → Uses: idx_project_team_user_id
--
-- 7. Project files by type:
--    SELECT * FROM project_files 
--    WHERE project_id = ? AND file_type = 'image' 
--    ORDER BY created_at DESC;
--    → Uses: idx_project_files_composite
--
-- 8. Project links in order:
--    SELECT * FROM project_links 
--    WHERE project_id = ? ORDER BY sort_order;
--    → Uses: idx_project_links_sort_order
--
-- =====================================================

-- =====================================================
-- MAINTENANCE COMMANDS
-- =====================================================
-- Run periodically to keep indexes optimized
-- =====================================================

-- Analyze tables to update statistics
ANALYZE design_projects;
ANALYZE project_tags;
ANALYZE project_team;
ANALYZE project_files;
ANALYZE project_links;

-- Vacuum to reclaim space (optional, runs automatically)
-- VACUUM ANALYZE design_projects;
-- VACUUM ANALYZE project_tags;
-- VACUUM ANALYZE project_team;
-- VACUUM ANALYZE project_files;
-- VACUUM ANALYZE project_links;


-- =====================================================
-- END OF INDEXES SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Execute this script in Supabase SQL Editor
-- 2. Verify all indexes are created (should see 35+ total)
-- 3. Run ANALYZE commands to update statistics
-- 4. Proceed to 04_STORAGE_BUCKET.sql for storage setup
-- =====================================================
