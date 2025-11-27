-- =====================================================
-- Slate Group - PERFORMANCE INDEXES
-- =====================================================
-- Version: 1.0
-- Last Updated: January 2025
-- Purpose: Create indexes for optimal query performance
-- Execution Order: Run AFTER 01_CREATE_TABLES.sql and 02_RLS_POLICIES.sql
-- Total Indexes: 20+ indexes across 6 tables
-- =====================================================

-- =====================================================
-- TABLE 1: slate_posts (8 indexes)
-- =====================================================

-- Index 1: Lookup posts by author
CREATE INDEX IF NOT EXISTS idx_slate_posts_user_id 
    ON slate_posts(user_id);

COMMENT ON INDEX idx_slate_posts_user_id IS 'Fast lookup of posts by author';

-- Index 2: Filter posts by status
CREATE INDEX IF NOT EXISTS idx_slate_posts_status 
    ON slate_posts(status);

COMMENT ON INDEX idx_slate_posts_status IS 'Filter posts by published/draft/archived status';

-- Index 3: Sort posts by creation date (most recent first)
CREATE INDEX IF NOT EXISTS idx_slate_posts_created_at 
    ON slate_posts(created_at DESC);

COMMENT ON INDEX idx_slate_posts_created_at IS 'Sort posts chronologically for feed';

-- Index 4: Lookup posts by slug
CREATE INDEX IF NOT EXISTS idx_slate_posts_slug 
    ON slate_posts(slug) 
    WHERE slug IS NOT NULL;

COMMENT ON INDEX idx_slate_posts_slug IS 'Fast lookup by URL slug (partial index)';

-- Index 5: Composite index for user's posts by status
CREATE INDEX IF NOT EXISTS idx_slate_posts_user_status 
    ON slate_posts(user_id, status, created_at DESC);

COMMENT ON INDEX idx_slate_posts_user_status IS 'Efficient query for user posts filtered by status';

-- Index 6: Sort by popularity (likes)
CREATE INDEX IF NOT EXISTS idx_slate_posts_likes_count 
    ON slate_posts(likes_count DESC, created_at DESC) 
    WHERE status = 'published';

COMMENT ON INDEX idx_slate_posts_likes_count IS 'Sort published posts by popularity';

-- Index 7: Sort by engagement (comments)
CREATE INDEX IF NOT EXISTS idx_slate_posts_comments_count 
    ON slate_posts(comments_count DESC, created_at DESC) 
    WHERE status = 'published';

COMMENT ON INDEX idx_slate_posts_comments_count IS 'Sort published posts by comment activity';

-- Index 8: Full-text search on content
CREATE INDEX IF NOT EXISTS idx_slate_posts_content_search 
    ON slate_posts USING gin(to_tsvector('english', content));

COMMENT ON INDEX idx_slate_posts_content_search IS 'Full-text search on post content';

-- =====================================================
-- TABLE 2: slate_media (3 indexes)
-- =====================================================

-- Index 1: Lookup media by post
CREATE INDEX IF NOT EXISTS idx_slate_media_post_id 
    ON slate_media(post_id);

COMMENT ON INDEX idx_slate_media_post_id IS 'Fast lookup of media for a post';

-- Index 2: Composite index for sorted media
CREATE INDEX IF NOT EXISTS idx_slate_media_post_sort 
    ON slate_media(post_id, sort_order);

COMMENT ON INDEX idx_slate_media_post_sort IS 'Retrieve media in correct display order';

-- Index 3: Filter by media type
CREATE INDEX IF NOT EXISTS idx_slate_media_type 
    ON slate_media(media_type);

COMMENT ON INDEX idx_slate_media_type IS 'Filter media by image/video type';

-- =====================================================
-- TABLE 3: slate_likes (3 indexes)
-- =====================================================

-- Index 1: Lookup likes by post (for counting)
CREATE INDEX IF NOT EXISTS idx_slate_likes_post_id 
    ON slate_likes(post_id);

COMMENT ON INDEX idx_slate_likes_post_id IS 'Count likes per post';

-- Index 2: Lookup user's likes
CREATE INDEX IF NOT EXISTS idx_slate_likes_user_id 
    ON slate_likes(user_id);

COMMENT ON INDEX idx_slate_likes_user_id IS 'Find all posts liked by user';

-- Index 3: Check if user liked a post (composite)
CREATE INDEX IF NOT EXISTS idx_slate_likes_user_post 
    ON slate_likes(user_id, post_id);

COMMENT ON INDEX idx_slate_likes_user_post IS 'Quick check if user liked specific post';

-- =====================================================
-- TABLE 4: slate_comments (5 indexes)
-- =====================================================

-- Index 1: Lookup comments by post
CREATE INDEX IF NOT EXISTS idx_slate_comments_post_id 
    ON slate_comments(post_id);

COMMENT ON INDEX idx_slate_comments_post_id IS 'Retrieve all comments for a post';

