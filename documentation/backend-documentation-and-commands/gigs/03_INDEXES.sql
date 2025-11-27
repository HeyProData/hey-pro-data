-- =====================================================
-- GIGS BACKEND: CREATE INDEXES
-- =====================================================
-- Purpose: Add performance indexes for fast queries
-- Execute Order: 3rd (after CREATE statements)
-- Created: January 2025

-- =====================================================
-- 1. INDEXES ON gigs TABLE
-- =====================================================

-- Index on slug (for slug-based lookups in /gigs/[slug])
CREATE INDEX IF NOT EXISTS idx_gigs_slug ON gigs(slug);

-- Index on role (for filtering by role)
CREATE INDEX IF NOT EXISTS idx_gigs_role ON gigs(role);

-- Index on type (for filtering by type: contract, full-time, part-time)
CREATE INDEX IF NOT EXISTS idx_gigs_type ON gigs(type);

-- Index on department (for filtering by department)
CREATE INDEX IF NOT EXISTS idx_gigs_department ON gigs(department);

-- Index on expiry_date (for filtering active/expired gigs)
CREATE INDEX IF NOT EXISTS idx_gigs_expiry_date ON gigs(expiry_date);

-- Composite index on status and expiry_date (for active gigs query)
CREATE INDEX IF NOT EXISTS idx_gigs_status_expiry ON gigs(status, expiry_date);

-- Composite index on created_by and status (for user's gigs)
CREATE INDEX IF NOT EXISTS idx_gigs_created_by_status ON gigs(created_by, status);

-- Full-text search index on title and description
CREATE INDEX IF NOT EXISTS idx_gigs_search ON gigs USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

-- =====================================================
-- 2. INDEXES ON gig_references TABLE
-- =====================================================

-- Index on gig_id (for fast join with gigs table)
CREATE INDEX IF NOT EXISTS idx_gig_references_gig_id ON gig_references(gig_id);

-- Index on type (for filtering by file vs link)
CREATE INDEX IF NOT EXISTS idx_gig_references_type ON gig_references(type);

-- =====================================================
-- 3. INDEXES ON crew_availability TABLE (additional)
-- =====================================================

-- Index on status (for filtering by availability status)
CREATE INDEX IF NOT EXISTS idx_crew_availability_status ON crew_availability(status);

-- Composite index on user_id and status (for user availability queries)
CREATE INDEX IF NOT EXISTS idx_crew_availability_user_status ON crew_availability(user_id, status);

-- Composite index on gig_id and status (for gig availability queries)
CREATE INDEX IF NOT EXISTS idx_crew_availability_gig_status ON crew_availability(gig_id, status) WHERE gig_id IS NOT NULL;

-- =====================================================
-- 4. INDEXES ON applications TABLE (additional)
-- =====================================================

-- Composite index on gig_id and status (for filtering applications by status)
CREATE INDEX IF NOT EXISTS idx_applications_gig_status ON applications(gig_id, status);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- List all indexes on gigs table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'gigs'
AND schemaname = 'public'
ORDER BY indexname;

-- List all indexes on gig_references table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'gig_references'
AND schemaname = 'public'
ORDER BY indexname;

-- List all indexes on crew_availability table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'crew_availability'
AND schemaname = 'public'
ORDER BY indexname;

-- List all indexes on applications table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'applications'
AND schemaname = 'public'
ORDER BY indexname;

-- Check index sizes (to monitor performance)
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename IN ('gigs', 'gig_references', 'crew_availability', 'applications')
ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- PERFORMANCE TESTING QUERIES
-- =====================================================

/*
-- Test 1: Query active gigs (should use idx_gigs_status_expiry)
EXPLAIN ANALYZE
SELECT * FROM gigs
WHERE status = 'active'
AND expiry_date > NOW()
ORDER BY created_at DESC
LIMIT 20;

-- Test 2: Search gigs by keyword (should use idx_gigs_search)
EXPLAIN ANALYZE
SELECT * FROM gigs
WHERE to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', 'video & editor')
LIMIT 20;

-- Test 3: Get gig by slug (should use idx_gigs_slug)
EXPLAIN ANALYZE
SELECT * FROM gigs
WHERE slug = 'video-editors-shortfilm';

-- Test 4: Filter gigs by role (should use idx_gigs_role)
EXPLAIN ANALYZE
SELECT * FROM gigs
WHERE role = 'director'
AND status = 'active'
LIMIT 20;

-- Test 5: Get gig references (should use idx_gig_references_gig_id)
EXPLAIN ANALYZE
SELECT * FROM gig_references
WHERE gig_id = 'your-gig-id-here';

-- Test 6: Get applicant availability (should use idx_crew_availability_user_status)
EXPLAIN ANALYZE
SELECT * FROM crew_availability
WHERE user_id = 'your-user-id-here'
AND status = 'available'
ORDER BY availability_date;
*/

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================

/*
-- To drop all indexes:
DROP INDEX IF EXISTS idx_gigs_slug;
DROP INDEX IF EXISTS idx_gigs_role;
DROP INDEX IF EXISTS idx_gigs_type;
DROP INDEX IF EXISTS idx_gigs_department;
DROP INDEX IF EXISTS idx_gigs_expiry_date;
DROP INDEX IF EXISTS idx_gigs_status_expiry;
DROP INDEX IF EXISTS idx_gigs_created_by_status;
DROP INDEX IF EXISTS idx_gigs_search;
DROP INDEX IF EXISTS idx_gig_references_gig_id;
DROP INDEX IF EXISTS idx_gig_references_type;
DROP INDEX IF EXISTS idx_crew_availability_status;
DROP INDEX IF EXISTS idx_crew_availability_user_status;
DROP INDEX IF EXISTS idx_crew_availability_gig_status;
DROP INDEX IF EXISTS idx_applications_gig_status;
*/

-- =====================================================
-- NOTES
-- =====================================================

/*
1. PERFORMANCE EXPECTATIONS:
   - Slug lookup: < 10ms (unique index)
   - Active gigs query: < 50ms (composite index)
   - Search query: < 100ms (GIN full-text index)
   - Join queries: < 50ms (foreign key indexes)

2. INDEX MAINTENANCE:
   - Indexes are automatically maintained by PostgreSQL
   - Consider REINDEX if query performance degrades over time
   - Monitor index bloat with pg_stat_user_indexes

3. FULL-TEXT SEARCH:
   - The GIN index on title + description enables fast text search
   - Use to_tsquery() for search queries (handles stemming, stop words)
   - Example: to_tsquery('english', 'video & editor')

4. WHEN TO ADD MORE INDEXES:
   - If filtering by location becomes common: CREATE INDEX ON gigs(location);
   - If filtering by company: CREATE INDEX ON gigs(company);
   - Monitor slow query logs to identify missing indexes

5. INDEX SIZE CONSIDERATIONS:
   - Each index adds storage overhead and slows down writes
   - Only add indexes for frequently queried columns
   - GIN indexes are larger but enable complex text search

6. COMPOSITE INDEX ORDER:
   - Place most selective column first (e.g., status before expiry_date)
   - Matches common WHERE clause patterns in queries
*/
