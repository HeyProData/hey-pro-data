# Jobs Backend SQL Implementation Plan

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Match frontend jobs functionality with Supabase backend

---

## 📋 Executive Summary

This document provides step-by-step SQL commands to bridge the gap between the frontend jobs UI (app/(app)/jobs) and the Supabase backend. The frontend currently uses hardcoded data for both "Projects" and "GIGs", but the backend only has a `gigs` table.

### Key Findings:
1. ✅ Backend has comprehensive `gigs` table (v2.3) with most required fields
2. ❌ Frontend distinguishes between "Projects" and "GIGs" - backend needs support
3. ❌ Missing fields: company logo, project details object, terms & conditions
4. ❌ Skills array hardcoded in frontend - needs backend relationship
5. ✅ Timeline structure exists via `gig_dates` but needs enhancement
6. ✅ Locations structure exists via `gig_locations`

---

## 🎯 Implementation Strategy

We will NOT create a separate "projects" table because:
- The backend already has a sophisticated `gigs` table
- The `type` field can distinguish between "contract", "full-time", "part-time"
- Design projects (Table #35) serve a different purpose (creative portfolios)

Instead, we will:
1. **Enhance existing `gigs` table** with missing fields
2. **Create new junction tables** for skills and project phases
3. **Add RLS policies** for all new structures
4. **Add indexes** for performance

---

## 📊 Gap Analysis: Frontend vs Backend

### Jobs List Page (page.tsx)

| Frontend Field | Backend Field | Status | Action Required |
|----------------|---------------|--------|-----------------|
| id | id | ✅ Exists | None |
| title | title | ✅ Exists | None |
| description | description | ✅ Exists | None |
| datePosted | created_at | ✅ Exists | Format in API |
| location | gig_locations.location_name | ✅ Exists | Join required |
| type | type | ⚠️ Partial | Enhance values |

**Recommendation:** Use `gigs.type` field to distinguish "project" vs "gig" types. Add new enum values.

---

### GIG Details Page

| Frontend Field | Backend Field | Status | Action Required |
|----------------|---------------|--------|-----------------|
| name | company | ✅ Exists | None |
| title | title | ✅ Exists | None |
| logo | company_logo | ❌ Missing | ADD COLUMN |
| expiryDate | expiry_date | ✅ Exists | None |
| description | description | ✅ Exists | None |
| location | gig_locations (join) | ✅ Exists | Join required |
| requiredPositions | crew_count | ✅ Exists | None |
| date | created_at | ✅ Exists | Format in API |
| status | status | ⚠️ Partial | Update enum |
| postedfor | company | ✅ Exists | None |
| rate | amount + currency | ✅ Exists | Format in API |
| skills | ❌ No table | ❌ Missing | CREATE TABLE |
| projectTimeLine | gig_dates | ⚠️ Partial | ENHANCE TABLE |

**Key Actions:**
1. Add `company_logo` column to `gigs` table
2. Update `status` enum to include production phases
3. Create `gig_skills` junction table
4. Enhance `gig_dates` to support timeline phases

---

### PROJECT Details Page

| Frontend Field | Backend Field | Status | Action Required |
|----------------|---------------|--------|-----------------|
| name | company | ✅ Exists | None |
| title | title | ✅ Exists | None |
| logo | company_logo | ❌ Missing | ADD COLUMN |
| description | description | ✅ Exists | None |
| location | gig_locations | ✅ Exists | Join required |
| date | created_at | ✅ Exists | Format in API |
| status | status | ⚠️ Partial | Update enum |
| skills | ❌ No table | ❌ Missing | CREATE TABLE |
| projectDetails | ❌ No structure | ❌ Missing | CREATE TABLE |
| projectTimeLine | gig_dates | ⚠️ Partial | ENHANCE TABLE |
| terms&Conditions | terms_conditions | ❌ Missing | ADD COLUMN |
| location2 | gig_locations | ✅ Exists | Multiple rows |

**Key Actions:**
1. Add `company_logo` column to `gigs` table
2. Add `terms_conditions` column to `gigs` table
3. Update `status` enum values
4. Create `gig_skills` junction table
5. Create `gig_project_details` table for key-value pairs
6. Enhance `gig_dates` table structure

---

## 🔧 SQL Implementation Steps

### STEP 1: Enhance `gigs` Table - Add Missing Columns

**Purpose:** Add fields required by frontend that don't exist in current schema.

```sql
-- Add company logo field
ALTER TABLE gigs 
ADD COLUMN company_logo TEXT;

COMMENT ON COLUMN gigs.company_logo IS 'URL to company/project logo image';

-- Add terms and conditions field
ALTER TABLE gigs 
ADD COLUMN terms_conditions TEXT;

COMMENT ON COLUMN gigs.terms_conditions IS 'Terms, conditions, and return policy text';

-- Add project budget field (useful for project details)
ALTER TABLE gigs 
ADD COLUMN budget_amount INTEGER;

ALTER TABLE gigs 
ADD COLUMN budget_currency TEXT DEFAULT 'AED';

COMMENT ON COLUMN gigs.budget_amount IS 'Total project budget amount';
COMMENT ON COLUMN gigs.budget_currency IS 'Budget currency code (AED, USD, EUR, etc.)';
```

**RLS Policies:**
```sql
-- All users can view logo and terms (part of public gig info)
-- Existing SELECT policies on gigs table already cover this
-- No new policies needed for these columns
```

---

### STEP 2: Update `gigs.type` Enum Values

**Purpose:** Clearly distinguish between projects and gigs using the existing `type` field.

**Current values:** contract, full-time, part-time  
**New values needed:** project, gig

```sql
-- Note: PostgreSQL doesn't allow direct enum modification
-- We'll use TEXT type with CHECK constraint instead

-- First, verify current type column
-- If it's an enum, we need to alter it to TEXT

-- Check current constraint
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'gigs' AND con.conname LIKE '%type%';

-- If there's a CHECK constraint, drop it
ALTER TABLE gigs DROP CONSTRAINT IF EXISTS gigs_type_check;

-- Add new CHECK constraint with updated values
ALTER TABLE gigs 
ADD CONSTRAINT gigs_type_check 
CHECK (type IN (
    'contract', 
    'full-time', 
    'part-time', 
    'project',      -- New: For multi-phase projects
    'gig',          -- New: For single-engagement gigs
    'freelance',    -- Additional option
    'temporary'     -- Additional option
));

COMMENT ON COLUMN gigs.type IS 'GIG type: project (multi-phase), gig (single engagement), contract, full-time, part-time, freelance, temporary';
```

**RLS Policies:**
```sql
-- No new RLS policies needed - existing policies cover the type field
```

---

### STEP 3: Update `gigs.status` Enum Values

**Purpose:** Support production workflow phases shown in frontend.

**Current values:** active, closed, draft  
**New values needed:** Pre-Production, Production, Post-Production, etc.

```sql
-- Drop existing status constraint if exists
ALTER TABLE gigs DROP CONSTRAINT IF EXISTS gigs_status_check;

-- Add comprehensive status constraint
ALTER TABLE gigs 
ADD CONSTRAINT gigs_status_check 
CHECK (status IN (
    -- Original statuses
    'active',           -- Actively recruiting
    'closed',           -- No longer accepting applications
    'draft',            -- Not yet published
    
    -- Production workflow phases
    'pre-production',   -- Planning phase
    'production',       -- Active filming/production
    'post-production',  -- Editing and finishing
    'completed',        -- Project completed
    'on-hold',          -- Temporarily paused
    'cancelled'         -- Cancelled project
));

COMMENT ON COLUMN gigs.status IS 'Status: active (recruiting), closed, draft, pre-production, production, post-production, completed, on-hold, cancelled';
```

**RLS Policies:**
```sql
-- No new RLS policies needed - existing policies cover the status field
```

---

### STEP 4: Create `gig_skills` Junction Table

**Purpose:** Store required skills/roles for each gig (like "Producer", "Director", "Actor").

```sql
-- Create gig_skills table
CREATE TABLE IF NOT EXISTS gig_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level TEXT, -- Optional: 'required', 'preferred', 'nice-to-have'
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate skills per gig
    CONSTRAINT unique_gig_skill UNIQUE(gig_id, skill_name)
);

-- Add comments
COMMENT ON TABLE gig_skills IS 'Required skills and roles for gigs (Producer, Director, Camera Operator, etc.)';
COMMENT ON COLUMN gig_skills.skill_name IS 'Skill or role name (e.g., Producer, Director, Camera Operator)';
COMMENT ON COLUMN gig_skills.skill_level IS 'Skill importance: required, preferred, nice-to-have';
COMMENT ON COLUMN gig_skills.sort_order IS 'Display order for skills list';

-- Create indexes for performance
CREATE INDEX idx_gig_skills_gig_id ON gig_skills(gig_id);
CREATE INDEX idx_gig_skills_gig_sort ON gig_skills(gig_id, sort_order);
CREATE INDEX idx_gig_skills_name ON gig_skills(skill_name);
```

**RLS Policies:**
```sql
-- Enable RLS
ALTER TABLE gig_skills ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view skills for active/published gigs
CREATE POLICY "Public can view gig skills"
ON gig_skills FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
        AND gigs.status NOT IN ('draft')
    )
);

-- Policy 2: Gig creators can view skills for their own gigs (including drafts)
CREATE POLICY "Creators can view own gig skills"
ON gig_skills FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 3: Gig creators can insert skills for their own gigs
CREATE POLICY "Creators can add skills to own gigs"
ON gig_skills FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 4: Gig creators can update skills for their own gigs
CREATE POLICY "Creators can update own gig skills"
ON gig_skills FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 5: Gig creators can delete skills from their own gigs
CREATE POLICY "Creators can delete own gig skills"
ON gig_skills FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_skills.gig_id
        AND gigs.created_by = auth.uid()
    )
);
```

---

### STEP 5: Enhance `gig_dates` Table for Timeline Phases

**Purpose:** Support structured timeline phases like "Pre-Production: 2024-10-01 to 2024-11-01".

**Current structure:** month, days (e.g., "1-5, 10-15")  
**New structure:** Support named phases with date ranges

```sql
-- Add new columns to gig_dates table
ALTER TABLE gig_dates 
ADD COLUMN phase_name TEXT;

ALTER TABLE gig_dates 
ADD COLUMN start_date DATE;

ALTER TABLE gig_dates 
ADD COLUMN end_date DATE;

ALTER TABLE gig_dates 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Add constraint to ensure end_date is after start_date
ALTER TABLE gig_dates 
ADD CONSTRAINT gig_dates_valid_range 
CHECK (
    (start_date IS NULL AND end_date IS NULL) OR 
    (end_date IS NULL) OR 
    (end_date >= start_date)
);

-- Add comments
COMMENT ON COLUMN gig_dates.phase_name IS 'Timeline phase name (e.g., Pre-Production, Production, Post-Production, Release)';
COMMENT ON COLUMN gig_dates.start_date IS 'Phase start date';
COMMENT ON COLUMN gig_dates.end_date IS 'Phase end date';
COMMENT ON COLUMN gig_dates.sort_order IS 'Display order for timeline phases';

-- Update indexes
CREATE INDEX idx_gig_dates_gig_sort ON gig_dates(gig_id, sort_order);
CREATE INDEX idx_gig_dates_phase ON gig_dates(phase_name);
CREATE INDEX idx_gig_dates_date_range ON gig_dates(start_date, end_date);
```

**RLS Policies:**
```sql
-- Note: Existing RLS policies on gig_dates should cover these new columns
-- Verify existing policies allow public SELECT and creator INSERT/UPDATE/DELETE

-- Check existing policies
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
WHERE tablename = 'gig_dates';

-- If no policies exist, create them:

-- Enable RLS (if not already enabled)
ALTER TABLE gig_dates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view dates for published gigs
CREATE POLICY "Public can view gig dates"
ON gig_dates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.status NOT IN ('draft')
    )
);

-- Policy 2: Creators can view dates for their own gigs (including drafts)
CREATE POLICY "Creators can view own gig dates"
ON gig_dates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 3: Creators can insert dates for their own gigs
CREATE POLICY "Creators can add dates to own gigs"
ON gig_dates FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 4: Creators can update dates for their own gigs
CREATE POLICY "Creators can update own gig dates"
ON gig_dates FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 5: Creators can delete dates from their own gigs
CREATE POLICY "Creators can delete own gig dates"
ON gig_dates FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_dates.gig_id
        AND gigs.created_by = auth.uid()
    )
);
```

---

### STEP 6: Create `gig_project_details` Table

**Purpose:** Store key-value pairs for project-specific details (like "projectBudget", "projectDuration").

```sql
-- Create gig_project_details table
CREATE TABLE IF NOT EXISTS gig_project_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    detail_key TEXT NOT NULL,
    detail_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate keys per gig
    CONSTRAINT unique_gig_detail UNIQUE(gig_id, detail_key)
);

-- Add comments
COMMENT ON TABLE gig_project_details IS 'Project-specific details as key-value pairs (projectName, projectType, projectBudget, etc.)';
COMMENT ON COLUMN gig_project_details.detail_key IS 'Detail key (e.g., projectName, projectType, projectDuration, projectBudget)';
COMMENT ON COLUMN gig_project_details.detail_value IS 'Detail value (any text)';
COMMENT ON COLUMN gig_project_details.sort_order IS 'Display order for details';

-- Create indexes
CREATE INDEX idx_gig_project_details_gig_id ON gig_project_details(gig_id);
CREATE INDEX idx_gig_project_details_gig_sort ON gig_project_details(gig_id, sort_order);
CREATE INDEX idx_gig_project_details_key ON gig_project_details(detail_key);

-- Create trigger for updated_at
CREATE TRIGGER update_gig_project_details_updated_at
    BEFORE UPDATE ON gig_project_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: Ensure the trigger function exists
-- If not, create it:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**RLS Policies:**
```sql
-- Enable RLS
ALTER TABLE gig_project_details ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view details for published gigs
CREATE POLICY "Public can view gig project details"
ON gig_project_details FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
        AND gigs.status NOT IN ('draft')
    )
);

