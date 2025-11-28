-- =====================================================
-- DESIGN PROJECTS FEATURE - TABLE CREATION
-- =====================================================
-- Version: 1.0
-- Created: January 2025
-- Purpose: Create database tables for Design Projects feature
-- 
-- This file creates 5 core tables:
-- 1. design_projects (main table)
-- 2. project_tags (categorization)
-- 3. project_team (team members)
-- 4. project_files (file attachments)
-- 5. project_links (external resources)
-- =====================================================

-- =====================================================
-- TABLE 1: design_projects (Main Projects Table)
-- =====================================================
-- Purpose: Store core design project information
-- Relationships: 1:N with tags, team, files, links
-- Owner: Project creator (user_id)
-- =====================================================

CREATE TABLE IF NOT EXISTS design_projects (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Owner Information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Project Information
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 10000),
    
    -- Project Classification
    project_type TEXT DEFAULT 'other' CHECK (project_type IN (
        'commercial', 
        'film', 
        'tv', 
        'social', 
        'digital', 
        'documentary', 
        'music_video', 
        'animation',
        'photography',
        'branding',
        'web_design',
        'app_design',
        'other'
    )),
    
    -- Project Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',        -- Initial creation, not visible to others
        'active',       -- Actively working on it
        'in_progress',  -- Same as active (alias)
        'on_hold',      -- Temporarily paused
        'completed',    -- Finished successfully
        'archived',     -- Completed and archived
        'cancelled'     -- Project cancelled
    )),
    
    -- Timeline Information
    start_date DATE,
    end_date DATE,
    estimated_duration INTEGER CHECK (estimated_duration > 0), -- in days
    
    -- Budget Information (Optional)
    budget_amount INTEGER CHECK (budget_amount >= 0),
    budget_currency TEXT DEFAULT 'AED' CHECK (budget_currency IN (
        'AED', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR'
    )),
    
    -- Location Information
    location TEXT, -- City, Country or venue name
    is_remote BOOLEAN DEFAULT false,
    
    -- Visual Assets
    thumbnail_url TEXT, -- Card/preview image (Supabase Storage URL)
    hero_image_url TEXT, -- Detail page banner image (Supabase Storage URL)
    
    -- Privacy & Visibility
    privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN (
        'public',      -- Visible to everyone
        'private',     -- Only owner can see
        'team_only'    -- Only team members can see
    )),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (
        end_date IS NULL OR start_date IS NULL OR end_date >= start_date
    )
);

-- Add comments for documentation
COMMENT ON TABLE design_projects IS 'Main table for design projects - user-created creative work containers';
COMMENT ON COLUMN design_projects.slug IS 'URL-friendly identifier generated from title';
COMMENT ON COLUMN design_projects.privacy IS 'Controls who can view the project';
COMMENT ON COLUMN design_projects.project_type IS 'Type/category of creative project';
COMMENT ON COLUMN design_projects.status IS 'Current project status/lifecycle stage';


-- =====================================================
-- TABLE 2: project_tags (Project Categorization)
-- =====================================================
-- Purpose: Tags for organizing and discovering projects
-- Relationship: Many tags per project
-- =====================================================

CREATE TABLE IF NOT EXISTS project_tags (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    project_id UUID NOT NULL REFERENCES design_projects(id) ON DELETE CASCADE,
    
    -- Tag Information
    tag_name TEXT NOT NULL CHECK (char_length(tag_name) >= 1 AND char_length(tag_name) <= 50),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_project_tag UNIQUE (project_id, tag_name)
);

-- Add comments
COMMENT ON TABLE project_tags IS 'Tags for categorizing and searching design projects';
COMMENT ON COLUMN project_tags.tag_name IS 'Tag label (1-50 characters)';


-- =====================================================
-- TABLE 3: project_team (Team Members)
-- =====================================================
-- Purpose: Manage team members and their roles in projects
-- Relationship: Many team members per project
-- =====================================================

