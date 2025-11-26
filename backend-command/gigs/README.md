# Gigs Backend Implementation

**Status:** ⌛ Ready for Implementation  
**Created:** January 2025  
**Version:** 1.0

---

## 📋 Overview

This directory contains a complete, step-by-step guide to implement the gigs backend architecture that matches the frontend UI in `app/(app)/(gigs)`. All SQL scripts and documentation are ready to execute.

---

## 📁 Files in This Directory

### 📊 Analysis & Planning

**00_FRONTEND_ANALYSIS.md**
- Comprehensive analysis of hardcoded UI data in gigs frontend
- Complete data structures with TypeScript interfaces
- Gap analysis: missing backend fields vs frontend needs
- Data flow diagrams and examples
- **READ THIS FIRST** to understand requirements

### 🛠️ SQL Scripts (Execute in Order)

**01_ALTER_STATEMENTS.sql** ➡️ Execute 1st
- Adds 11 new columns to `gigs` table
- Changes `crew_availability.is_available` to `status` enum
- Migrates existing data safely
- Includes rollback instructions

**02_CREATE_TABLES.sql** ➡️ Execute 2nd
- Creates `gig_references` table for file/link references
- Sets up foreign keys and constraints
- Includes sample data for testing

**03_INDEXES.sql** ➡️ Execute 3rd
- Creates 14+ performance indexes
- Adds full-text search on title + description
- Optimizes query performance
- Includes verification queries

**04_RLS_POLICIES.sql** ➡️ Execute 4th
- Updates RLS policies for gigs table
- Creates RLS policies for gig_references table
- Ensures proper access control
- Includes security testing queries

### 📚 Implementation Guide

**05_IMPLEMENTATION_GUIDE.md**
- Step-by-step implementation plan (5 phases)
- API endpoint specifications with request/response examples
- Frontend integration instructions
- Testing procedures
- Troubleshooting guide
- Time estimates: 11-17 hours total

---

## 🚀 Quick Start

### Prerequisites

1. Supabase project set up
2. Existing backend v2.2 deployed (see `UPDATED_BACKEND_ARCHITECTURE.md`)
3. SQL access (Supabase SQL Editor or psql)
4. Node.js backend environment ready

### Step 1: Read the Analysis

```bash
Read: backend-command/gigs/00_FRONTEND_ANALYSIS.md
```

Understand:
- What data the frontend needs
- What's missing in the backend
- How the pieces fit together

### Step 2: Execute SQL Scripts

**In Supabase SQL Editor:**

```sql
-- 1. Backup existing data
CREATE TABLE gigs_backup AS SELECT * FROM gigs;

-- 2. Execute ALTER statements
-- Paste content from: 01_ALTER_STATEMENTS.sql

-- 3. Create new tables
-- Paste content from: 02_CREATE_TABLES.sql

-- 4. Create indexes
-- Paste content from: 03_INDEXES.sql

-- 5. Apply RLS policies
-- Paste content from: 04_RLS_POLICIES.sql
```

### Step 3: Verify Database Changes

```sql
-- Check new columns in gigs table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gigs'
AND column_name IN (
  'slug', 'crew_count', 'role', 'type', 'department',
  'company', 'is_tbc', 'request_quote', 'expiry_date'
);
-- Should return 9 rows

-- Check new table
SELECT table_name FROM information_schema.tables
WHERE table_name = 'gig_references';
-- Should return 1 row

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'gigs'
AND indexname LIKE 'idx_gigs_%';
-- Should return multiple indexes
```

### Step 4: Implement API Endpoints

Follow **05_IMPLEMENTATION_GUIDE.md** Phase 2:

1. Update POST /api/gigs
2. Update GET /api/gigs
3. Create GET /api/gigs/slug/[slug]
4. Update PATCH /api/gigs/[id]
5. Update GET /api/gigs/[id]/applications
6. Create GET /api/gigs/[id]/availability
7. Create POST /api/upload/gig-reference

### Step 5: Integrate Frontend

Follow **05_IMPLEMENTATION_GUIDE.md** Phase 3:

1. Update /gigs page
2. Update /gigs/[slug] page
3. Update /gigs/manage-gigs/add-new page
4. Update manage-gigs tabs