-- Policy 2: Creators can view details for their own gigs (including drafts)
CREATE POLICY "Creators can view own gig project details"
ON gig_project_details FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 3: Creators can insert details for their own gigs
CREATE POLICY "Creators can add details to own gigs"
ON gig_project_details FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 4: Creators can update details for their own gigs
CREATE POLICY "Creators can update own gig project details"
ON gig_project_details FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
        AND gigs.created_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_id
        AND gigs.created_by = auth.uid()
    )
);

-- Policy 5: Creators can delete details from their own gigs
CREATE POLICY "Creators can delete own gig project details"
ON gig_project_details FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM gigs
        WHERE gigs.id = gig_project_details.gig_id
        AND gigs.created_by = auth.uid()
    )
);
```

---

### STEP 7: Create Indexes for Existing Tables

**Purpose:** Ensure optimal query performance for jobs listing and filtering.

```sql
-- Additional indexes for gigs table (if not already exist)
CREATE INDEX IF NOT EXISTS idx_gigs_company ON gigs(company);
CREATE INDEX IF NOT EXISTS idx_gigs_created_at ON gigs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gigs_type_status ON gigs(type, status);

-- Index for company logo (for faster filtering)
CREATE INDEX IF NOT EXISTS idx_gigs_company_logo ON gigs(company_logo) WHERE company_logo IS NOT NULL;

