# Jobs Backend Implementation

**Version:** 1.0  
**Created:** January 2025  
**Purpose:** SQL implementation to support frontend Jobs feature (app/(app)/jobs)

---

## 📁 Files in This Directory

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | This file - Overview and quickstart | ✅ |
| `01_JOBS_SQL_IMPLEMENTATION_PLAN.md` | Comprehensive implementation plan with gap analysis | ✅ |
| `02_execute_step1_enhance_gigs_table.sql` | Add 4 new columns to gigs table | ✅ Ready |
| `03_execute_step2_update_gigs_type.sql` | Update type constraint (add 'project', 'gig') | ✅ Ready |
| `04_execute_step3_update_gigs_status.sql` | Update status constraint (add production phases) | ✅ Ready |
| `05_execute_step4_create_gig_skills_table.sql` | Create gig_skills table + RLS + indexes | ✅ Ready |
| `06_execute_step5_enhance_gig_dates_table.sql` | Add timeline phase columns + RLS + indexes | ✅ Ready |
| `07_execute_step6_create_gig_project_details_table.sql` | Create gig_project_details table + RLS + indexes | ✅ Ready |
| `08_execute_step7_create_indexes.sql` | Create performance indexes for all tables | ✅ Ready |
| `09_ARCHITECTURE_UPDATE.md` | Documentation update for UPDATED_BACKEND_ARCHITECTURE.md | ✅ |

---

## 🎯 Quick Start

### Prerequisites
- Supabase project with existing `gigs` table
- PostgreSQL admin access
- Supabase SQL Editor or psql access

### Execution Order

**IMPORTANT:** Run scripts in this exact order to avoid dependency issues.

```bash
# Step 1: Enhance gigs table (4 new columns)
psql < 02_execute_step1_enhance_gigs_table.sql

# Step 2: Update gigs.type constraint
psql < 03_execute_step2_update_gigs_type.sql

# Step 3: Update gigs.status constraint
psql < 04_execute_step3_update_gigs_status.sql

# Step 4: Create gig_skills table
psql < 05_execute_step4_create_gig_skills_table.sql

# Step 5: Enhance gig_dates table
psql < 06_execute_step5_enhance_gig_dates_table.sql

# Step 6: Create gig_project_details table
psql < 07_execute_step6_create_gig_project_details_table.sql

# Step 7: Create performance indexes
psql < 08_execute_step7_create_indexes.sql
```

### Using Supabase SQL Editor

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of each .sql file
3. Paste into SQL Editor
4. Click "Run" or press Ctrl+Enter
5. Verify success message
6. Repeat for each file in order

---

## 📊 What This Implements

### Problem
Frontend Jobs pages (`app/(app)/jobs`) use hardcoded data for both "Projects" and "GIGs". Backend only has a `gigs` table with insufficient fields to support the UI requirements.

### Solution
Enhance existing backend infrastructure to support:

1. **Project vs GIG distinction** using `type` field
2. **Production workflow phases** (Pre-Production, Production, Post-Production, etc.)
3. **Required skills/roles** (Producer, Director, Editor, etc.)
4. **Timeline phases** with dates (structured timeline)
5. **Project details** as flexible key-value pairs
6. **Company logos** and terms & conditions
7. **Performance optimizations** with 12+ new indexes

### Changes Summary

#### New Tables (2)
- `gig_skills` - Required skills/roles for each gig
- `gig_project_details` - Flexible key-value project data

#### Enhanced Tables (2)
- `gigs` - 4 new columns + updated constraints
- `gig_dates` - 4 new columns for timeline phases

#### New Database Objects
- **Columns:** 10 new columns across 2 tables
- **Tables:** 2 brand new tables
- **RLS Policies:** 15 new policies
- **Indexes:** 12+ new indexes
- **Constraints:** 2 updated, 3 new
- **Triggers:** 1 auto-update trigger

---

## 🔍 Gap Analysis Summary

### Frontend Needs vs Backend Support

