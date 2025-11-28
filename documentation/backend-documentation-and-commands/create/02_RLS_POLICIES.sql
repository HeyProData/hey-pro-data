-- =====================================================
-- DESIGN PROJECTS FEATURE - ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Version: 1.0
-- Created: January 2025
-- Purpose: Implement security policies for Design Projects
--
-- Security Model:
-- - Public projects: Anyone can view
-- - Private projects: Only owner can view/edit
-- - Team-only projects: Owner + team members can view
-- - Only owner can create/update/delete projects
-- - Team members can be managed by owner or admins
-- - Files can be uploaded by team members with contribute/admin permission
-- =====================================================

-- =====================================================
-- STEP 1: Enable RLS on all tables
-- =====================================================

ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- TABLE 1: design_projects POLICIES (7 policies)
-- =====================================================

-- Policy 1.1: Public can view public projects
CREATE POLICY "public_can_view_public_projects"
ON design_projects FOR SELECT
USING (privacy = 'public' AND status != 'draft');

-- Policy 1.2: Users can view their own projects (all privacy levels)
CREATE POLICY "users_can_view_own_projects"
ON design_projects FOR SELECT
USING (auth.uid() = user_id);

-- Policy 1.3: Team members can view team-only projects
CREATE POLICY "team_can_view_team_projects"
ON design_projects FOR SELECT
USING (
    privacy = 'team_only' 
    AND status != 'draft'
    AND (
        auth.uid() = user_id -- Owner
        OR EXISTS (
            SELECT 1 FROM project_team
            WHERE project_team.project_id = design_projects.id
            AND project_team.user_id = auth.uid()
        )
    )
);

-- Policy 1.4: Authenticated users can create projects
CREATE POLICY "authenticated_can_create_projects"
ON design_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 1.5: Only owner can update their projects
CREATE POLICY "owner_can_update_project"
ON design_projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 1.6: Only owner can delete their projects
CREATE POLICY "owner_can_delete_project"
ON design_projects FOR DELETE
USING (auth.uid() = user_id);

-- Policy 1.7: Admins can update projects they're admin of
CREATE POLICY "admins_can_update_project"
ON design_projects FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = design_projects.id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = design_projects.id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'admin'
    )
);


-- =====================================================
-- TABLE 2: project_tags POLICIES (5 policies)
-- =====================================================

-- Policy 2.1: Public can view tags of public projects
CREATE POLICY "public_can_view_public_project_tags"
ON project_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_tags.project_id
        AND design_projects.privacy = 'public'
        AND design_projects.status != 'draft'
    )
);

-- Policy 2.2: Users can view tags of their own projects
CREATE POLICY "users_can_view_own_project_tags"
ON project_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_tags.project_id
        AND design_projects.user_id = auth.uid()
    )
);

-- Policy 2.3: Team members can view tags of team projects
CREATE POLICY "team_can_view_team_project_tags"
ON project_tags FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects dp
        WHERE dp.id = project_tags.project_id
        AND dp.privacy = 'team_only'
        AND (
            dp.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM project_team pt
                WHERE pt.project_id = dp.id
                AND pt.user_id = auth.uid()
            )
        )
    )
);

-- Policy 2.4: Project owner can manage tags
CREATE POLICY "owner_can_manage_tags"
ON project_tags FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_tags.project_id
        AND design_projects.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_tags.project_id
        AND design_projects.user_id = auth.uid()
    )
);

-- Policy 2.5: Admins can manage tags
CREATE POLICY "admins_can_manage_tags"
ON project_tags FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_tags.project_id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_tags.project_id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'admin'
    )
);


-- =====================================================
-- TABLE 3: project_team POLICIES (6 policies)
-- =====================================================

-- Policy 3.1: Public can view team of public projects
CREATE POLICY "public_can_view_public_project_team"
ON project_team FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_team.project_id
        AND design_projects.privacy = 'public'
        AND design_projects.status != 'draft'
    )
);

-- Policy 3.2: Users can view team of their own projects
CREATE POLICY "users_can_view_own_project_team"
ON project_team FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_team.project_id
        AND design_projects.user_id = auth.uid()
    )
);

-- Policy 3.3: Team members can view team of team projects
CREATE POLICY "team_can_view_team_members"
ON project_team FOR SELECT
USING (
    project_team.user_id = auth.uid() -- Can see own membership
    OR EXISTS (
        SELECT 1 FROM design_projects dp
        WHERE dp.id = project_team.project_id
        AND (
            dp.user_id = auth.uid() -- Owner
            OR EXISTS (
                SELECT 1 FROM project_team pt2
                WHERE pt2.project_id = dp.id
                AND pt2.user_id = auth.uid()
            )
        )
    )
);

-- Policy 3.4: Project owner can add team members
CREATE POLICY "owner_can_add_team_members"
ON project_team FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_team.project_id
        AND design_projects.user_id = auth.uid()
    )
    AND added_by = auth.uid()
);

-- Policy 3.5: Admins can add team members
CREATE POLICY "admins_can_add_team_members"
ON project_team FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_team pt
        WHERE pt.project_id = project_team.project_id
        AND pt.user_id = auth.uid()
        AND pt.permission = 'admin'
    )
    AND added_by = auth.uid()
);