### Step 6: Test

Follow **05_IMPLEMENTATION_GUIDE.md** Phase 4:

1. Database testing
2. API testing (curl/Postman)
3. Frontend testing (manual)

---

## 📋 What Gets Implemented

### Database Changes

#### New Columns in `gigs` table (11 total):
- `slug` (TEXT, UNIQUE) - URL-friendly identifier
- `crew_count` (INTEGER) - Number of crew needed
- `role` (TEXT) - GIG role (director, editor, etc.)
- `type` (TEXT) - GIG type (contract, full-time, part-time)
- `department` (TEXT) - Department/specialty
- `company` (TEXT) - Production company
- `is_tbc` (BOOLEAN) - "To Be Confirmed" flag
- `request_quote` (BOOLEAN) - Request quote instead of fixed rate
- `expiry_date` (TIMESTAMPTZ) - Application deadline
- `supporting_file_label` (TEXT) - Reference file label
- `reference_url` (TEXT) - Reference link URL

#### Updated `crew_availability` table:
- Changed `is_available` (BOOLEAN) → `status` (TEXT enum)
- Values: `'available'` | `'hold'` | `'na'`

#### New Table: `gig_references`
- `id` (UUID, PK)
- `gig_id` (FK → gigs)
- `label` (TEXT) - Display name
- `url` (TEXT) - File/link URL
- `type` (TEXT) - 'file' | 'link'
- `created_at` (TIMESTAMPTZ)

#### New Indexes (14+ total):
- `idx_gigs_slug` - Slug lookups
- `idx_gigs_role` - Filter by role
- `idx_gigs_type` - Filter by type
- `idx_gigs_department` - Filter by department
- `idx_gigs_expiry_date` - Filter expired gigs
- `idx_gigs_status_expiry` - Active gigs query
- `idx_gigs_search` - Full-text search (GIN index)
- ... and more

#### RLS Policies (10 total):
- 5 policies on `gigs` table
- 5 policies on `gig_references` table

### API Endpoints

#### New/Updated Endpoints (8 total):
1. **POST /api/gigs** - Create gig with new fields
2. **GET /api/gigs** - List gigs with filtering/search
3. **GET /api/gigs/slug/[slug]** - Get gig by slug (NEW)
4. **PATCH /api/gigs/[id]** - Update gig
5. **DELETE /api/gigs/[id]** - Delete gig
6. **GET /api/gigs/[id]/applications** - Get applications with applicant data
7. **GET /api/gigs/[id]/availability** - Get availability calendar (NEW)
8. **POST /api/upload/gig-reference** - Upload reference file (NEW)

### Frontend Pages Updated

1. **`/gigs`** - Browse gigs (fetch from API)
2. **`/gigs/[slug]`** - Gig details (fetch by slug)
3. **`/gigs/manage-gigs/add-new`** - Create gig (submit to API)
4. **`/gigs/manage-gigs`** - Manage dashboard (all tabs fetch from API)

---

## 📊 Data Flow Examples

### Creating a Gig

```
👥 User → Fill form in /gigs/manage-gigs/add-new
   ↓
📷 Upload reference file → POST /api/upload/gig-reference
   ↓
📤 Submit form → POST /api/gigs
   ↓
💾 Backend inserts:
   - gigs table (with slug)
   - gig_dates table (from dateWindows)
   - gig_locations table (from locations)
   - gig_references table (from references)
   ↓
✅ Returns complete gig object with slug
   ↓
🔀 Frontend redirects to /gigs/[slug]
```

### Viewing Gig Details

```
👥 User → Click gig card in /gigs
   ↓
🔗 Navigate to /gigs/[slug]
   ↓
📡 Frontend → GET /api/gigs/slug/[slug]
   ↓
💾 Backend queries:
   - gigs table (WHERE slug = $1)
   - JOIN user_profiles (for postedBy data)
   - Fetch gig_dates (ORDER BY month)
   - Fetch gig_locations
   - Fetch gig_references
   - Transform dates → calendarMonths format
   ↓
📦 Returns complete gig object
   ↓
🎨 Frontend renders:
   - Gig details
   - Calendar with highlighted days
   - References (files/links)
   - Apply button
```

### Managing Applications