| Frontend Requirement | Backend Solution | Status |
|----------------------|------------------|--------|
| Distinguish "projects" from "gigs" | `gigs.type` = 'project' or 'gig' | ✅ Solved |
| Company logo images | `gigs.company_logo` column | ✅ Added |
| Terms & conditions text | `gigs.terms_conditions` column | ✅ Added |
| Project budget info | `gigs.budget_amount`, `budget_currency` | ✅ Added |
| Required skills array | `gig_skills` table (one-to-many) | ✅ Created |
| Timeline phases | Enhanced `gig_dates` with phase_name, dates | ✅ Enhanced |
| Project details object | `gig_project_details` table (key-value) | ✅ Created |
| Production workflow | Updated `gigs.status` enum values | ✅ Updated |
| Multiple locations | Existing `gig_locations` table | ✅ Exists |

---

## 🛡️ Security (RLS Policies)

All new/enhanced tables have comprehensive Row Level Security policies:

### Public Users Can:
- View all data for published gigs (status NOT IN 'draft', 'cancelled', 'archived')

### Authenticated Users Can:
- View ALL data for their own gigs (including drafts)
- Create/update/delete data for their own gigs only

### Security Principles:
1. **Least Privilege:** Users only see what they should
2. **Ownership Verification:** All writes check `created_by = auth.uid()`
3. **Cascade Deletes:** Related data deleted when parent gig deleted
4. **No Data Leaks:** Draft gigs hidden from public

---

## 📈 Performance Considerations

### Indexes Created

**For Fast Queries:**
- Full-text search on `title + description + company`
- Composite indexes for common filters (`type + status + date`)
- Join optimization indexes on all foreign keys
- Ordered display indexes (`gig_id + sort_order`)

**Expected Performance:**
- Jobs listing: <100ms
- Single job details (all joins): <150ms
- Search queries: <200ms
- Filter by skills: <100ms

### Query Optimization

All junction tables use efficient joins:
```sql
-- Optimized with indexes
LEFT JOIN gig_skills gs ON g.id = gs.gig_id
LEFT JOIN gig_dates gd ON g.id = gd.gig_id
LEFT JOIN gig_project_details gpd ON g.id = gpd.gig_id
```

---

## 🧪 Testing & Verification

Each SQL file includes verification queries at the end:

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'gigs';

