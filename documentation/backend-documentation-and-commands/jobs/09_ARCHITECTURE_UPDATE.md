# Architecture Update for Jobs Feature

**Version:** 2.7 (Jobs Enhancement)  
**Date:** January 2025  
**Purpose:** Document changes made to support frontend Jobs feature

---

## 📋 Summary of Changes

This update enhances the existing Gigs & Applications tables to fully support the frontend Jobs feature located at `app/(app)/jobs`. The changes include:

1. **Enhanced `gigs` table** with 4 new columns
2. **Updated `gigs.type` constraint** to include 'project' and 'gig' types
3. **Updated `gigs.status` constraint** to include production workflow phases
4. **New `gig_skills` table** for required skills/roles
5. **Enhanced `gig_dates` table** with timeline phase support
6. **New `gig_project_details` table** for flexible key-value project data
7. **15 new RLS policies** across new tables
8. **12+ new indexes** for query performance

---

## 📊 Updated Database Schema Section

### Update to Section: GIGS & APPLICATIONS TABLES

Replace the existing section in UPDATED_BACKEND_ARCHITECTURE.md with:

---

#### GIGS & APPLICATIONS TABLES (11 Tables) ⭐ ENHANCED v2.7

##### 11. `gigs` ⭐ ENHANCED (Version 2.7)
Main table for job postings with comprehensive gig management and project support.

**Core Fields:**
- `id` (PK, UUID)
- `title`, `description`, `qualifying_criteria`
- `amount`, `currency`
- `status` - See updated values below ⭐
- `created_by` (FK → auth.users)

**Fields from v2.3:**
- `slug` (TEXT, UNIQUE) - URL-friendly identifier for routing
- `crew_count` (INTEGER) - Number of crew needed (default 1)
- `role` (TEXT) - GIG role (director, producer, cinematographer, etc.)
- `type` (TEXT) - See updated values below ⭐
- `department` (TEXT) - Department or specialty area
- `company` (TEXT) - Production company name (optional)
- `is_tbc` (BOOLEAN) - "To Be Confirmed" scheduling flag
- `request_quote` (BOOLEAN) - Whether to request quote instead of fixed rate
- `expiry_date` (TIMESTAMPTZ) - Application deadline ("Apply before" date)
- `supporting_file_label` (TEXT) - Label for reference file
- `reference_url` (TEXT) - URL for reference link

**New Fields (v2.7):** ⭐
- `company_logo` (TEXT) - URL to company/project logo image
- `terms_conditions` (TEXT) - Terms, conditions, and return policy text
- `budget_amount` (INTEGER) - Total project budget amount
- `budget_currency` (TEXT, default 'AED') - Budget currency code

**Updated Enums (v2.7):** ⭐

`type` values:
- `contract`, `full-time`, `part-time` (existing)
- `project` ⭐ NEW - Multi-phase projects (films, TV shows)
- `gig` ⭐ NEW - Single engagement gigs (events, shoots)
- `freelance`, `temporary`, `internship`, `volunteer` ⭐ NEW

`status` values:
- `active`, `closed`, `draft` (existing)
- `pre-production` ⭐ NEW - Planning phase
- `production` ⭐ NEW - Active filming/production
- `post-production` ⭐ NEW - Editing phase
- `completed` ⭐ NEW - Project completed
- `on-hold`, `cancelled`, `archived` ⭐ NEW

**Indexes:**
- `idx_gigs_created_by` on `created_by`
- `idx_gigs_status` on `status`
- `idx_gigs_slug` on `slug`
- `idx_gigs_role` on `role`
- `idx_gigs_type` on `type`
- `idx_gigs_department` on `department`
- `idx_gigs_expiry_date` on `expiry_date`
- `idx_gigs_status_expiry` on `(status, expiry_date)`
- `idx_gigs_created_by_status` on `(created_by, status)`
- `idx_gigs_search` (GIN) on title + description + company ⭐ UPDATED
- `idx_gigs_company` on `company` ⭐ NEW v2.7
- `idx_gigs_created_at` on `created_at DESC` ⭐ NEW v2.7
- `idx_gigs_type_status` on `(type, status)` ⭐ NEW v2.7
- `idx_gigs_company_logo` on `company_logo` WHERE NOT NULL ⭐ NEW v2.7
- `idx_gigs_list_query` on `(type, status, created_at DESC)` ⭐ NEW v2.7
- `idx_gigs_crew_count` on `crew_count` WHERE NOT NULL ⭐ NEW v2.7
- `idx_gigs_amount` on `(amount, currency)` WHERE amount NOT NULL ⭐ NEW v2.7