-- Composite index for jobs listing query
CREATE INDEX IF NOT EXISTS idx_gigs_list_query 
ON gigs(type, status, created_at DESC) 
WHERE status NOT IN ('draft', 'cancelled');

-- Full-text search index on title and description (if not exists)
CREATE INDEX IF NOT EXISTS idx_gigs_search 
ON gigs USING gin(to_tsvector('english', title || ' ' || description));
```

---

## 🔄 Migration Order

Execute SQL commands in this exact order to avoid dependency issues:

1. ✅ **STEP 1**: Enhance `gigs` table (add columns)
2. ✅ **STEP 2**: Update `gigs.type` enum/constraint
3. ✅ **STEP 3**: Update `gigs.status` enum/constraint
4. ✅ **STEP 4**: Create `gig_skills` table + RLS policies
5. ✅ **STEP 5**: Enhance `gig_dates` table + RLS policies
6. ✅ **STEP 6**: Create `gig_project_details` table + RLS policies
7. ✅ **STEP 7**: Create performance indexes

---

## 📋 Post-Migration Checklist

After running all SQL commands:

- [ ] Verify all new tables exist
- [ ] Verify all new columns exist on `gigs` table
- [ ] Test RLS policies for each table (SELECT, INSERT, UPDATE, DELETE)
- [ ] Verify indexes are created
- [ ] Test sample data insertion
- [ ] Run EXPLAIN ANALYZE on common queries
- [ ] Update API endpoints to use new structure
- [ ] Update frontend to call real API instead of hardcoded data

---

## 🧪 Sample Data for Testing

```sql
-- Insert a sample project
INSERT INTO gigs (
    title,
    description,
    company,
    company_logo,
    type,
    status,
    amount,
    currency,
    crew_count,
    expiry_date,
    terms_conditions,
    created_by
) VALUES (
    'Film: NIGHTHAWK',
    'Behind-the-scenes documentary capturing the energy and creativity of Dubai Fashion Week 2024. We need a skilled team to document designers, models, and the fashion industry magic.',
    'MARVEL STUDIOS',
    '/logo.png',
    'project',
    'pre-production',
    2000,
    'AED',
    5,
    '2024-10-15',
    'We stand behind our products with a comprehensive 30-day return policy. If you''re not completely satisfied, simply return the item in its original condition.',
    auth.uid()
) RETURNING id;

