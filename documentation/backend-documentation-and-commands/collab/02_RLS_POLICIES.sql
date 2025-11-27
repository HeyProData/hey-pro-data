-- =====================================================
-- COLLAB FEATURE - ROW LEVEL SECURITY POLICIES
-- =====================================================
-- This file contains RLS policies to secure collab data
--
-- Execution Order: Run this file AFTER 01_CREATE_TABLES.sql
-- Prerequisites: All collab tables must exist
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE collab_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_collaborators ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COLLAB_POSTS POLICIES
-- =====================================================

-- Allow public to view all open and closed collab posts
CREATE POLICY "Public can view open and closed collab posts"
ON collab_posts FOR SELECT
USING (status IN ('open', 'closed'));

-- Allow users to view their own draft posts
CREATE POLICY "Users can view own draft collab posts"
ON collab_posts FOR SELECT
USING (auth.uid() = user_id AND status = 'draft');

-- Allow authenticated users to create collab posts
CREATE POLICY "Authenticated users can create collab posts"
ON collab_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own collab posts
CREATE POLICY "Users can update own collab posts"
ON collab_posts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own collab posts
CREATE POLICY "Users can delete own collab posts"
ON collab_posts FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- COLLAB_TAGS POLICIES
-- =====================================================

-- Allow public to view all tags (for filtering/search)
CREATE POLICY "Public can view all collab tags"
ON collab_tags FOR SELECT
USING (true);

-- Allow collab post owners to add tags to their posts
CREATE POLICY "Collab owners can add tags"
ON collab_tags FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
);

-- Allow collab post owners to delete tags from their posts
CREATE POLICY "Collab owners can delete tags"
ON collab_tags FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
);

-- =====================================================
-- COLLAB_INTERESTS POLICIES
-- =====================================================

-- Allow users to view their own interests
CREATE POLICY "Users can view own interests"
ON collab_interests FOR SELECT
USING (auth.uid() = user_id);

-- Allow collab owners to view all interests on their posts
CREATE POLICY "Collab owners can view all interests"
ON collab_interests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
);

-- Allow authenticated users to express interest (but not on their own posts)
CREATE POLICY "Users can express interest in others' collabs"
ON collab_interests FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
);

-- Allow users to remove their own interest
CREATE POLICY "Users can remove own interest"
ON collab_interests FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- COLLAB_COLLABORATORS POLICIES
-- =====================================================

-- Allow public to view all collaborators (for transparency)
CREATE POLICY "Public can view all collaborators"
ON collab_collaborators FOR SELECT
USING (true);

-- Allow collab owners to add collaborators
CREATE POLICY "Collab owners can add collaborators"
ON collab_collaborators FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
    AND added_by = auth.uid()
);

-- Allow collab owners to update collaborator roles
CREATE POLICY "Collab owners can update collaborators"
ON collab_collaborators FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
);

-- Allow collab owners to remove collaborators
CREATE POLICY "Collab owners can remove collaborators"
ON collab_collaborators FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM collab_posts
        WHERE collab_posts.id = collab_id
        AND collab_posts.user_id = auth.uid()
    )
);

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify RLS policies were created
-- =====================================================

-- Check all policies for collab tables
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename LIKE 'collab_%'
-- ORDER BY tablename, policyname;

-- Count policies per table
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE tablename LIKE 'collab_%'
-- GROUP BY tablename
-- ORDER BY tablename;
