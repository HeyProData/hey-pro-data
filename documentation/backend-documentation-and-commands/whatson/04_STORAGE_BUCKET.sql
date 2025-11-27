-- =============================================================================
-- What's On Feature - Storage Bucket Configuration
-- =============================================================================
-- This file contains SQL commands to create and configure the storage bucket
-- for What's On event images (thumbnails and hero images)
-- =============================================================================

-- Note: These commands should be executed in Supabase Dashboard SQL Editor
-- or via Supabase Storage API

-- =============================================================================
-- 1. Create Storage Bucket
-- =============================================================================

-- Create whatson-images bucket (public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'whatson-images',
    'whatson-images',
    true,  -- Public read access
    5242880,  -- 5 MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. Storage Policies for whatson-images bucket
-- =============================================================================

-- Policy 1: Public read access (anyone can view images)
CREATE POLICY "Public read access for whatson images"
ON storage.objects FOR SELECT
USING (bucket_id = 'whatson-images');

-- Policy 2: Authenticated users can upload to own folder
CREATE POLICY "Authenticated users can upload whatson images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'whatson-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update own images
CREATE POLICY "Users can update own whatson images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'whatson-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'whatson-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete own images
CREATE POLICY "Users can delete own whatson images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'whatson-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- Bucket Configuration Summary
-- =============================================================================

-- Bucket Name: whatson-images
-- Purpose: Store event thumbnails and hero images
-- Max File Size: 5 MB
-- Allowed Types: JPEG, JPG, PNG, WebP
-- Path Structure: {user_id}/{event_id}/{filename}
-- Example: 550e8400-e29b-41d4-a716-446655440000/abc123.../poster.jpg

-- Access Control:
-- - Public READ: Anyone can view images
-- - Authenticated WRITE: Users can upload to their own folder
-- - Owner UPDATE: Users can update their own images
-- - Owner DELETE: Users can delete their own images

-- =============================================================================
-- Verification Queries
-- =============================================================================

-- Check if bucket exists
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE id = 'whatson-images';

-- List storage policies for whatson-images
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     cmd as operation
-- FROM pg_policies
-- WHERE tablename = 'objects'
-- AND policyname LIKE '%whatson%'
-- ORDER BY policyname;

-- =============================================================================
-- Alternative: Using Supabase Dashboard
-- =============================================================================

-- If you prefer to create the bucket via Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New Bucket"
-- 3. Configure:
--    - Name: whatson-images
--    - Public: Yes (checked)
--    - File size limit: 5 MB
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
-- 4. Create bucket
-- 5. Then execute only the policy creation SQL above

-- =============================================================================
-- Usage in Application Code
-- =============================================================================

-- Upload image example:
-- const filePath = `${userId}/${eventId}/${file.name}`;
-- const { data, error } = await supabase.storage
--   .from('whatson-images')
--   .upload(filePath, file, {
--     cacheControl: '3600',
--     upsert: false
--   });

-- Get public URL:
-- const { data } = supabase.storage
--   .from('whatson-images')
--   .getPublicUrl(filePath);

-- Delete image:
-- const { error } = await supabase.storage
--   .from('whatson-images')
--   .remove([filePath]);