-- Use the returned ID to insert related data
-- Replace {gig_id} with actual UUID from above

-- Insert skills
INSERT INTO gig_skills (gig_id, skill_name, skill_level, sort_order) VALUES
({gig_id}, 'Producer', 'required', 1),
({gig_id}, 'Director', 'required', 2),
({gig_id}, 'Actor', 'preferred', 3),
({gig_id}, 'Production Assistant', 'nice-to-have', 4);

-- Insert timeline phases
INSERT INTO gig_dates (gig_id, phase_name, start_date, end_date, sort_order) VALUES
({gig_id}, 'Pre-Production', '2024-10-01', '2024-11-01', 1),
({gig_id}, 'Production', '2024-11-02', '2025-01-15', 2),
({gig_id}, 'Post-Production', '2025-01-16', '2025-02-28', 3),
({gig_id}, 'Release', '2025-03-15', '2025-03-15', 4);

-- Insert project details
INSERT INTO gig_project_details (gig_id, detail_key, detail_value, sort_order) VALUES
({gig_id}, 'projectName', 'NIGHTHAWK', 1),
({gig_id}, 'projectType', 'Film', 2),
({gig_id}, 'projectDuration', '3 months', 3),
({gig_id}, 'projectBudget', '$500,000', 4),
({gig_id}, 'projectLocation', 'Dubai Design District +2', 5),
({gig_id}, 'projectDescription', 'A thrilling short film set in a dystopian future where technology and humanity collide.', 6);