-- Check RLS policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'gig_skills';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'gigs';
```

### Sample Data

Step 6 and Step 7 include sample INSERT statements for testing (commented out).

To test with real data:
1. Replace `{gig_id}` with actual UUID
2. Uncomment sample INSERT statements
3. Run queries
4. Verify data appears correctly

---

## 📚 Detailed Documentation

### For Comprehensive Details, See:

1. **`01_JOBS_SQL_IMPLEMENTATION_PLAN.md`**
   - Complete gap analysis
   - Field-by-field comparison
   - RLS policy explanations
   - Usage guidelines
   - Sample data structures

2. **`09_ARCHITECTURE_UPDATE.md`**
   - How to update main architecture document
   - Complete schema reference
   - API response examples
   - Frontend integration requirements

---

## 🔄 Frontend Integration

After running these scripts, the frontend needs to:

### 1. Replace Hardcoded Data

**Current:**
```javascript
const jobs = [
  {
    id: 1,
    title: "Camera Operator",
    type: "project",
    // ... hardcoded data
  }
];
```

**New:**
```javascript
const { data } = await fetch('/api/jobs');
const jobs = data.jobs;
```

### 2. Map Backend Fields

| Backend Field | Frontend Field | Notes |
|---------------|----------------|-------|
| `created_at` | `datePosted` | Format as "YYYY-MM-DD" |
| `crew_count` | `requiredPositions` | Direct mapping |
| `company` | `name`, `postedfor` | Use for both |
| `company_logo` | `logo` | Direct mapping |
| `gig_skills[]` | `skills[]` | Join and map |
| `gig_dates[]` | `projectTimeLine{}` | Transform to object |
| `gig_project_details[]` | `projectDetails{}` | Transform to object |
| `gig_locations[]` | `location` | Concatenate with count |

### 3. Type-Based Routing

```javascript
// Route based on type field
if (job.type === 'project') {
  router.push(`/jobs/project/${job.id}`);
} else if (job.type === 'gig') {
  router.push(`/jobs/gig/${job.id}`);
}
```

---

## ⚠️ Important Notes

### Backward Compatibility

✅ **100% backward compatible:**
- All changes are additive (new columns/tables)
- Existing queries continue to work
- Old `gig_dates` fields retained
- Enum constraints expanded (not replaced)

### Data Migration

❌ **No data migration required:**
- New columns allow NULL
- Existing records unaffected
- Can populate gradually

### Breaking Changes

✅ **None:**
- No columns removed
- No columns renamed
- No foreign keys broken
- No constraints tightened

---

## 🎓 Learning Resources

### Understanding the Structure

1. **Start here:** `01_JOBS_SQL_IMPLEMENTATION_PLAN.md` - Comprehensive overview
2. **Then read:** Individual SQL files for specific implementations
3. **Finally:** `09_ARCHITECTURE_UPDATE.md` for big picture

### Key Concepts

- **Junction Tables:** `gig_skills` connects gigs to skills (many-to-many)
- **Key-Value Storage:** `gig_project_details` allows flexible data without schema changes
- **RLS Policies:** Supabase Row Level Security controls data access
- **Composite Indexes:** Multi-column indexes optimize complex queries

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** "constraint already exists"
```sql
-- Solution: Drop first
ALTER TABLE gigs DROP CONSTRAINT IF EXISTS gigs_type_check;
```

**Issue:** "table already exists"
```sql
-- Solution: Use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS gig_skills (...);
```

**Issue:** "function does not exist"
```sql
-- Solution: Create trigger function first (included in Step 6)
CREATE OR REPLACE FUNCTION update_updated_at_column() ...
```

### Verification Failed?

If verification queries show unexpected results:

1. Check you ran scripts in order
2. Verify you have admin privileges
3. Check Supabase logs for errors
4. Try running verification queries individually

---

## 📞 Support

### Questions?

1. **Check documentation first:** `01_JOBS_SQL_IMPLEMENTATION_PLAN.md`
2. **Review verification queries** at end of each SQL file
3. **Check Supabase Dashboard** → Database → Tables
4. **Inspect RLS policies** in Supabase Dashboard → Authentication → Policies

### Found a Bug?

Create an issue with:
- Which step/file
- Error message
- Database version
- What you were trying to do

---

## ✅ Success Criteria

You'll know the migration succeeded when:

- [ ] All 7 SQL scripts run without errors
- [ ] `gigs` table has 4 new columns (company_logo, terms_conditions, budget_amount, budget_currency)
- [ ] `gigs.type` allows 'project' and 'gig' values
- [ ] `gigs.status` allows 'pre-production', 'production', 'post-production'
- [ ] `gig_skills` table exists with data
- [ ] `gig_project_details` table exists with data
- [ ] `gig_dates` table has phase_name, start_date, end_date columns
- [ ] All tables show "RLS Enabled" in Supabase Dashboard
- [ ] Policy counts match (see verification queries)
- [ ] Sample data inserts work correctly
- [ ] EXPLAIN ANALYZE shows indexes being used

---

## 📝 Next Steps

After successful migration:

1. ✅ **Update Architecture Document**
   - Use content from `09_ARCHITECTURE_UPDATE.md`
   - Update `/app/backend-command/UPDATED_BACKEND_ARCHITECTURE.md`

2. ✅ **Create API Endpoints**
   - GET /api/jobs (list with filters)
   - GET /api/jobs/[id] (detail with joins)
   - POST /api/jobs (create new)
   - PATCH /api/jobs/[id] (update)
   - DELETE /api/jobs/[id] (delete)

3. ✅ **Update Frontend**
   - Replace hardcoded data with API calls
   - Map backend fields to frontend expectations
   - Handle type-based routing

4. ✅ **Test End-to-End**
   - Create test gigs via API
   - Verify frontend display
   - Test filters and search
   - Verify RLS policies work

---

**Status:** ✅ Ready for Execution  
**Version:** 1.0  
**Last Updated:** January 2025