##### 12. `gig_dates` ⭐ ENHANCED (Version 2.7)
Multiple date ranges and timeline phases per gig.

**Original Fields:**
- `id` (PK, UUID)
- `gig_id` (FK → gigs)
- `month`, `days` (e.g., "1-5, 10-15") - For simple date ranges

**New Fields (v2.7):** ⭐
- `phase_name` (TEXT) - Timeline phase (Pre-Production, Production, Post-Production, Release)
- `start_date` (DATE) - Phase start date
- `end_date` (DATE) - Phase end date (can be NULL)
- `sort_order` (INTEGER, default 0) - Display order

**Constraints:**
- CHECK: `end_date >= start_date` (if both set)

**Indexes:**
- `idx_gig_dates_gig_id` on `gig_id`
- `idx_gig_dates_gig_sort` on `(gig_id, sort_order)` ⭐ NEW v2.7
- `idx_gig_dates_phase` on `phase_name` WHERE NOT NULL ⭐ NEW v2.7
- `idx_gig_dates_date_range` on `(start_date, end_date)` WHERE start_date NOT NULL ⭐ NEW v2.7

**RLS Policies (v2.7):** ⭐
- Public can view dates for published gigs
- Creators can view/manage dates for own gigs

##### 13. `gig_locations`
Multiple locations per gig.

**Key Fields:**
- `id` (PK, UUID)
- `gig_id` (FK → gigs)
- `location_name`

##### 14. `gig_skills` ⭐ NEW v2.7
Required skills and roles for each gig.

**Key Fields:**
- `id` (PK, UUID)
- `gig_id` (FK → gigs, ON DELETE CASCADE)
- `skill_name` (TEXT, NOT NULL) - Skill/role name (Producer, Director, Editor, etc.)
- `skill_level` (TEXT) - 'required', 'preferred', 'nice-to-have'
- `sort_order` (INTEGER, default 0) - Display order
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(gig_id, skill_name) - No duplicate skills per gig

**Indexes:**
- `idx_gig_skills_gig_id` on `gig_id` - Join performance
- `idx_gig_skills_gig_sort` on `(gig_id, sort_order)` - Ordered display
- `idx_gig_skills_name` on `skill_name` - Filter by skill

**RLS Policies:**
- Public can view skills for published gigs
- Creators can view all skills for own gigs
- Creators can INSERT/UPDATE/DELETE skills for own gigs

##### 15. `gig_project_details` ⭐ NEW v2.7
Flexible key-value pairs for project-specific details.

**Key Fields:**
- `id` (PK, UUID)
- `gig_id` (FK → gigs, ON DELETE CASCADE)
- `detail_key` (TEXT, NOT NULL) - Key name (projectName, projectType, projectBudget, etc.)
- `detail_value` (TEXT, NOT NULL) - Value as text
- `sort_order` (INTEGER, default 0) - Display order
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Common Keys:**
- `projectName` - Official project name
- `projectType` - Film, TV Show, Commercial, Documentary
- `projectDuration` - Duration string (e.g., "3 months")
- `projectBudget` - Budget string (e.g., "$500,000")
- `projectLocation` - Primary location(s)
- `projectDescription` - Long-form description
- `director`, `producer`, `writer`, etc. - Credits
- `genre`, `style`, `tone` - Creative details
- `format`, `aspect_ratio`, `runtime` - Technical specs

**Constraints:**
- UNIQUE(gig_id, detail_key) - No duplicate keys per gig

**Indexes:**
- `idx_gig_project_details_gig_id` on `gig_id` - Join performance
- `idx_gig_project_details_gig_sort` on `(gig_id, sort_order)` - Ordered display
- `idx_gig_project_details_key` on `detail_key` - Filter by key

**RLS Policies:**
- Public can view details for published gigs
- Creators can view all details for own gigs
- Creators can INSERT/UPDATE/DELETE details for own gigs