-- Insert locations
INSERT INTO gig_locations (gig_id, location_name) VALUES
({gig_id}, 'Dubai Design District'),
({gig_id}, 'Los Angeles, CA'),
({gig_id}, 'Dubai, UAE');
```

---

## 📊 Updated Database Schema Summary

### New/Modified Tables

1. **gigs** (Modified - 6 new columns)
   - `company_logo` (TEXT)
   - `terms_conditions` (TEXT)
   - `budget_amount` (INTEGER)
   - `budget_currency` (TEXT)
   - Updated `type` constraint
   - Updated `status` constraint

2. **gig_skills** (New table)
   - `id`, `gig_id`, `skill_name`, `skill_level`, `sort_order`, `created_at`
   - 5 RLS policies
   - 3 indexes

3. **gig_dates** (Enhanced - 4 new columns)
   - `phase_name` (TEXT)
   - `start_date` (DATE)
   - `end_date` (DATE)
   - `sort_order` (INTEGER)
   - 5 RLS policies (verify/create)
   - 3 new indexes

4. **gig_project_details** (New table)
   - `id`, `gig_id`, `detail_key`, `detail_value`, `sort_order`, `created_at`, `updated_at`
   - 5 RLS policies
   - 3 indexes

### Total New Database Objects
- **Tables:** 2 new, 2 enhanced
- **Columns:** 10 new columns across 2 tables
- **RLS Policies:** 15 new policies
- **Indexes:** 12 new indexes
- **Constraints:** 2 updated, 3 new

---

## 🎯 Frontend Integration Notes

After implementing these SQL changes, the frontend needs to:

1. **Replace hardcoded data** with API calls to `/api/gigs`
2. **Map backend fields** to frontend expectations:
   - `created_at` → `datePosted`
   - `crew_count` → `requiredPositions`
   - `company` → `name` and `postedfor`
   - `company_logo` → `logo`
   - Join `gig_locations` → `location` (with count suffix)
   - Join `gig_skills` → `skills` array
   - Join `gig_dates` (with phase_name) → `projectTimeLine` object
   - Join `gig_project_details` → `projectDetails` object
   
3. **Filter by type** to show "projects" vs "gigs"
4. **Handle production phases** in status display

---

## ✅ Validation Queries

Run these queries after migration to verify everything works:

```sql
-- Check new columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'gigs' 
AND column_name IN ('company_logo', 'terms_conditions', 'budget_amount', 'budget_currency');

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('gig_skills', 'gig_project_details');

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('gigs', 'gig_skills', 'gig_dates', 'gig_project_details');

