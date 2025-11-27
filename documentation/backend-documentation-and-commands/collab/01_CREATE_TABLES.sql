-- =====================================================
-- COLLAB FEATURE - TABLE CREATION
-- =====================================================
-- This file contains SQL commands to create all tables
-- needed for the Collab feature.
--
-- Execution Order: Run this file FIRST
-- Prerequisites: Supabase database with auth.users table
-- =====================================================

-- =====================================================
-- 1. COLLAB_POSTS TABLE
-- Main table for collaboration posts
-- =====================================================

CREATE TABLE IF NOT EXISTS collab_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE collab_posts IS 'Main table for collaboration posts where users can share project ideas and seek collaborators';
COMMENT ON COLUMN collab_posts.user_id IS 'Creator of the collab post (FK to auth.users)';
COMMENT ON COLUMN collab_posts.status IS 'Status: open (accepting collaborators), closed (no longer accepting), draft (not published)';
COMMENT ON COLUMN collab_posts.slug IS 'URL-friendly version of title for routing';

-- =====================================================
-- 2. COLLAB_TAGS TABLE
-- Tags for categorizing collab posts
-- =====================================================

CREATE TABLE IF NOT EXISTS collab_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collab_id UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collab_id, tag_name)
);

COMMENT ON TABLE collab_tags IS 'Tags associated with collab posts for categorization and search';
COMMENT ON COLUMN collab_tags.tag_name IS 'Tag text (e.g., "film writing", "screenplay", "creativity")';

-- =====================================================
-- 3. COLLAB_INTERESTS TABLE
-- Users who expressed interest in collab posts
-- =====================================================

CREATE TABLE IF NOT EXISTS collab_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collab_id UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collab_id, user_id)
);

COMMENT ON TABLE collab_interests IS 'Users who clicked "I''m interested" on collab posts';
COMMENT ON COLUMN collab_interests.user_id IS 'User who expressed interest';
COMMENT ON COLUMN collab_interests.collab_id IS 'Collab post they are interested in';

-- =====================================================
-- 4. COLLAB_COLLABORATORS TABLE
-- Approved collaborators for collab projects
-- =====================================================

CREATE TABLE IF NOT EXISTS collab_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collab_id UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT,
    department TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(collab_id, user_id)
);

COMMENT ON TABLE collab_collaborators IS 'Approved collaborators who have been added to the collab project';
COMMENT ON COLUMN collab_collaborators.role IS 'Role in the project (e.g., "Designer", "Editor", "Sound Engineer")';
COMMENT ON COLUMN collab_collaborators.department IS 'Department/specialty (e.g., "Creative", "Engineering", "Operations")';
COMMENT ON COLUMN collab_collaborators.added_by IS 'User who added this collaborator (usually the collab owner)';

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collab_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for collab_posts
CREATE TRIGGER trigger_update_collab_posts_updated_at
    BEFORE UPDATE ON collab_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_collab_updated_at();

COMMENT ON FUNCTION update_collab_updated_at() IS 'Automatically updates updated_at timestamp on collab_posts';

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify tables were created successfully
-- =====================================================

-- Check if all tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE 'collab_%'
-- ORDER BY table_name;

-- Check columns for each table
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'collab_posts'
-- ORDER BY ordinal_position;
