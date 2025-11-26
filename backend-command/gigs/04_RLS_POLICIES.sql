-- =====================================================
-- GIGS BACKEND: ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Purpose: Add RLS policies for new columns and gig_references table
-- Execute Order: 4th (after indexes)
-- Created: January 2025

-- =====================================================
-- ENABLE RLS ON TABLES
-- =====================================================

-- Enable RLS on gigs table (if not already enabled)
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on gig_references table
ALTER TABLE gig_references ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR gigs TABLE
-- =====================================================

-- Note: Existing policies for gigs table should remain intact.
-- This section documents the expected policies and adds any missing ones.

-- POLICY 1: Public can view active, non-expired gigs
DROP POLICY IF EXISTS "Public can view active gigs" ON gigs;
CREATE POLICY "Public can view active gigs"
  ON gigs
  FOR SELECT
  USING (
    status = 'active'
    AND (expiry_date IS NULL OR expiry_date > NOW())
  );

-- POLICY 2: Users can view their own gigs (any status)
DROP POLICY IF EXISTS "Users can view own gigs" ON gigs;
CREATE POLICY "Users can view own gigs"
  ON gigs
  FOR SELECT
  USING (auth.uid() = created_by);

-- POLICY 3: Authenticated users can create gigs
DROP POLICY IF EXISTS "Authenticated users can create gigs" ON gigs;
CREATE POLICY "Authenticated users can create gigs"
  ON gigs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- POLICY 4: Users can update their own gigs
DROP POLICY IF EXISTS "Users can update own gigs" ON gigs;
CREATE POLICY "Users can update own gigs"
  ON gigs
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- POLICY 5: Users can delete their own gigs
DROP POLICY IF EXISTS "Users can delete own gigs" ON gigs;
CREATE POLICY "Users can delete own gigs"
  ON gigs
  FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- RLS POLICIES FOR gig_references TABLE
-- =====================================================

-- POLICY 1: Public can view references for active gigs
DROP POLICY IF EXISTS "Public can view references for active gigs" ON gig_references;
CREATE POLICY "Public can view references for active gigs"
  ON gig_references
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = gig_references.gig_id
      AND gigs.status = 'active'
      AND (gigs.expiry_date IS NULL OR gigs.expiry_date > NOW())
    )
  );

-- POLICY 2: Users can view references for their own gigs
DROP POLICY IF EXISTS "Users can view own gig references" ON gig_references;
CREATE POLICY "Users can view own gig references"
  ON gig_references
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = gig_references.gig_id
      AND gigs.created_by = auth.uid()
    )
  );

-- POLICY 3: Users can add references to their own gigs
DROP POLICY IF EXISTS "Users can add references to own gigs" ON gig_references;
CREATE POLICY "Users can add references to own gigs"
  ON gig_references
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = gig_references.gig_id
      AND gigs.created_by = auth.uid()
    )
  );

-- POLICY 4: Users can update references for their own gigs
DROP POLICY IF EXISTS "Users can update own gig references" ON gig_references;
CREATE POLICY "Users can update own gig references"
  ON gig_references
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = gig_references.gig_id
      AND gigs.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = gig_references.gig_id
      AND gigs.created_by = auth.uid()
    )
  );

-- POLICY 5: Users can delete references from their own gigs
DROP POLICY IF EXISTS "Users can delete own gig references" ON gig_references;
CREATE POLICY "Users can delete own gig references"
  ON gig_references
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gigs
      WHERE gigs.id = gig_references.gig_id
      AND gigs.created_by = auth.uid()
    )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- List all policies on gigs table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'gigs'
ORDER BY policyname;

-- List all policies on gig_references table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'gig_references'
ORDER BY policyname;

-- =====================================================
-- SECURITY TESTING QUERIES
-- =====================================================

