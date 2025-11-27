-- =====================================================
-- Slate Group - STORAGE BUCKET SETUP
-- =====================================================
-- Version: 1.0
-- Last Updated: January 2025
-- Purpose: Create and configure storage bucket for slate media
-- Execution Order: Run AFTER 01_CREATE_TABLES.sql, 02_RLS_POLICIES.sql, 03_INDEXES.sql
-- =====================================================

-- Note: These commands are for Supabase Storage setup
-- Execute these via Supabase Dashboard or Supabase CLI

-- =====================================================
-- CREATE STORAGE BUCKET
-- =====================================================

-- Create the slate-media bucket (public read access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'slate-media',
    'slate-media',
    true,  -- Public read access
    10485760,  -- 10 MB max file size
    ARRAY[
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Policy 1: Public can view all files (for published posts)
CREATE POLICY "Public can view slate media"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'slate-media'
    );

-- Policy 2: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload slate media to own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'slate-media'
        AND auth.uid() IS NOT NULL
        -- Path must start with user's ID
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy 3: Users can update files in their own folder
CREATE POLICY "Users can update own slate media"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'slate-media'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'slate-media'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy 4: Users can delete files from their own folder
CREATE POLICY "Users can delete own slate media"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'slate-media'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- =====================================================
-- BUCKET CONFIGURATION DETAILS
-- =====================================================

/*

BUCKET: slate-media

PURPOSE:
Store images and videos for slate posts (social media-style posts)

SPECIFICATIONS:
- Access: Public (read) / Authenticated (write to own folder)
- Max File Size: 10 MB
- Allowed Types: 
  * Images: JPEG, JPG, PNG, WebP
  * Videos: MP4, MOV, AVI

PATH STRUCTURE:
{user_id}/{post_id}/{filename}

Example:
123e4567-e89b-12d3-a456-426614174000/
  └─ 550e8400-e29b-41d4-a716-446655440000/
      ├─ image1.jpg
      ├─ image2.png
      └─ video1.mp4

USAGE:
- slate_media.media_url stores full public URL
- Example URL: https://your-project.supabase.co/storage/v1/object/public/slate-media/{user_id}/{post_id}/{filename}

ACCESS CONTROL:
- ✅ Anyone can VIEW files (public bucket)
- ✅ Authenticated users can UPLOAD to own folder
- ✅ Users can UPDATE/DELETE own files
- ❌ Users cannot access other users' folders

VALIDATION:
- File size: Enforced by bucket (10 MB limit)
- MIME types: Enforced by bucket (images + videos only)
- Path ownership: Enforced by RLS policies

*/

-- =====================================================
-- ALTERNATIVE: Supabase Dashboard Setup
-- =====================================================

/*

If you prefer to use Supabase Dashboard:

1. Go to: Storage > Create new bucket

2. Settings:
   - Name: slate-media
   - Public bucket: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types:
     * image/jpeg
     * image/jpg  
     * image/png
     * image/webp
     * video/mp4
     * video/quicktime
     * video/x-msvideo

3. Policies:
   - Click "New Policy" for each policy above
   - Use the SQL from the STORAGE POLICIES section

*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'slate-media';

-- Check storage policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%slate%'
ORDER BY policyname;

-- Count files in bucket (after some uploads)
-- SELECT 
--     COUNT(*) as total_files,
--     SUM(metadata->>'size')::bigint as total_size_bytes,
--     pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size_human
-- FROM storage.objects
-- WHERE bucket_id = 'slate-media';

-- =====================================================
-- TESTING NOTES
-- =====================================================

/*

TEST SCENARIOS:

1. Upload Test (Authenticated User):
   - Upload image to: {user_id}/{post_id}/test.jpg
   - ✅ Should succeed
   - Upload to: {other_user_id}/{post_id}/test.jpg
   - ❌ Should fail (not own folder)

2. Public Access Test (Unauthenticated):
   - Access URL: https://.../slate-media/{user_id}/{post_id}/test.jpg
   - ✅ Should display image

3. File Size Test:
   - Upload 5 MB image: ✅ Should succeed
   - Upload 15 MB image: ❌ Should fail (exceeds limit)

4. MIME Type Test:
   - Upload .jpg: ✅ Should succeed
   - Upload .png: ✅ Should succeed
   - Upload .mp4: ✅ Should succeed
   - Upload .pdf: ❌ Should fail (not allowed)

5. Delete Test:
   - Delete own file: ✅ Should succeed
   - Delete other's file: ❌ Should fail

*/

-- =====================================================
-- INTEGRATION WITH SLATE TABLES
-- =====================================================

/*

HOW TO USE:

1. User uploads media via API:
   POST /api/upload/slate-media
   - File: multipart/form-data
   - Returns: { url: "https://..." }

2. Create post with media:
   POST /api/slate
   Body: {
     content: "My post",
     status: "published"
   }
   Returns: { post_id: "..." }

3. Attach media to post:
   INSERT INTO slate_media:
   - post_id: from step 2
   - media_url: from step 1
   - media_type: "image" or "video"

4. Display post:
   GET /api/slate/[id]
   Returns: {
     ...post data,
     media: [{ url: "https://...", type: "image" }]
   }

*/

-- =====================================================
-- CLEANUP / MAINTENANCE
-- =====================================================

/*

CLEANUP ORPHANED FILES:

Files in storage but no record in slate_media:

SELECT 
    bucket_id,
    name as file_path,
    created_at
FROM storage.objects
WHERE bucket_id = 'slate-media'
AND name NOT IN (
    SELECT SUBSTRING(media_url FROM 'slate-media/(.*)') 
    FROM slate_media
    WHERE media_url LIKE '%slate-media%'
);

To delete orphaned files:
-- Be careful with this!
-- DELETE FROM storage.objects
-- WHERE id IN (SELECT id FROM above query);

*/

-- =====================================================
-- MONITORING
-- =====================================================

/*

MONITOR STORAGE USAGE:

SELECT 
    (storage.foldername(name))[1] as user_id,
    COUNT(*) as file_count,
    SUM((metadata->>'size')::bigint) as total_bytes,
    pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
WHERE bucket_id = 'slate-media'
GROUP BY (storage.foldername(name))[1]
ORDER BY total_bytes DESC
LIMIT 10;

*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Verify bucket was created successfully
-- 2. Test upload with authenticated user
-- 3. Test public access to uploaded files
-- 4. Implement POST /api/upload/slate-media endpoint
-- 5. Integrate with frontend image upload component
-- =====================================================