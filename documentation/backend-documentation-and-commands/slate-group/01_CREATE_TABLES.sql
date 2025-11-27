-- =====================================================
-- Slate Group - CREATE TABLES SQL Script
-- =====================================================
-- Version: 1.0
-- Last Updated: January 2025
-- Purpose: Create 6 tables for social media-style slate posts
-- Execution Order: Run this FIRST before RLS and indexes
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: slate_posts (Main posts table)
-- =====================================================
-- Purpose: Store user-generated social posts with text and media
-- Relationships: 1:N with slate_media, slate_likes, slate_comments, slate_shares
-- =====================================================

CREATE TABLE IF NOT EXISTS slate_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Author information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Post content
    content TEXT NOT NULL CHECK (char_length(content) <= 5000),
    
    -- Optional slug for SEO-friendly URLs (e.g., /slate/my-first-post-abc123)
    slug TEXT UNIQUE,
    
    -- Post status
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    
    -- Cached engagement counts (updated via triggers)
    likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
    shares_count INTEGER NOT NULL DEFAULT 0 CHECK (shares_count >= 0),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE slate_posts IS 'Main table for social media-style slate posts';
COMMENT ON COLUMN slate_posts.content IS 'Post text content, max 5000 characters';
COMMENT ON COLUMN slate_posts.slug IS 'URL-friendly identifier for SEO';
COMMENT ON COLUMN slate_posts.status IS 'published = visible to all, draft = author only, archived = hidden';

-- =====================================================
-- TABLE 2: slate_media (Post attachments)
-- =====================================================
-- Purpose: Store images and videos attached to posts
-- Relationships: N:1 with slate_posts (many media per post)
-- =====================================================

CREATE TABLE IF NOT EXISTS slate_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent post
    post_id UUID NOT NULL REFERENCES slate_posts(id) ON DELETE CASCADE,
    
    -- Media information
    media_url TEXT NOT NULL, -- Supabase Storage URL
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    
    -- Display order (for multiple images)
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE slate_media IS 'Images and videos attached to slate posts';
COMMENT ON COLUMN slate_media.media_url IS 'Full URL from Supabase Storage (slate-media bucket)';
COMMENT ON COLUMN slate_media.sort_order IS 'Display order for multiple attachments (0 = first)';

-- =====================================================
-- TABLE 3: slate_likes (Likes tracking)
-- =====================================================
-- Purpose: Track which users liked which posts
-- Relationships: N:1 with slate_posts, N:1 with auth.users
-- =====================================================

CREATE TABLE IF NOT EXISTS slate_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Post and user
    post_id UUID NOT NULL REFERENCES slate_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one like per user per post
    CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- Add comments
COMMENT ON TABLE slate_likes IS 'Track likes on slate posts';
COMMENT ON CONSTRAINT unique_post_like ON slate_likes IS 'One like per user per post';

-- =====================================================
-- TABLE 4: slate_comments (Comments system)
-- =====================================================
-- Purpose: Comments on posts with nested replies support
-- Relationships: N:1 with slate_posts, N:1 with auth.users, self-referencing for replies
-- =====================================================

CREATE TABLE IF NOT EXISTS slate_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Post and user
    post_id UUID NOT NULL REFERENCES slate_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Nested comments support (NULL = top-level comment)
    parent_comment_id UUID REFERENCES slate_comments(id) ON DELETE CASCADE,
    
    -- Comment content
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE slate_comments IS 'Comments on slate posts with nested replies';
COMMENT ON COLUMN slate_comments.parent_comment_id IS 'NULL for top-level, UUID for nested replies';
COMMENT ON COLUMN slate_comments.content IS 'Comment text, max 2000 characters';

-- =====================================================
-- TABLE 5: slate_shares (Shares tracking)
-- =====================================================
-- Purpose: Track post shares/reposts by users
-- Relationships: N:1 with slate_posts, N:1 with auth.users
-- =====================================================

CREATE TABLE IF NOT EXISTS slate_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Post and user
    post_id UUID NOT NULL REFERENCES slate_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one share per user per post
    CONSTRAINT unique_post_share UNIQUE (post_id, user_id)
);

