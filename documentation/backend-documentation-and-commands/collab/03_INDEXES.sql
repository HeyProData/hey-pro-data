-- =====================================================
-- COLLAB FEATURE - DATABASE INDEXES
-- =====================================================
-- This file contains indexes to optimize query performance
--
-- Execution Order: Run this file AFTER 02_RLS_POLICIES.sql
-- Prerequisites: All collab tables must exist
-- =====================================================

-- =====================================================
-- COLLAB_POSTS INDEXES
-- =====================================================

-- Index for querying posts by user ("My Collabs")
CREATE INDEX IF NOT EXISTS idx_collab_posts_user_id 
ON collab_posts(user_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_collab_posts_status 
ON collab_posts(status);

-- Index for sorting by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_collab_posts_created_at 
ON collab_posts(created_at DESC);

-- Index for slug-based lookups
CREATE INDEX IF NOT EXISTS idx_collab_posts_slug 
ON collab_posts(slug);

-- Composite index for user's posts by status
CREATE INDEX IF NOT EXISTS idx_collab_posts_user_status 
ON collab_posts(user_id, status);

-- Composite index for public feed (status + created_at)
CREATE INDEX IF NOT EXISTS idx_collab_posts_status_created 
ON collab_posts(status, created_at DESC);

COMMENT ON INDEX idx_collab_posts_user_id IS 'Optimize queries for user-specific collab posts';
COMMENT ON INDEX idx_collab_posts_status IS 'Optimize filtering by post status (open/closed/draft)';
COMMENT ON INDEX idx_collab_posts_created_at IS 'Optimize sorting by newest posts first';
COMMENT ON INDEX idx_collab_posts_slug IS 'Optimize slug-based routing lookups';

-- =====================================================
-- COLLAB_TAGS INDEXES
-- =====================================================

-- Index for querying tags by collab post
CREATE INDEX IF NOT EXISTS idx_collab_tags_collab_id 
ON collab_tags(collab_id);

-- Index for searching posts by tag name
CREATE INDEX IF NOT EXISTS idx_collab_tags_tag_name 
ON collab_tags(tag_name);

-- GIN index for full-text search on tag names (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_collab_tags_tag_name_gin 
ON collab_tags USING GIN (to_tsvector('english', tag_name));

COMMENT ON INDEX idx_collab_tags_collab_id IS 'Optimize fetching all tags for a collab post';
COMMENT ON INDEX idx_collab_tags_tag_name IS 'Optimize filtering/searching posts by tag';
COMMENT ON INDEX idx_collab_tags_tag_name_gin IS 'Enable full-text search on tag names';

-- =====================================================
-- COLLAB_INTERESTS INDEXES
-- =====================================================

-- Index for counting interests per collab post
CREATE INDEX IF NOT EXISTS idx_collab_interests_collab_id 
ON collab_interests(collab_id);

-- Index for querying user's interests
CREATE INDEX IF NOT EXISTS idx_collab_interests_user_id 
ON collab_interests(user_id);

-- Composite index for checking if user already interested
CREATE INDEX IF NOT EXISTS idx_collab_interests_collab_user 
ON collab_interests(collab_id, user_id);

-- Index for ordering interests by date (for "recent interests")
CREATE INDEX IF NOT EXISTS idx_collab_interests_created_at 
ON collab_interests(created_at DESC);

COMMENT ON INDEX idx_collab_interests_collab_id IS 'Optimize interest count and interested users queries';
COMMENT ON INDEX idx_collab_interests_user_id IS 'Optimize fetching all interests for a user';
COMMENT ON INDEX idx_collab_interests_collab_user IS 'Optimize checking if user already expressed interest';

-- =====================================================
-- COLLAB_COLLABORATORS INDEXES
-- =====================================================

-- Index for querying collaborators by collab post
CREATE INDEX IF NOT EXISTS idx_collab_collaborators_collab_id 
ON collab_collaborators(collab_id);

-- Index for querying collabs a user is collaborating on
CREATE INDEX IF NOT EXISTS idx_collab_collaborators_user_id 
ON collab_collaborators(user_id);

-- Composite index for checking if user is already a collaborator
CREATE INDEX IF NOT EXISTS idx_collab_collaborators_collab_user 
ON collab_collaborators(collab_id, user_id);

-- Index for sorting collaborators by when they were added
CREATE INDEX IF NOT EXISTS idx_collab_collaborators_added_at 
ON collab_collaborators(added_at DESC);

-- Index for filtering collaborators by role
CREATE INDEX IF NOT EXISTS idx_collab_collaborators_role 
ON collab_collaborators(role);

COMMENT ON INDEX idx_collab_collaborators_collab_id IS 'Optimize fetching all collaborators for a collab';
COMMENT ON INDEX idx_collab_collaborators_user_id IS 'Optimize finding all collabs a user is part of';
COMMENT ON INDEX idx_collab_collaborators_collab_user IS 'Optimize checking if user is already a collaborator';

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify indexes were created
-- =====================================================

-- List all indexes on collab tables
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE tablename LIKE 'collab_%'
-- ORDER BY tablename, indexname;

-- Check index sizes
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
-- FROM pg_indexes
-- WHERE tablename LIKE 'collab_%'
-- ORDER BY pg_relation_size(indexname::regclass) DESC;
