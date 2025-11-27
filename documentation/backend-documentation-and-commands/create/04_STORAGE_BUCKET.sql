-- =====================================================
-- DESIGN PROJECTS FEATURE - STORAGE BUCKET SETUP
-- =====================================================
-- Version: 1.0
-- Created: January 2025
-- Purpose: Create and configure storage bucket for project assets
--
-- Bucket: project-assets
-- Purpose: Store project images, thumbnails, hero images, and files
-- Access: Mixed (public read for public projects, private for private projects)
-- Max File Size: 20 MB
-- =====================================================

-- =====================================================
-- STEP 1: Create Storage Bucket
-- =====================================================
-- Note: This is usually done via Supabase Dashboard → Storage
-- But can also be done via SQL

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-assets',
    'project-assets',
    true, -- Public read access (controlled by policies)
    20971520, -- 20 MB in bytes
    ARRAY[
        -- Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        -- Videos
        'video/mp4',
        'video/quicktime', -- .mov
        'video/x-msvideo', -- .avi
        -- Documents
        'application/pdf',
        'application/msword', -- .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
        'text/plain',
        -- Archives
        'application/zip',
        'application/x-zip-compressed',
        -- Audio (optional)
        'audio/mpeg', -- .mp3
        'audio/wav'
    ]
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration';


-- =====================================================
-- STEP 2: Storage Policies for project-assets bucket
-- =====================================================

-- Policy 2.1: Public can view files from public projects
CREATE POLICY "public_can_view_public_project_assets"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-assets'
    AND (
        -- Allow if path pattern matches public project
        -- Path structure: {user_id}/{project_id}/{filename}
        EXISTS (
            SELECT 1 FROM design_projects
            WHERE design_projects.id::text = split_part(storage.objects.name, '/', 2)
            AND design_projects.privacy = 'public'
            AND design_projects.status != 'draft'
        )
    )
);

-- Policy 2.2: Users can view their own project assets
CREATE POLICY "users_can_view_own_project_assets"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-assets'
    AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
);

-- Policy 2.3: Team members can view team project assets
CREATE POLICY "team_can_view_project_assets"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-assets'
    AND EXISTS (
        SELECT 1 FROM project_team pt
        JOIN design_projects dp ON dp.id = pt.project_id
        WHERE dp.id::text = split_part(storage.objects.name, '/', 2)
        AND pt.user_id = auth.uid()
    )
);

-- Policy 2.4: Authenticated users can upload to their own folder
CREATE POLICY "authenticated_can_upload_project_assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-assets'
    AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
);

-- Policy 2.5: Users can update their own project assets
CREATE POLICY "users_can_update_own_project_assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'project-assets'
    AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
)
WITH CHECK (
    bucket_id = 'project-assets'
    AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
);

-- Policy 2.6: Users can delete their own project assets
CREATE POLICY "users_can_delete_own_project_assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'project-assets'
    AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
);

-- Policy 2.7: Team members with contribute/admin can upload files
CREATE POLICY "team_can_upload_project_assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-assets'
    AND EXISTS (
        SELECT 1 FROM project_team pt
        WHERE pt.project_id::text = split_part(storage.objects.name, '/', 2)
        AND pt.user_id = auth.uid()
        AND pt.permission IN ('contribute', 'admin')
    )
);


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    pg_size_pretty(file_size_limit::bigint) as max_file_size,
    array_length(allowed_mime_types, 1) as allowed_types_count
FROM storage.buckets
WHERE id = 'project-assets';

-- List allowed MIME types
SELECT 
    id,
    name,
    unnest(allowed_mime_types) as mime_type
FROM storage.buckets
WHERE id = 'project-assets';

-- List storage policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%project_assets%'
ORDER BY policyname;

-- Check storage bucket size and file count
SELECT 
    bucket_id,
    COUNT(*) as file_count,
    pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects
WHERE bucket_id = 'project-assets'
GROUP BY bucket_id;


-- =====================================================
-- BUCKET CONFIGURATION SUMMARY
-- =====================================================
-- Bucket Name: project-assets
-- Public Access: Yes (controlled by RLS policies)
-- Max File Size: 20 MB (20,971,520 bytes)
-- Allowed Types:
--   - Images: JPEG, PNG, WebP, GIF
--   - Videos: MP4, MOV, AVI
--   - Documents: PDF, DOC, DOCX, TXT
--   - Archives: ZIP
--   - Audio: MP3, WAV
--
-- Path Structure:
--   {user_id}/{project_id}/{filename}
--   Example: 123e4567-e89b-12d3-a456-426614174000/
--            550e8400-e29b-41d4-a716-446655440000/
--            hero-image.jpg
--
-- Storage Policies: 7 policies
--   1. Public view (public projects)
--   2. Owner view (all own files)
--   3. Team view (team projects)
--   4. Owner upload (own folder)
--   5. Owner update (own files)
--   6. Owner delete (own files)
--   7. Team upload (contribute/admin)
-- =====================================================


-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Upload a project thumbnail
-- Path: {user_id}/{project_id}/thumbnail.jpg
-- POST /storage/v1/object/project-assets/{user_id}/{project_id}/thumbnail.jpg
-- Body: Binary file data
-- Result: https://[project-url].supabase.co/storage/v1/object/public/project-assets/{user_id}/{project_id}/thumbnail.jpg

-- Example 2: Upload a project file (by team member)
-- Path: {user_id}/{project_id}/files/design-brief.pdf
-- POST /storage/v1/object/project-assets/{user_id}/{project_id}/files/design-brief.pdf
-- Body: Binary file data
-- Requires: User must be team member with contribute or admin permission

-- Example 3: Delete a file
-- DELETE /storage/v1/object/project-assets/{user_id}/{project_id}/old-file.jpg
-- Requires: User must be file owner

-- Example 4: List files in a project folder
-- GET /storage/v1/object/list/project-assets/{user_id}/{project_id}
-- Returns: Array of file objects with metadata


-- =====================================================
-- FOLDER STRUCTURE RECOMMENDATIONS
-- =====================================================
--
-- Recommended folder organization:
--
-- project-assets/
-- └── {user_id}/
--     └── {project_id}/
--         ├── thumbnail.jpg          (Project card image)
--         ├── hero-image.jpg         (Detail page banner)
--         ├── gallery/               (Project gallery images)
--         │   ├── image-1.jpg
--         │   ├── image-2.jpg
--         │   └── video-1.mp4
--         ├── files/                 (Project documents)
--         │   ├── brief.pdf
--         │   ├── contract.pdf
--         │   └── notes.txt
--         └── assets/                (Design assets)
--             ├── logo.png
--             └── mockup.jpg
--
-- This structure helps:
-- - Organize files by purpose
-- - Easy cleanup when project deleted (CASCADE)
-- - Clear access control based on path
-- - Better file management in UI
-- =====================================================


-- =====================================================
-- END OF STORAGE BUCKET SETUP
-- =====================================================
-- Next Steps:
-- 1. Execute this script in Supabase SQL Editor
-- 2. Verify bucket is created with correct settings
-- 3. Test upload/download with different user roles
-- 4. Proceed to implementation of API endpoints
-- =====================================================