CREATE TABLE IF NOT EXISTS project_team (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    project_id UUID NOT NULL REFERENCES design_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Team Member Information
    role TEXT, -- Director, Designer, Editor, Producer, etc.
    department TEXT, -- Creative, Technical, Marketing, Production, etc.
    
    -- Access Control
    permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN (
        'view',        -- Can only view project
        'contribute',  -- Can view and edit content
        'admin'        -- Can manage team and project settings
    )),
    
    -- Metadata
    added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

-- Add comments
COMMENT ON TABLE project_team IS 'Team members assigned to design projects with roles and permissions';
COMMENT ON COLUMN project_team.role IS 'Professional role in the project (e.g., Director, Designer)';
COMMENT ON COLUMN project_team.department IS 'Department or area (e.g., Creative, Technical)';
COMMENT ON COLUMN project_team.permission IS 'Access level: view, contribute, or admin';


-- =====================================================
-- TABLE 4: project_files (File Attachments)
-- =====================================================
-- Purpose: Store references to uploaded project files
-- Relationship: Many files per project
-- =====================================================

CREATE TABLE IF NOT EXISTS project_files (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    project_id UUID NOT NULL REFERENCES design_projects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- File Information
    file_name TEXT NOT NULL CHECK (char_length(file_name) >= 1 AND char_length(file_name) <= 255),
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_type TEXT NOT NULL CHECK (file_type IN (
        'document',  -- PDF, DOC, DOCX, TXT
        'image',     -- JPEG, PNG, WebP
        'video',     -- MP4, MOV, AVI
        'audio',     -- MP3, WAV
        'archive',   -- ZIP, RAR
        'other'      -- Miscellaneous
    )),
    file_size INTEGER NOT NULL CHECK (file_size > 0), -- in bytes
    description TEXT CHECK (char_length(description) <= 500),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size <= 20971520) -- Max 20MB
);

-- Add comments
COMMENT ON TABLE project_files IS 'File attachments for design projects (stored in Supabase Storage)';
COMMENT ON COLUMN project_files.file_url IS 'Full URL to file in project-assets bucket';
COMMENT ON COLUMN project_files.file_type IS 'File category for filtering and display';
COMMENT ON COLUMN project_files.file_size IS 'File size in bytes (max 20MB)';


-- =====================================================
-- TABLE 5: project_links (External Resources)
-- =====================================================
-- Purpose: Store links to external resources and references
-- Relationship: Many links per project
-- =====================================================

CREATE TABLE IF NOT EXISTS project_links (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    project_id UUID NOT NULL REFERENCES design_projects(id) ON DELETE CASCADE,
    
    -- Link Information
    label TEXT NOT NULL CHECK (char_length(label) >= 1 AND char_length(label) <= 100),
    url TEXT NOT NULL CHECK (char_length(url) >= 1 AND char_length(url) <= 2000),
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE project_links IS 'External links and references for design projects';
COMMENT ON COLUMN project_links.label IS 'Display name for the link';
COMMENT ON COLUMN project_links.url IS 'Full URL to external resource';
COMMENT ON COLUMN project_links.sort_order IS 'Display order (lower numbers first)';


-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================
-- Purpose: Automatically update the updated_at column when a row is modified
-- =====================================================

CREATE OR REPLACE FUNCTION update_design_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_design_projects_updated_at
    BEFORE UPDATE ON design_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_design_projects_updated_at();

COMMENT ON FUNCTION update_design_projects_updated_at() IS 'Auto-updates updated_at timestamp on design_projects table modifications';


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify successful table creation
-- =====================================================

-- Check if all tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'design_projects',
    'project_tags', 
    'project_team',
    'project_files',
    'project_links'
)
ORDER BY table_name;

-- Check table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'design_projects',
    'project_tags',
    'project_team', 
    'project_files',
    'project_links'
)
ORDER BY table_name, ordinal_position;

-- Check constraints
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid::regclass::text IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files', 
    'project_links'
)
ORDER BY table_name, constraint_name;


-- =====================================================
-- END OF TABLE CREATION SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Execute this script in Supabase SQL Editor
-- 2. Verify all 5 tables are created successfully
-- 3. Proceed to 02_RLS_POLICIES.sql to set up security
-- =====================================================
