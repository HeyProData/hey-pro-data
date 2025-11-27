-- =====================================================
-- GIGS BACKEND: CREATE NEW TABLES
-- =====================================================
-- Purpose: Create new tables for gig references
-- Execute Order: 2nd (after ALTER statements)
-- Created: January 2025

-- =====================================================
-- 1. CREATE gig_references TABLE
-- =====================================================

-- Drop table if exists (for clean installation)
DROP TABLE IF EXISTS gig_references CASCADE;

-- Create gig_references table
CREATE TABLE gig_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'link')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE gig_references IS 'Supporting references for gigs (files and links)';

-- Add column comments
COMMENT ON COLUMN gig_references.id IS 'Unique identifier for reference';
COMMENT ON COLUMN gig_references.gig_id IS 'Foreign key to gigs table';
COMMENT ON COLUMN gig_references.label IS 'Display name for reference (e.g., "Document.pdf", "www.somewebsite.com")';
COMMENT ON COLUMN gig_references.url IS 'Full URL to file or external link';
COMMENT ON COLUMN gig_references.type IS 'Type of reference: "file" (uploaded to storage) or "link" (external URL)';
COMMENT ON COLUMN gig_references.created_at IS 'Timestamp when reference was added';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table was created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'gig_references';

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'gig_references'
ORDER BY ordinal_position;

-- Verify foreign key constraint
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'gig_references';

-- Verify CHECK constraint
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = connamespace
WHERE rel.relname = 'gig_references'
AND con.contype = 'c';

-- =====================================================
-- SAMPLE DATA INSERT (for testing)
-- =====================================================

/*
-- Example: Insert references for a gig
-- Replace 'your-gig-id-here' with an actual gig ID from your database

INSERT INTO gig_references (gig_id, label, url, type) VALUES
  ('your-gig-id-here', 'Document.pdf', 'https://project.supabase.co/storage/v1/object/public/portfolios/user123/document.pdf', 'file'),
  ('your-gig-id-here', 'www.somewebsite.com/Document', 'https://somewebsite.com/Document', 'link'),
  ('your-gig-id-here', 'Shotlist.pdf', 'https://project.supabase.co/storage/v1/object/public/portfolios/user123/shotlist.pdf', 'file');

-- Verify insert
SELECT * FROM gig_references WHERE gig_id = 'your-gig-id-here';
*/

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================

/*
-- To rollback:
DROP TABLE IF EXISTS gig_references CASCADE;
*/

-- =====================================================
-- NOTES
-- =====================================================

/*
1. ON DELETE CASCADE ensures references are automatically deleted when a gig is deleted

2. The 'type' field distinguishes between:
   - 'file': URLs pointing to Supabase Storage (or any file storage)
   - 'link': External URLs to websites, Google Drive, etc.

3. Frontend uses this to determine icon display:
   - 'file' → Show file icon (Paperclip, FileText)
   - 'link' → Show link icon (ExternalLink)

4. The 'label' field is what users see in the UI:
   - For files: "Document.pdf", "Shotlist.pdf"
   - For links: "www.somewebsite.com", "Drive folder"

5. Multiple references per gig are supported (one-to-many relationship)

6. Consider adding a sort_order column if order matters:
   ALTER TABLE gig_references ADD COLUMN sort_order INTEGER DEFAULT 0;
*/