**Trigger:**
- Auto-update `updated_at` on UPDATE

##### 16. `applications`
User applications to gigs.

**Key Fields:**
- `gig_id` (FK → gigs)
- `applicant_user_id` (FK → auth.users)
- `status` (pending/shortlisted/confirmed/released)
- `cover_letter`, `portfolio_links`, `resume_url`

**Constraints:**
- UNIQUE(gig_id, applicant_user_id)

**Indexes:**
- `idx_applications_gig_id` on `gig_id`
- `idx_applications_applicant_user_id` on `applicant_user_id`
- `idx_applications_gig_status` on `(gig_id, status)`

##### 17. `crew_availability`
User availability calendar with status tracking.

**Key Fields:**
- `user_id` (FK → auth.users)
- `availability_date`
- `status` (TEXT) - 'available' | 'hold' | 'na'
- `gig_id` (optional FK → gigs)

**Constraints:**
- UNIQUE(user_id, availability_date)
- CHECK(status IN ('available', 'hold', 'na'))

**Indexes:**
- `idx_crew_availability_status` - Filter by status
- `idx_crew_availability_user_status` - User availability queries
- `idx_crew_availability_gig_status` - Gig availability queries

##### 18. `crew_contacts`
Contacts added to gigs by creators.

**Key Fields:**
- `gig_id` (FK → gigs)
- `user_id` (FK → auth.users)
- `department`, `role`, `company`
- `phone`, `email`

##### 19. `referrals`
User-to-user gig referrals.

**Key Fields:**
- `gig_id` (FK → gigs)
- `referred_user_id`, `referrer_user_id` (FK → auth.users)
- `status` (pending/accepted/declined)

##### 20. `notifications`
In-app notification system.

**Key Fields:**
- `user_id` (FK → auth.users)
- `type` (application_received/status_changed/referral_received)
- `title`, `message`
- `related_gig_id`, `related_application_id`
- `is_read` (Boolean)

**Indexes:**
- `idx_notifications_user_id` on `user_id`

##### 21. `gig_references`
Supporting references (files and links) for gigs.

**Key Fields:**
- `id` (PK, UUID)
- `gig_id` (FK → gigs) - Parent gig
- `label` (TEXT) - Display name (e.g., "Document.pdf", "Reference deck")
- `url` (TEXT) - Full URL to file or external link
- `type` (TEXT) - 'file' | 'link'
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- CHECK(type IN ('file', 'link'))
- ON DELETE CASCADE (references deleted when gig deleted)

**Indexes:**
- `idx_gig_references_gig_id` on `gig_id` - For join performance
- `idx_gig_references_type` on `type` - Filter by file vs link

**Note:** Multiple references per gig supported (one-to-many relationship)

---

## 🔄 Database Relationships (Updated)

```
gigs
    ├──[1:N]──> gig_dates (Date ranges & timeline phases) ⭐ ENHANCED v2.7
    ├──[1:N]──> gig_locations (Multiple locations)
    ├──[1:N]──> gig_skills (Required skills/roles) ⭐ NEW v2.7
    ├──[1:N]──> gig_project_details (Key-value project data) ⭐ NEW v2.7
    ├──[1:N]──> applications (Applications to gig)
    ├──[1:N]──> crew_contacts (Gig contacts)
    ├──[1:N]──> referrals (Gig referrals)
    └──[1:N]──> gig_references (Supporting files/links)
```

---

## 📈 Performance Optimizations

### New Indexes (v2.7)

**On `gigs` table:**
- Full-text search on title + description + company
- Composite indexes for common queries (type + status + date)
- Indexes on new columns (company_logo, created_at, company)

**On `gig_dates` table:**
- Composite index for phase ordering
- Index on phase names
- Index on date ranges

**On `gig_skills` table:**
- Index for joins
- Composite index for ordered display
- Index for skill name filtering

**On `gig_project_details` table:**
- Index for joins
- Composite index for ordered display
- Index for key filtering

### Query Performance

Expected response times:
- Jobs listing (with type/status filters): <100ms
- Single job details (with all joins): <150ms
- Search queries (full-text): <200ms
- Filter by skills: <100ms

---

## 🔐 Security Updates

### RLS Policies Summary

**Total New Policies: 15**