-- Count RLS policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('gigs', 'gig_skills', 'gig_dates', 'gig_project_details')
GROUP BY tablename;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('gigs', 'gig_skills', 'gig_dates', 'gig_project_details')
ORDER BY tablename, indexname;

-- Test full query with all joins
SELECT 
    g.id,
    g.title,
    g.description,
    g.company,
    g.company_logo,
    g.type,
    g.status,
    g.amount,
    g.currency,
    g.crew_count,
    g.expiry_date,
    g.terms_conditions,
    g.created_at,
    
    -- Aggregate skills
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'skill_name', gs.skill_name,
            'skill_level', gs.skill_level
        ) ORDER BY gs.sort_order) FILTER (WHERE gs.id IS NOT NULL),
        '[]'::json
    ) as skills,
    
    -- Aggregate locations
    COALESCE(
        json_agg(DISTINCT gl.location_name) FILTER (WHERE gl.id IS NOT NULL),
        '[]'::json
    ) as locations,
    
    -- Aggregate timeline
    COALESCE(
        json_agg(DISTINCT jsonb_build_object(
            'phase', gd.phase_name,
            'start_date', gd.start_date,
            'end_date', gd.end_date
        ) ORDER BY gd.sort_order) FILTER (WHERE gd.id IS NOT NULL),
        '[]'::json
    ) as timeline,
    
    -- Aggregate project details
    COALESCE(
        json_object_agg(
            gpd.detail_key, 
            gpd.detail_value
        ) FILTER (WHERE gpd.id IS NOT NULL),
        '{}'::json
    ) as project_details
    
FROM gigs g
LEFT JOIN gig_skills gs ON g.id = gs.gig_id
LEFT JOIN gig_locations gl ON g.id = gl.gig_id
LEFT JOIN gig_dates gd ON g.id = gd.gig_id
LEFT JOIN gig_project_details gpd ON g.id = gpd.gig_id
WHERE g.status NOT IN ('draft', 'cancelled')
GROUP BY g.id
ORDER BY g.created_at DESC
LIMIT 10;
```

---

## 📝 Notes

1. **Backward Compatibility:** All changes are additive (new columns/tables) or enhanced (new enum values). Existing data and queries remain functional.

2. **Performance:** All junction tables have proper indexes. Aggregation queries should perform well with <1000 gigs.

3. **Flexibility:** Using `gig_project_details` as key-value pairs allows frontend to add new detail fields without schema changes.

4. **Type Safety:** The `type` field clearly distinguishes between "project" (multi-phase, complex) and "gig" (single engagement, simple).

5. **Security:** All new tables have comprehensive RLS policies matching the pattern of existing tables.

---

**End of Implementation Plan**