/*
-- Test 1: Public user can only see active, non-expired gigs
-- (Run as unauthenticated user or with SET ROLE)
SELECT COUNT(*) FROM gigs;
-- Should only return active gigs with expiry_date > NOW()

-- Test 2: User can see their own gigs (including drafts)
SET request.jwt.claim.sub = 'your-user-id-here';
SELECT * FROM gigs WHERE created_by = 'your-user-id-here';
-- Should return all gigs created by this user

-- Test 3: User cannot see other users' draft gigs
SET request.jwt.claim.sub = 'your-user-id-here';
SELECT * FROM gigs WHERE created_by != 'your-user-id-here' AND status = 'draft';
-- Should return empty result

-- Test 4: Public can view references for active gigs
SELECT * FROM gig_references
WHERE gig_id IN (
  SELECT id FROM gigs WHERE status = 'active' AND expiry_date > NOW()
);
-- Should return references for active gigs

-- Test 5: User can add references to own gigs
SET request.jwt.claim.sub = 'your-user-id-here';
INSERT INTO gig_references (gig_id, label, url, type)
VALUES ('your-gig-id-here', 'Test.pdf', 'https://example.com/test.pdf', 'file');
-- Should succeed if user owns the gig

-- Test 6: User cannot add references to other users' gigs
SET request.jwt.claim.sub = 'different-user-id';
INSERT INTO gig_references (gig_id, label, url, type)
VALUES ('your-gig-id-here', 'Test.pdf', 'https://example.com/test.pdf', 'file');
-- Should fail with RLS violation
*/

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================

/*
-- To drop all policies on gigs table:
DROP POLICY IF EXISTS "Public can view active gigs" ON gigs;
DROP POLICY IF EXISTS "Users can view own gigs" ON gigs;
DROP POLICY IF EXISTS "Authenticated users can create gigs" ON gigs;
DROP POLICY IF EXISTS "Users can update own gigs" ON gigs;
DROP POLICY IF EXISTS "Users can delete own gigs" ON gigs;

-- To drop all policies on gig_references table:
DROP POLICY IF EXISTS "Public can view references for active gigs" ON gig_references;
DROP POLICY IF EXISTS "Users can view own gig references" ON gig_references;
DROP POLICY IF EXISTS "Users can add references to own gigs" ON gig_references;
DROP POLICY IF EXISTS "Users can update own gig references" ON gig_references;
DROP POLICY IF EXISTS "Users can delete own gig references" ON gig_references;

-- To disable RLS:
ALTER TABLE gigs DISABLE ROW LEVEL SECURITY;
ALTER TABLE gig_references DISABLE ROW LEVEL SECURITY;
*/

-- =====================================================
-- NOTES
-- =====================================================

/*
1. RLS POLICY HIERARCHY:
   - Public users: Can only view active, non-expired gigs and their references
   - Authenticated users: Can view own gigs (any status) + create new gigs
   - Gig owners: Full CRUD on own gigs and references

2. SECURITY CONSIDERATIONS:
   - Draft gigs are private (only owner can see)
   - Expired gigs are hidden from public view
   - References inherit visibility from parent gig
   - ON DELETE CASCADE ensures orphaned references are cleaned up

3. PERFORMANCE IMPACT:
   - RLS policies add WHERE clauses to queries
   - Indexes on created_by, status, expiry_date improve performance
   - Subquery in references policy is efficient due to FK index

4. ADMIN ACCESS:
   - Service role bypasses RLS (use with caution)
   - Add admin policies if needed: WHERE user_id IN (SELECT id FROM admin_users)

5. COMMON PITFALLS:
   - Always test policies as different user roles
   - Remember that USING clause applies to SELECT/UPDATE/DELETE
   - WITH CHECK clause applies to INSERT/UPDATE
   - Policies are OR-ed together (if any policy passes, access is granted)

6. FUTURE ENHANCEMENTS:
   - Consider adding policy for gig collaborators (if collaboration feature added)
   - Add policy for moderators to view/edit any gig
   - Add policy for archived gigs (soft delete)
*/