- `gig_skills`: 5 policies (public read, creator CRUD)
- `gig_dates`: 5 policies (public read, creator CRUD) ⭐ Verified/Created
- `gig_project_details`: 5 policies (public read, creator CRUD)

**Security Principles:**
1. Public can view data for published gigs (status NOT IN draft/cancelled/archived)
2. Creators have full access to their own gigs (including drafts)
3. All writes require creator ownership verification
4. Cascade deletes ensure referential integrity

---

## 📝 Migration Notes

### Backward Compatibility

✅ **All changes are backward compatible:**
- New columns added with defaults or NULL allowed
- Existing columns unchanged (except enum constraints expanded)
- Old `gig_dates` fields (month, days) retained
- Existing queries continue to work

### Data Migration

No data migration required. New columns will be NULL for existing records.

To populate for existing gigs:
1. Run migration scripts in order (Steps 1-7)
2. Optionally update existing gigs with new data
3. Frontend will handle NULL values gracefully

---

## 🎯 Frontend Integration Requirements

### API Changes Needed

The frontend Jobs pages need to:

1. **Replace hardcoded data** with API calls
2. **Map backend fields** to frontend expectations:
   - `created_at` → `datePosted` (format as "YYYY-MM-DD")
   - `crew_count` → `requiredPositions`
   - `company` → both `name` and `postedfor`
   - `company_logo` → `logo`
   - Join `gig_locations` → `location` (with count)
   - Join `gig_skills` → `skills[]` array
   - Join `gig_dates` (with phase_name) → `projectTimeLine{}` object
   - Join `gig_project_details` → `projectDetails{}` object
   - `amount` + `currency` → `rate` formatted string

3. **Filter by type** to distinguish "projects" vs "gigs"
4. **Handle production phases** in status display

### Example API Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Film: NIGHTHAWK",
    "description": "Behind-the-scenes documentary...",
    "company": "MARVEL STUDIOS",
    "company_logo": "/logo.png",
    "type": "project",
    "status": "pre-production",
    "amount": 2000,
    "currency": "AED",
    "crew_count": 5,
    "expiry_date": "2024-10-15",
    "terms_conditions": "We stand behind our products...",
    "created_at": "2024-10-01T10:00:00Z",
    
    "skills": [
      {"skill_name": "Producer", "skill_level": "required"},
      {"skill_name": "Director", "skill_level": "required"},
      {"skill_name": "Actor", "skill_level": "preferred"}
    ],
    
    "locations": [
      "Dubai Design District",
      "Los Angeles, CA"
    ],
    
    "timeline": [
      {
        "phase": "Pre-Production",
        "start_date": "2024-10-01",
        "end_date": "2024-11-01"
      },
      {
        "phase": "Production",
        "start_date": "2024-11-02",
        "end_date": "2025-01-15"
      }
    ],
    
    "project_details": {
      "projectName": "NIGHTHAWK",
      "projectType": "Film",
      "projectDuration": "3 months",
      "projectBudget": "$500,000"
    }
  }
}
```

---

## ✅ Verification Checklist

After running migration scripts:

- [ ] Step 1: `gigs` table has 4 new columns
- [ ] Step 2: `gigs.type` constraint includes 'project' and 'gig'
- [ ] Step 3: `gigs.status` constraint includes production phases
- [ ] Step 4: `gig_skills` table created with 5 RLS policies
- [ ] Step 5: `gig_dates` table has 4 new columns with 5 RLS policies
- [ ] Step 6: `gig_project_details` table created with 5 RLS policies
- [ ] Step 7: All performance indexes created
- [ ] RLS enabled on all new tables
- [ ] Sample data inserts work correctly
- [ ] EXPLAIN ANALYZE shows indexes being used
- [ ] Frontend can fetch and display gig data

---

## 📚 Related Documentation

- **Implementation Plan:** `/app/backend-command/jobs/01_JOBS_SQL_IMPLEMENTATION_PLAN.md`
- **SQL Scripts:** `/app/backend-command/jobs/02_execute_step1_*.sql` through Step 7
- **Main Architecture:** `/app/backend-command/UPDATED_BACKEND_ARCHITECTURE.md`

---

**Version:** 2.7  
**Last Updated:** January 2025  
**Status:** Ready for Implementation ✅
