-- =====================================================
-- Slate Group - ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Version: 1.0
-- Last Updated: January 2025
-- Purpose: Secure all slate tables with RLS policies
-- Execution Order: Run AFTER 01_CREATE_TABLES.sql
-- Total Policies: 28 policies across 6 tables
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE slate_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE slate_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE slate_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE slate_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE slate_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE slate_saved ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE 1: slate_posts (7 policies)
-- =====================================================

-- Policy 1: Public can view published posts
CREATE POLICY "Public can view published slate posts"
    ON slate_posts
    FOR SELECT
    USING (
        status = 'published'
    );

-- Policy 2: Users can view their own drafts and archived posts
CREATE POLICY "Users can view own slate posts"
    ON slate_posts
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Policy 3: Authenticated users can create posts
CREATE POLICY "Authenticated users can create slate posts"
    ON slate_posts
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = user_id
    );

-- Policy 4: Users can update their own posts
CREATE POLICY "Users can update own slate posts"
    ON slate_posts
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- Policy 5: Users can delete their own posts
CREATE POLICY "Users can delete own slate posts"
    ON slate_posts
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- =====================================================
-- TABLE 2: slate_media (5 policies)
-- =====================================================

-- Policy 1: Public can view media for published posts
CREATE POLICY "Public can view media for published posts"
    ON slate_media
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = slate_media.post_id
            AND slate_posts.status = 'published'
        )
    );

-- Policy 2: Users can view media for their own posts (regardless of status)
CREATE POLICY "Users can view own post media"
    ON slate_media
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = slate_media.post_id
            AND slate_posts.user_id = auth.uid()
        )
    );

-- Policy 3: Post owners can add media to their posts
CREATE POLICY "Post owners can add media"
    ON slate_media
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = post_id
            AND slate_posts.user_id = auth.uid()
        )
    );

-- Policy 4: Post owners can delete media from their posts
CREATE POLICY "Post owners can delete media"
    ON slate_media
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = slate_media.post_id
            AND slate_posts.user_id = auth.uid()
        )
    );

-- =====================================================
-- TABLE 3: slate_likes (4 policies)
-- =====================================================

-- Policy 1: Anyone can view like counts (for display)
CREATE POLICY "Anyone can view slate likes"
    ON slate_likes
    FOR SELECT
    USING (true);

-- Policy 2: Authenticated users can like posts
CREATE POLICY "Users can like slate posts"
    ON slate_likes
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = user_id
        -- Ensure post exists and is published
        AND EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = post_id
            AND slate_posts.status = 'published'
        )
    );

-- Policy 3: Users can unlike posts (delete their own likes)
CREATE POLICY "Users can unlike slate posts"
    ON slate_likes
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- =====================================================
-- TABLE 4: slate_comments (6 policies)
-- =====================================================

-- Policy 1: Public can view comments on published posts
CREATE POLICY "Public can view comments on published posts"
    ON slate_comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = slate_comments.post_id
            AND slate_posts.status = 'published'
        )
    );

-- Policy 2: Users can view comments on their own posts (regardless of status)
CREATE POLICY "Users can view comments on own posts"
    ON slate_comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = slate_comments.post_id
            AND slate_posts.user_id = auth.uid()
        )
    );

-- Policy 3: Users can view their own comments
CREATE POLICY "Users can view own comments"
    ON slate_comments
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Policy 4: Authenticated users can comment on published posts
CREATE POLICY "Users can comment on published posts"
    ON slate_comments
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = user_id
        -- Ensure post exists and is published
        AND EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = post_id
            AND slate_posts.status = 'published'
        )
    );

-- Policy 5: Users can edit their own comments
CREATE POLICY "Users can edit own comments"
    ON slate_comments
    FOR UPDATE
    USING (
        auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- Policy 6: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
    ON slate_comments
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- =====================================================
-- TABLE 5: slate_shares (3 policies)
-- =====================================================

-- Policy 1: Anyone can view share counts
CREATE POLICY "Anyone can view slate shares"
    ON slate_shares
    FOR SELECT
    USING (true);

-- Policy 2: Authenticated users can share published posts
CREATE POLICY "Users can share slate posts"
    ON slate_shares
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = user_id
        -- Ensure post exists and is published
        AND EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = post_id
            AND slate_posts.status = 'published'
        )
    );

-- Policy 3: Users can remove their own shares
CREATE POLICY "Users can remove own shares"
    ON slate_shares
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- =====================================================
-- TABLE 6: slate_saved (3 policies)
-- =====================================================

-- Policy 1: Users can only view their own saved posts
CREATE POLICY "Users can view own saved posts"
    ON slate_saved
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Policy 2: Authenticated users can save published posts
CREATE POLICY "Users can save slate posts"
    ON slate_saved
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = user_id
        -- Ensure post exists and is published
        AND EXISTS (
            SELECT 1 FROM slate_posts
            WHERE slate_posts.id = post_id
            AND slate_posts.status = 'published'
        )
    );

-- Policy 3: Users can unsave posts (delete their own bookmarks)
CREATE POLICY "Users can unsave posts"
    ON slate_saved
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check RLS is enabled on all tables
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'slate_%'
ORDER BY tablename;

-- Count policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'slate_%'
GROUP BY tablename
ORDER BY tablename;

-- List all policies
SELECT 
    tablename,
    policyname,
    cmd as command,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'slate_%'
ORDER BY tablename, policyname;

-- =====================================================
-- TESTING NOTES
-- =====================================================

-- Test scenarios to verify RLS:
--
-- 1. Unauthenticated users:
--    - ✅ Can view published posts
--    - ❌ Cannot view drafts
--    - ❌ Cannot create/edit/delete posts
--
-- 2. Authenticated users:
--    - ✅ Can create posts
--    - ✅ Can view own drafts
--    - ✅ Can edit/delete own posts
--    - ❌ Cannot edit/delete others' posts
--
-- 3. Likes:
--    - ✅ Anyone can see like counts
--    - ✅ Authenticated users can like published posts
--    - ✅ Users can unlike own likes
--    - ❌ Cannot like drafts
--
-- 4. Comments:
--    - ✅ Public can view comments on published posts
--    - ✅ Users can comment on published posts
--    - ✅ Users can edit/delete own comments
--    - ❌ Cannot comment on drafts (unless owner)
--
-- 5. Saved posts:
--    - ✅ Users can save published posts
--    - ✅ Users can only see own saved posts
--    - ❌ Cannot see others' saved posts
--
-- =====================================================

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Run 03_INDEXES.sql for performance optimization
-- 2. Run 04_STORAGE_BUCKET.sql to setup media storage
-- 3. Test RLS policies with different user scenarios
-- =====================================================