-- Policy 3.6: Owner and admins can update team members
CREATE POLICY "owner_admins_can_update_team"
ON project_team FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_team.project_id
        AND design_projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_team pt
        WHERE pt.project_id = project_team.project_id
        AND pt.user_id = auth.uid()
        AND pt.permission = 'admin'
    )
);

-- Policy 3.7: Owner and admins can remove team members
CREATE POLICY "owner_admins_can_remove_team"
ON project_team FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_team.project_id
        AND design_projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_team pt
        WHERE pt.project_id = project_team.project_id
        AND pt.user_id = auth.uid()
        AND pt.permission = 'admin'
    )
);


-- =====================================================
-- TABLE 4: project_files POLICIES (6 policies)
-- =====================================================

-- Policy 4.1: Public can view files of public projects
CREATE POLICY "public_can_view_public_project_files"
ON project_files FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_files.project_id
        AND design_projects.privacy = 'public'
        AND design_projects.status != 'draft'
    )
);

-- Policy 4.2: Users can view files of their own projects
CREATE POLICY "users_can_view_own_project_files"
ON project_files FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_files.project_id
        AND design_projects.user_id = auth.uid()
    )
);

-- Policy 4.3: Team members can view files
CREATE POLICY "team_can_view_project_files"
ON project_files FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_files.project_id
        AND project_team.user_id = auth.uid()
    )
);

-- Policy 4.4: Contributors and admins can upload files
CREATE POLICY "contributors_can_upload_files"
ON project_files FOR INSERT
WITH CHECK (
    uploaded_by = auth.uid()
    AND (
        EXISTS (
            SELECT 1 FROM design_projects
            WHERE design_projects.id = project_files.project_id
            AND design_projects.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM project_team
            WHERE project_team.project_id = project_files.project_id
            AND project_team.user_id = auth.uid()
            AND project_team.permission IN ('contribute', 'admin')
        )
    )
);

-- Policy 4.5: File uploader can delete their own files
CREATE POLICY "uploader_can_delete_own_files"
ON project_files FOR DELETE
USING (uploaded_by = auth.uid());

-- Policy 4.6: Owner and admins can delete any files
CREATE POLICY "owner_admins_can_delete_files"
ON project_files FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_files.project_id
        AND design_projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_files.project_id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'admin'
    )
);


-- =====================================================
-- TABLE 5: project_links POLICIES (5 policies)
-- =====================================================

-- Policy 5.1: Public can view links of public projects
CREATE POLICY "public_can_view_public_project_links"
ON project_links FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_links.project_id
        AND design_projects.privacy = 'public'
        AND design_projects.status != 'draft'
    )
);

-- Policy 5.2: Users can view links of their own projects
CREATE POLICY "users_can_view_own_project_links"
ON project_links FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_links.project_id
        AND design_projects.user_id = auth.uid()
    )
);

-- Policy 5.3: Team members can view links
CREATE POLICY "team_can_view_project_links"
ON project_links FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_links.project_id
        AND project_team.user_id = auth.uid()
    )
);

-- Policy 5.4: Owner and admins can manage links
CREATE POLICY "owner_admins_can_manage_links"
ON project_links FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_links.project_id
        AND design_projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_links.project_id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM design_projects
        WHERE design_projects.id = project_links.project_id
        AND design_projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_links.project_id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'admin'
    )
);

-- Policy 5.5: Contributors can add links
CREATE POLICY "contributors_can_add_links"
ON project_links FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_team
        WHERE project_team.project_id = project_links.project_id
        AND project_team.user_id = auth.uid()
        AND project_team.permission = 'contribute'
    )
);


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS policies are correctly applied
-- =====================================================

-- Count policies per table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
GROUP BY schemaname, tablename
ORDER BY tablename;

-- List all policies with details
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
ORDER BY tablename, policyname;

-- Verify RLS is enabled on all tables
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
);


-- =====================================================
-- POLICY SUMMARY
-- =====================================================
-- Total: 34 policies across 5 tables
--
-- design_projects: 7 policies
--   - 3 SELECT (public, own, team)
--   - 1 INSERT (authenticated)
--   - 2 UPDATE (owner, admins)
--   - 1 DELETE (owner)
--
-- project_tags: 5 policies
--   - 3 SELECT (public, own, team)
--   - 2 ALL (owner, admins)
--
-- project_team: 7 policies
--   - 3 SELECT (public, own, team)
--   - 2 INSERT (owner, admins)
--   - 1 UPDATE (owner/admins)
--   - 1 DELETE (owner/admins)
--
-- project_files: 6 policies
--   - 3 SELECT (public, own, team)
--   - 1 INSERT (contributors)
--   - 2 DELETE (uploader, owner/admins)
--
-- project_links: 5 policies
--   - 3 SELECT (public, own, team)
--   - 1 ALL (owner/admins)
--   - 1 INSERT (contributors)
-- =====================================================

-- =====================================================
-- END OF RLS POLICIES SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Execute this script in Supabase SQL Editor
-- 2. Verify all policies are created (should see 34 total)
-- 3. Test policies by querying tables as different users
-- 4. Proceed to 03_INDEXES.sql for performance optimization
-- =====================================================