```
👥 User (Gig Creator) → /gigs/manage-gigs
   ↓
☑️ Select gig from "Gigs" tab
   ↓
📝 Switch to "Application" tab
   ↓
📡 Frontend → GET /api/gigs/[id]/applications
   ↓
💾 Backend queries:
   - applications table (WHERE gig_id = $1)
   - JOIN user_profiles (for applicant data)
   - JOIN applicant_skills (for skills array)
   - COUNT referrals
   ↓
📦 Returns applicants array with full data
   ↓
📊 Frontend renders applications table:
   - Name, city, avatar
   - Skills, credits, referrals
   - Action buttons (Release, Shortlist, Confirm)
```

---

## ✅ Success Criteria

### Database
- ✅ All 11 new columns added to `gigs` table
- ✅ `crew_availability.status` column with enum constraint
- ✅ `gig_references` table created with FK constraints
- ✅ 14+ indexes created for performance
- ✅ 10 RLS policies active and tested
- ✅ No data loss in existing records

### API
- ✅ All 8 endpoints implemented and tested
- ✅ Request/response formats match documentation
- ✅ Auth validation works correctly
- ✅ RLS policies enforced
- ✅ Error handling returns proper messages

### Frontend
- ✅ All 4 gigs pages fetch from API
- ✅ No hardcoded data remains
- ✅ Loading states implemented
- ✅ Error handling implemented
- ✅ Forms submit successfully
- ✅ Data persists after refresh

---

## 🛠️ Troubleshooting

### Common Issues

#### Issue: "column does not exist"
**Solution:** Execute ALTER statements first (01_ALTER_STATEMENTS.sql)

#### Issue: "relation gig_references does not exist"
**Solution:** Execute CREATE statements (02_CREATE_TABLES.sql)

#### Issue: Slow query performance
**Solution:** Execute INDEXES script (03_INDEXES.sql) and verify with:
```sql
EXPLAIN ANALYZE SELECT * FROM gigs WHERE status = 'active';
```

#### Issue: RLS policy violation
**Solution:** 
1. Check `created_by` field matches `auth.uid()`
2. Verify RLS policies are applied (04_RLS_POLICIES.sql)
3. Test with: `SELECT * FROM pg_policies WHERE tablename = 'gigs';`

#### Issue: Slug conflicts
**Solution:** Append timestamp to slug if duplicate detected
```javascript
let slug = generateSlug(title);
if (await slugExists(slug)) {
  slug = `${slug}-${Date.now()}`;
}
```

---

## 📚 Additional Resources

### Related Documentation

- **Main Architecture:** `/backend-command/UPDATED_BACKEND_ARCHITECTURE.md`
- **Collab Feature:** `/backend-command/collab/README.md`
- **Explore Feature:** `/backend-command/explore/01_EXPLORE_BACKEND_IMPLEMENTATION_PLAN.md`
- **Profile Schema:** `/backend-command/profile/README.md`

### External Links

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📅 Version History

### v1.0 (January 2025)
- Initial release
- Complete analysis of frontend requirements
- All SQL scripts ready
- Implementation guide complete
- Documentation finalized

---

## 👥 Need Help?

1. **Check the docs:** Review `00_FRONTEND_ANALYSIS.md` and `05_IMPLEMENTATION_GUIDE.md`
2. **Run verification queries:** Each SQL file has verification section
3. **Check troubleshooting:** See common issues section above
4. **Review architecture:** See `UPDATED_BACKEND_ARCHITECTURE.md` for context

---

## ⏱️ Time Estimate

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1: Database | Execute 4 SQL files + verify | 1-2 hours |
| Phase 2: API | Implement 8 endpoints | 4-6 hours |
| Phase 3: Frontend | Update 4 pages | 3-4 hours |
| Phase 4: Testing | Database + API + Frontend | 2-3 hours |
| Phase 5: Polish | Optimization + fixes | 1-2 hours |
| **TOTAL** | | **11-17 hours** |

---

**Status:** ⌛ Ready to Execute  
**Next Step:** Read `00_FRONTEND_ANALYSIS.md` then execute SQL scripts in order  
**Documentation:** Complete and up-to-date

🚀 **Let's build amazing gigs functionality!**