-- Index 2: Lookup user's comments
CREATE INDEX IF NOT EXISTS idx_slate_comments_user_id 
    ON slate_comments(user_id);

COMMENT ON INDEX idx_slate_comments_user_id IS 'Find all comments by user';

-- Index 3: Find replies to a comment (nested comments)
CREATE INDEX IF NOT EXISTS idx_slate_comments_parent_id 
    ON slate_comments(parent_comment_id) 
    WHERE parent_comment_id IS NOT NULL;

COMMENT ON INDEX idx_slate_comments_parent_id IS 'Retrieve nested replies to comment';

-- Index 4: Sort comments chronologically
CREATE INDEX IF NOT EXISTS idx_slate_comments_post_created 
    ON slate_comments(post_id, created_at DESC);

COMMENT ON INDEX idx_slate_comments_post_created IS 'Sort comments by date for display';

-- Index 5: Composite index for top-level comments only
CREATE INDEX IF NOT EXISTS idx_slate_comments_post_top_level 
    ON slate_comments(post_id, created_at DESC) 
    WHERE parent_comment_id IS NULL;

COMMENT ON INDEX idx_slate_comments_post_top_level IS 'Retrieve only top-level comments efficiently';

-- =====================================================
-- TABLE 5: slate_shares (3 indexes)
-- =====================================================

-- Index 1: Lookup shares by post (for counting)
CREATE INDEX IF NOT EXISTS idx_slate_shares_post_id 
    ON slate_shares(post_id);

COMMENT ON INDEX idx_slate_shares_post_id IS 'Count shares per post';

-- Index 2: Lookup user's shares
CREATE INDEX IF NOT EXISTS idx_slate_shares_user_id 
    ON slate_shares(user_id);

COMMENT ON INDEX idx_slate_shares_user_id IS 'Find all posts shared by user';

-- Index 3: Check if user shared a post (composite)
CREATE INDEX IF NOT EXISTS idx_slate_shares_user_post 
    ON slate_shares(user_id, post_id);

COMMENT ON INDEX idx_slate_shares_user_post IS 'Quick check if user shared specific post';

-- =====================================================
-- TABLE 6: slate_saved (3 indexes)
-- =====================================================

-- Index 1: Lookup saved posts by user
CREATE INDEX IF NOT EXISTS idx_slate_saved_user_id 
    ON slate_saved(user_id);

COMMENT ON INDEX idx_slate_saved_user_id IS 'Retrieve user saved posts';

-- Index 2: Lookup who saved a post
CREATE INDEX IF NOT EXISTS idx_slate_saved_post_id 
    ON slate_saved(post_id);

COMMENT ON INDEX idx_slate_saved_post_id IS 'Count how many users saved a post';

-- Index 3: Sort user's saved posts chronologically
CREATE INDEX IF NOT EXISTS idx_slate_saved_user_created 
    ON slate_saved(user_id, created_at DESC);

COMMENT ON INDEX idx_slate_saved_user_created IS 'Sort saved posts by when saved';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'slate_%'
ORDER BY tablename, indexname;

-- Count indexes per table
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'slate_%'
GROUP BY tablename
ORDER BY tablename;

-- Check index sizes (useful for monitoring)
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'slate_%'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- =====================================================
-- PERFORMANCE TIPS
-- =====================================================

-- Query Performance Expectations:
--
-- With these indexes, expect:
-- 1. Feed queries (GET /api/slate): < 50ms for 20 posts
-- 2. Post details (GET /api/slate/[id]): < 20ms
-- 3. Like/Unlike operations: < 10ms
-- 4. Comment retrieval: < 30ms
-- 5. Search queries: < 100ms (full-text)
--
-- Monitor slow queries:
-- SELECT * FROM pg_stat_statements 
-- WHERE query LIKE '%slate_%' 
-- ORDER BY mean_exec_time DESC;
--
-- Analyze query plans:
-- EXPLAIN ANALYZE SELECT * FROM slate_posts 
-- WHERE status = 'published' 
-- ORDER BY created_at DESC LIMIT 20;
--
-- Update statistics after bulk inserts:
-- ANALYZE slate_posts;
-- ANALYZE slate_likes;
-- ANALYZE slate_comments;
--
-- =====================================================

-- =====================================================
-- MAINTENANCE NOTES
-- =====================================================

-- Reindex if performance degrades:
-- REINDEX TABLE slate_posts;
-- REINDEX TABLE slate_likes;
-- REINDEX TABLE slate_comments;
--
-- Check for unused indexes:
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as index_scans
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- AND tablename LIKE 'slate_%'
-- AND idx_scan = 0
-- ORDER BY tablename, indexname;
--
-- =====================================================

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Run 04_STORAGE_BUCKET.sql to setup media storage
-- 2. Monitor query performance with pg_stat_statements
-- 3. Adjust indexes based on actual usage patterns
-- =====================================================