-- Add comments
COMMENT ON TABLE slate_shares IS 'Track shares/reposts of slate posts';
COMMENT ON CONSTRAINT unique_post_share ON slate_shares IS 'One share per user per post';

-- =====================================================
-- TABLE 6: slate_saved (Saved/Bookmarked posts)
-- =====================================================
-- Purpose: User's saved posts for later viewing
-- Relationships: N:1 with slate_posts, N:1 with auth.users
-- =====================================================

CREATE TABLE IF NOT EXISTS slate_saved (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Post and user
    post_id UUID NOT NULL REFERENCES slate_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one save per user per post
    CONSTRAINT unique_saved_post UNIQUE (post_id, user_id)
);

-- Add comments
COMMENT ON TABLE slate_saved IS 'User bookmarks/saved posts';
COMMENT ON CONSTRAINT unique_saved_post ON slate_saved IS 'One bookmark per user per post';

-- =====================================================
-- TRIGGERS: Auto-update timestamps and counts
-- =====================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_slate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to slate_posts
DROP TRIGGER IF EXISTS slate_posts_updated_at ON slate_posts;
CREATE TRIGGER slate_posts_updated_at
    BEFORE UPDATE ON slate_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_slate_updated_at();

-- Apply to slate_comments
DROP TRIGGER IF EXISTS slate_comments_updated_at ON slate_comments;
CREATE TRIGGER slate_comments_updated_at
    BEFORE UPDATE ON slate_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_slate_updated_at();

-- =====================================================
-- TRIGGERS: Update cached counts on slate_posts
-- =====================================================

-- Function to increment likes_count
CREATE OR REPLACE FUNCTION increment_slate_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slate_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes_count
CREATE OR REPLACE FUNCTION decrement_slate_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slate_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS slate_likes_insert ON slate_likes;
CREATE TRIGGER slate_likes_insert
    AFTER INSERT ON slate_likes
    FOR EACH ROW
    EXECUTE FUNCTION increment_slate_likes_count();

DROP TRIGGER IF EXISTS slate_likes_delete ON slate_likes;
CREATE TRIGGER slate_likes_delete
    AFTER DELETE ON slate_likes
    FOR EACH ROW
    EXECUTE FUNCTION decrement_slate_likes_count();

-- Function to increment comments_count
CREATE OR REPLACE FUNCTION increment_slate_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slate_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comments_count
CREATE OR REPLACE FUNCTION decrement_slate_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slate_posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS slate_comments_insert ON slate_comments;
CREATE TRIGGER slate_comments_insert
    AFTER INSERT ON slate_comments
    FOR EACH ROW
    EXECUTE FUNCTION increment_slate_comments_count();

DROP TRIGGER IF EXISTS slate_comments_delete ON slate_comments;
CREATE TRIGGER slate_comments_delete
    AFTER DELETE ON slate_comments
    FOR EACH ROW
    EXECUTE FUNCTION decrement_slate_comments_count();

-- Function to increment shares_count
CREATE OR REPLACE FUNCTION increment_slate_shares_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slate_posts
    SET shares_count = shares_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement shares_count
CREATE OR REPLACE FUNCTION decrement_slate_shares_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE slate_posts
    SET shares_count = GREATEST(shares_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS slate_shares_insert ON slate_shares;
CREATE TRIGGER slate_shares_insert
    AFTER INSERT ON slate_shares
    FOR EACH ROW
    EXECUTE FUNCTION increment_slate_shares_count();

DROP TRIGGER IF EXISTS slate_shares_delete ON slate_shares;
CREATE TRIGGER slate_shares_delete
    AFTER DELETE ON slate_shares
    FOR EACH ROW
    EXECUTE FUNCTION decrement_slate_shares_count();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE 'slate_%'
ORDER BY table_name;

-- Check triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE 'slate_%'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Run 02_RLS_POLICIES.sql to secure the tables
-- 2. Run 03_INDEXES.sql for performance optimization
-- 3. Run 04_STORAGE_BUCKET.sql to setup media storage
-- =====================================================