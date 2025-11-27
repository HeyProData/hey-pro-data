-- =====================================================
-- COLLAB FEATURE - STORAGE BUCKET CONFIGURATION
-- =====================================================
-- This file contains SQL commands to create and configure
-- the storage bucket for collab cover images
--
-- Execution Order: Run this file AFTER 03_INDEXES.sql
-- Prerequisites: Supabase Storage must be enabled
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKET
-- =====================================================

-- Note: Run this in Supabase Dashboard SQL Editor or via API
-- Supabase uses a special function for bucket creation

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'collab-covers',
    'collab-covers',
    true,  -- Public bucket (anyone can read)
    5242880,  -- 5 MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png']  -- Allowed file types
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';

-- =====================================================
-- STORAGE POLICIES FOR COLLAB-COVERS BUCKET
-- =====================================================

-- Policy 1: Public can view/download cover images
CREATE POLICY "Public can view collab cover images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'collab-covers'
);

-- Policy 2: Authenticated users can upload cover images to their own folder
CREATE POLICY "Users can upload own collab cover images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'collab-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own cover images
CREATE POLICY "Users can update own collab cover images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'collab-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'collab-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own cover images
CREATE POLICY "Users can delete own collab cover images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'collab-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- PATH STRUCTURE DOCUMENTATION
-- =====================================================

-- File Path Format: {user_id}/{collab_id}/{filename}
-- Example: 550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000/cover.jpg
--
-- Benefits:
-- 1. Easy to identify file owner
-- 2. Easy to organize by collab
-- 3. RLS policies can check user_id in path
-- 4. Easy cleanup when user/collab is deleted

-- =====================================================
-- STORAGE HELPER FUNCTIONS (Optional)
-- =====================================================

-- Function to generate storage path for collab cover
CREATE OR REPLACE FUNCTION generate_collab_cover_path(
    p_user_id UUID,
    p_collab_id UUID,
    p_filename TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN p_user_id::text || '/' || p_collab_id::text || '/' || p_filename;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_collab_cover_path IS 'Generates standardized storage path for collab cover images';

-- Function to get public URL for collab cover
CREATE OR REPLACE FUNCTION get_collab_cover_url(
    p_storage_path TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_supabase_url TEXT;
BEGIN
    -- Get Supabase URL from environment or configuration
    -- This is a placeholder - actual implementation depends on your setup
    v_supabase_url := current_setting('app.supabase_url', true);
    
    IF v_supabase_url IS NULL THEN
        -- Fallback if setting not configured
        RETURN 'https://your-project.supabase.co/storage/v1/object/public/collab-covers/' || p_storage_path;
    ELSE
        RETURN v_supabase_url || '/storage/v1/object/public/collab-covers/' || p_storage_path;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_collab_cover_url IS 'Generates public URL for accessing collab cover images';

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify storage setup
-- =====================================================

-- Check if bucket exists
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE id = 'collab-covers';

-- Check storage policies
-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'storage'
-- AND tablename = 'objects'
-- AND policyname LIKE '%collab%';

-- =====================================================
-- ALTERNATIVE: Create bucket via Supabase Dashboard
-- =====================================================

-- If SQL insert fails, create bucket via Dashboard:
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: collab-covers
-- 4. Public bucket: YES
-- 5. File size limit: 5 MB
-- 6. Allowed MIME types: image/jpeg, image/jpg, image/png
-- 7. Then run the policy creation SQL above
