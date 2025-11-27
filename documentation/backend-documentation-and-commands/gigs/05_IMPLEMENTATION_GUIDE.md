# Gigs Backend Implementation Guide

**Created:** January 2025  
**Purpose:** Step-by-step guide to implement gigs backend to match frontend requirements

---

## 📋 Overview

This guide walks you through implementing the complete gigs backend infrastructure to support the frontend UI in `app/(app)/(gigs)`. The implementation is divided into 5 phases with clear success criteria for each.

---

## 🎯 Prerequisites

Before starting, ensure:

1. ✅ Supabase project is set up and running
2. ✅ Existing backend architecture is deployed (v2.2 from UPDATED_BACKEND_ARCHITECTURE.md)
3. ✅ Database connection is available
4. ✅ You have SQL access (Supabase SQL Editor or psql)
5. ✅ You have reviewed `00_FRONTEND_ANALYSIS.md`

---

## 🚀 Phase 1: Database Schema Migration

### Objective
Update database schema to support all frontend gig fields.

### Tasks

#### Task 1.1: Backup Existing Data
```sql
-- Create backup of existing gigs table
CREATE TABLE gigs_backup AS SELECT * FROM gigs;

-- Verify backup
SELECT COUNT(*) FROM gigs_backup;
```

#### Task 1.2: Execute ALTER Statements
```bash
# In Supabase SQL Editor or via psql
# Execute: backend-command/gigs/01_ALTER_STATEMENTS.sql
```

**What it does:**
- Adds 11 new columns to `gigs` table
- Changes `crew_availability.is_available` to `crew_availability.status`
- Migrates existing availability data

**Success Criteria:**
- ✅ All 11 columns added to gigs table
- ✅ `crew_availability.status` column exists with CHECK constraint
- ✅ No data loss in existing gigs
- ✅ Verification queries return expected structure

**Verification:**
```sql
-- Check gigs table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'gigs'
AND column_name IN (
  'slug', 'crew_count', 'role', 'type', 'department', 'company',
  'is_tbc', 'request_quote', 'expiry_date', 'supporting_file_label', 'reference_url'
);

-- Should return 11 rows
```

#### Task 1.3: Create New Tables
```bash
# Execute: backend-command/gigs/02_CREATE_TABLES.sql
```

**What it does:**
- Creates `gig_references` table for file/link references

**Success Criteria:**
- ✅ `gig_references` table exists
- ✅ Foreign key constraint to `gigs` table
- ✅ CHECK constraint on `type` column ('file' | 'link')
- ✅ ON DELETE CASCADE configured

**Verification:**
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'gig_references';

-- Check columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'gig_references';
```

#### Task 1.4: Create Indexes
```bash
# Execute: backend-command/gigs/03_INDEXES.sql
```

**What it does:**
- Creates 14+ indexes for query performance
- Adds full-text search index on title + description
- Optimizes foreign key joins

**Success Criteria:**
- ✅ All indexes created successfully
- ✅ No index creation errors
- ✅ Verification queries show index definitions

**Verification:**
```sql
-- List all indexes on gigs
SELECT indexname FROM pg_indexes
WHERE tablename = 'gigs' AND schemaname = 'public'
ORDER BY indexname;

-- Should include: idx_gigs_slug, idx_gigs_role, idx_gigs_type, etc.
```

#### Task 1.5: Apply RLS Policies
```bash
# Execute: backend-command/gigs/04_RLS_POLICIES.sql
```

**What it does:**
- Updates RLS policies for gigs table (handles new fields)
- Creates RLS policies for gig_references table
- Ensures proper access control

**Success Criteria:**
- ✅ RLS enabled on both tables
- ✅ 5 policies on gigs table
- ✅ 5 policies on gig_references table
- ✅ Security tests pass

**Verification:**
```sql
-- List policies on gigs
SELECT policyname FROM pg_policies
WHERE tablename = 'gigs' AND schemaname = 'public';

-- List policies on gig_references
SELECT policyname FROM pg_policies
WHERE tablename = 'gig_references' AND schemaname = 'public';
```

---

## 📡 Phase 2: API Endpoint Implementation

### Objective
Create and update API routes to handle gig operations with new fields.

### Tasks

#### Task 2.1: Update Helper Functions

**File:** `/lib/supabaseServer.js` (or similar)

Add slug generation helper:
```javascript
/**
 * Generate URL-friendly slug from title
 * Example: "4 Video Editors for Shortfilm" → "4-video-editors-shortfilm"
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens
    .trim();
}

/**
 * Transform gig_dates into calendarMonths format for frontend
 */
export function transformCalendarMonths(gigDates) {
  const monthsMap = new Map();
  
  gigDates.forEach(({ month, days }) => {
    // Parse "Sep 2025" → { month: 8, year: 2025 }
    const [monthName, year] = month.split(' ');
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    
    // Parse "1-5, 10, 15-20" → [1,2,3,4,5,10,15,16,17,18,19,20]
    const dayNumbers = [];
    days.split(',').forEach(range => {
      range = range.trim();
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        for (let d = start; d <= end; d++) {
          dayNumbers.push(d);
        }
      } else {
        dayNumbers.push(Number(range));
      }
    });
    
    const key = `${year}-${monthIndex}`;
    if (monthsMap.has(key)) {
      monthsMap.get(key).highlightedDays.push(...dayNumbers);
    } else {
      monthsMap.set(key, {
        month: monthIndex,
        year: Number(year),
        highlightedDays: dayNumbers
      });
    }
  });
  
  return Array.from(monthsMap.values()).map(cal => ({
    ...cal,
    highlightedDays: [...new Set(cal.highlightedDays)].sort((a, b) => a - b)
  }));
}
```

#### Task 2.2: Update POST /api/gigs

**File:** `/api/gigs/route.js`

**Changes:**
1. Accept new form fields (role, type, department, company, etc.)
2. Generate slug from title
3. Insert into gigs table with new fields
4. Handle dateWindows → gig_dates transformation
5. Handle locations → gig_locations insertion
6. Handle references → gig_references insertion

**Success Criteria:**
- ✅ Accepts all new fields from frontend form
- ✅ Generates unique slug (handle duplicates)
- ✅ Inserts gig with status 'draft' or 'active'
- ✅ Creates related gig_dates records
- ✅ Creates related gig_locations records
- ✅ Creates related gig_references records
- ✅ Returns complete gig object with slug

**Sample Request:**
```json
{
  "title": "4 Video Editors for Shortfilm",
  "description": "Looking for experienced video editors...",
  "qualifyingCriteria": "3+ years experience with Adobe Premiere",
  "amount": 20000,
  "currency": "AED",
  "crewCount": 4,
  "role": "editor",
  "type": "contract",
  "department": "Post-production",
  "company": "Central Films",
  "isTbc": false,
  "requestQuote": false,
  "expiryDate": "2025-10-22T00:00:00Z",
  "referenceUrl": "https://drive.google.com/folder/123",
  "supportingFileLabel": "Shotlist included",
  "dateWindows": [
    { "label": "Sep 2025", "range": "12, 15, 16-25" },
    { "label": "Oct 2025", "range": "1-30" }
  ],
  "locations": ["Dubai Design District", "Media City", "Downtown"],
  "references": [
    {
      "label": "Document.pdf",
      "url": "https://storage.supabase.co/.../document.pdf",
      "type": "file"
    },
    {
      "label": "Reference deck",
      "url": "https://behance.net/project/123",
      "type": "link"
    }
  ],
  "status": "active"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Gig created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "4-video-editors-shortfilm",
    "title": "4 Video Editors for Shortfilm",
    "description": "Looking for experienced video editors...",
    "qualifyingCriteria": "3+ years experience with Adobe Premiere",
    "amount": 20000,
    "currency": "AED",
    "crewCount": 4,
    "role": "editor",
    "type": "contract",
    "department": "Post-production",
    "company": "Central Films",
    "isTbc": false,
    "requestQuote": false,
    "expiryDate": "2025-10-22T00:00:00.000Z",
    "status": "active",
    "createdBy": "user-id-here",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "dateWindows": [
      { "label": "Sep 2025", "range": "12, 15, 16-25" },
      { "label": "Oct 2025", "range": "1-30" }
    ],
    "locations": ["Dubai Design District", "Media City", "Downtown"],
    "references": [
      { "id": "ref-1", "label": "Document.pdf", "url": "https://...", "type": "file" }
    ]
  }
}
```

#### Task 2.3: Update GET /api/gigs

**File:** `/api/gigs/route.js`

**Changes:**
1. Join with `user_profiles` for postedBy data
2. Aggregate `gig_dates` into dateWindows array
3. Aggregate `gig_locations` into locations array
4. Include count of applications
5. Support filtering by role, type, location, etc.
6. Support full-text search

**Success Criteria:**
- ✅ Returns active, non-expired gigs by default
- ✅ Includes postedBy: { name, avatar }
- ✅ Includes dateWindows, locations arrays
- ✅ Includes applicationCount
- ✅ Supports pagination (page, limit)
- ✅ Supports search query param
- ✅ Supports filter params (role, type, location)

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "gigs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "slug": "4-video-editors-shortfilm",
        "title": "4 Video Editors for Shortfilm",
        "description": "Looking for experienced video editors...",
        "qualifyingCriteria": "3+ years experience with Adobe Premiere",
        "budgetLabel": "AED 20000",
        "postedOn": "2025-01-15T10:00:00.000Z",
        "postedBy": {
          "name": "Michael Molar",
          "avatar": "https://storage/.../avatar.jpg"
        },
        "dateWindows": [
          { "label": "Sep 2025", "range": "12, 15, 16-25" }
        ],
        "location": "Dubai Design District, Media City",
        "supportingFileLabel": "Shotlist included",
        "applyBefore": "2025-10-22T00:00:00.000Z",
        "applicationCount": 12
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalGigs": 87,
      "limit": 20
    }
  }
}
```

#### Task 2.4: Create GET /api/gigs/slug/[slug]

**New File:** `/api/gigs/slug/[slug]/route.js`

**Purpose:** Get single gig by slug (for /gigs/[slug] page)

**Changes:**
1. Query gig by slug (not id)
2. Join with user_profiles
3. Fetch all gig_dates
4. Fetch all gig_locations
5. Fetch all gig_references
6. Transform gig_dates into calendarMonths format
7. Return 404 if not found

**Success Criteria:**
- ✅ Returns gig by slug
- ✅ Includes all related data (dates, locations, references)
- ✅ Includes calendarMonths for calendar view
- ✅ Returns 404 if slug doesn't exist
- ✅ RLS enforced (only active gigs or own drafts)

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "4-video-editors-shortfilm",
    "title": "4 Video Editors for Shortfilm",
    "description": "Looking for experienced video editors...",
    "qualifyingCriteria": "3+ years experience with Adobe Premiere",
    "amount": 20000,
    "currency": "AED",
    "budgetLabel": "AED 20000",
    "crewCount": 4,
    "role": "editor",
    "type": "contract",
    "department": "Post-production",
    "company": "Central Films",
    "postedOn": "2025-01-15T10:00:00.000Z",
    "postedBy": {
      "name": "Michael Molar",
      "avatar": "https://storage/.../avatar.jpg"
    },
    "dateWindows": [
      { "label": "Sep 2025", "range": "12, 15, 16-25" },
      { "label": "Oct 2025", "range": "1-30" }
    ],
    "calendarMonths": [
      { "month": 8, "year": 2025, "highlightedDays": [12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
      { "month": 9, "year": 2025, "highlightedDays": [1, 2, 3, ..., 30] }
    ],
    "references": [
      { "id": "ref-1", "label": "Document.pdf", "url": "https://...", "type": "file" },
      { "id": "ref-2", "label": "Reference deck", "url": "https://...", "type": "link" }
    ],
    "location": "Dubai Design District, Media City, Downtown",
    "supportingFileLabel": "Shotlist included",
    "referenceUrl": "https://drive.google.com/folder/123",
    "applyBefore": "2025-10-22T00:00:00.000Z",
    "status": "active"
  }
}
```

#### Task 2.5: Update PATCH /api/gigs/[id]

**File:** `/api/gigs/[id]/route.js`

**Changes:**
1. Allow updating all new fields
2. Regenerate slug if title changes
3. Update gig_dates (delete + re-insert)
4. Update gig_locations (delete + re-insert)
5. Update gig_references (delete + re-insert)

**Success Criteria:**
- ✅ Updates gig with new fields
- ✅ Handles slug regeneration on title change
- ✅ Updates related tables atomically
- ✅ Only owner can update (RLS enforced)

#### Task 2.6: Update GET /api/gigs/[id]/applications

**File:** `/api/gigs/[id]/applications/route.js`

**Changes:**
1. Join with user_profiles for applicant data
2. Join with applicant_skills for skills array
3. Count referrals for each applicant
4. Include avatar, city, phone, email

**Success Criteria:**
- ✅ Returns all applications for gig
- ✅ Includes applicant: { name, city, avatar, skills, phone, email }
- ✅ Includes referrals count
- ✅ Includes application status
- ✅ Only gig creator can access (RLS enforced)

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-1",
        "gigId": "gig-1",
        "applicant": {
          "id": "user-1",
          "name": "Aarav Mehta",
          "city": "Dubai",
          "avatar": "https://storage/.../avatar.jpg",
          "skills": ["Guitarist", "Sound Engineer"],
          "phone": "+91 9876543210",
          "email": "aaravmehta12@gmail.com"
        },
        "status": "pending",
        "coverLetter": "I would love to work on this project...",
        "resumeUrl": "https://storage/.../resume.pdf",
        "portfolioLinks": ["https://portfolio.com"],
        "referralsCount": 15,
        "appliedAt": "2025-01-16T12:00:00.000Z"
      }
    ]
  }
}
```

#### Task 2.7: Create GET /api/gigs/[id]/availability

**New File:** `/api/gigs/[id]/availability/route.js`

**Purpose:** Get applicant availability for gig dates

**Logic:**
1. Get all applicants for gig
2. Get gig_dates for this gig
3. Query crew_availability for each applicant × date
4. Transform into schedule format

**Success Criteria:**
- ✅ Returns availability for all applicants
- ✅ Matches frontend AvailabilitySchedule format
- ✅ Only gig creator can access

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "gigDates": [
      { "label": "Sep 2025", "range": "12, 15, 16-25" }
    ],
    "applicantsAvailability": [
      {
        "applicantId": "user-1",
        "name": "Aarav Mehta",
        "avatar": "https://storage/.../avatar.jpg",
        "creditsStatus": "added",
        "schedule": {
          "Sep 2025-12": "available",
          "Sep 2025-15": "available",
          "Sep 2025-16": "hold",
          "Sep 2025-17": "available",
          "Sep 2025-18": "na"
        }
      }
    ]
  }
}
```

#### Task 2.8: Create POST /api/upload/gig-reference

**New File:** `/api/upload/gig-reference/route.js`

**Purpose:** Upload reference files for gigs

**Logic:**
1. Validate file (type, size)
2. Upload to Supabase Storage (`portfolios/` bucket)
3. Return public URL
4. File path: `{user_id}/gig-references/{filename}`

**Success Criteria:**
- ✅ Accepts file upload
- ✅ Validates file type (PDF, images, videos)
- ✅ Enforces size limit (10 MB)
- ✅ Stores in user's folder
- ✅ Returns public URL

---

## 🔌 Phase 3: Frontend Integration

### Objective
Replace hardcoded data with API calls in all gigs pages.

### Tasks

#### Task 3.1: Update /gigs Page

**File:** `/app/(app)/(gigs)/gigs/page.tsx`

**Changes:**
1. Remove import of `gigsData` from `/data/gigs.ts`
2. Add `useState` and `useEffect` for data fetching
3. Fetch from `GET /api/gigs`
4. Add loading and error states
5. Add search functionality
6. Add pagination

**Success Criteria:**
- ✅ Fetches gigs from API on mount
- ✅ Shows loading spinner while fetching
- ✅ Shows error message on failure
- ✅ Search input works
- ✅ Pagination works
- ✅ Cards link to `/gigs/[slug]`

#### Task 3.2: Update /gigs/[slug] Page

**File:** `/app/(app)/(gigs)/gigs/[slug]/page.tsx`

**Changes:**
1. Remove import of `gigsData`
2. Fetch from `GET /api/gigs/slug/[slug]`
3. Handle loading and error states
4. Pass data to `<GigDetails />` component

**Success Criteria:**
- ✅ Fetches gig by slug from API
- ✅ Shows 404 if gig not found
- ✅ Renders gig details correctly
- ✅ Calendar view shows correct highlighted days

#### Task 3.3: Update /gigs/manage-gigs/add-new Page

**File:** `/app/(app)/(gigs)/gigs/manage-gigs/add-new/page.tsx`

**Changes:**
1. Update form submission handler
2. Upload reference file if present → `POST /api/upload/gig-reference`
3. Submit form data → `POST /api/gigs`
4. Redirect to `/gigs/[slug]` or `/gigs/manage-gigs` on success
5. Show error messages on failure

**Success Criteria:**
- ✅ Form submits to API
- ✅ File upload works (if provided)
- ✅ Creates gig with all fields
- ✅ Redirects on success
- ✅ Shows error on failure
- ✅ "Save to draft" sets status='draft'
- ✅ "Publish" sets status='active'

#### Task 3.4: Update Manage Gigs Page

**File:** `/app/(app)/(gigs)/gigs/manage-gigs/page.tsx`

**Tasks:**
1. Fetch user's gigs → `GET /api/gigs?createdBy=me`
2. Update `<GigList />` to use API data
3. Update `<ApplicationTab />` to fetch → `GET /api/gigs/[id]/applications`
4. Update `<AvailabilityTab />` to fetch → `GET /api/gigs/[id]/availability`
5. Update `<ContactListTab />` to fetch → `GET /api/contacts/gig/[gigId]`

**Success Criteria:**
- ✅ All tabs fetch from API
- ✅ No hardcoded data
- ✅ Loading states work
- ✅ Error handling works

---

## 🧪 Phase 4: Testing & Validation

### Objective
Thoroughly test all functionality with real data.

### Task 4.1: Database Testing

**Tests:**
```sql
-- Test 1: Create a gig with all fields
INSERT INTO gigs (
  title, slug, description, qualifying_criteria,
  amount, currency, crew_count, role, type, department,
  company, is_tbc, request_quote, expiry_date,
  supporting_file_label, reference_url, status, created_by
) VALUES (
  'Test Gig', 'test-gig', 'Test description', 'Test criteria',
  5000, 'AED', 2, 'director', 'contract', 'Pre-production',
  'Test Company', false, false, NOW() + INTERVAL '7 days',
  'Test file', 'https://test.com', 'active', auth.uid()
) RETURNING *;

-- Test 2: Add gig dates
INSERT INTO gig_dates (gig_id, month, days) VALUES
  ('gig-id-from-above', 'Sep 2025', '1-5, 10, 15-20');

-- Test 3: Add gig locations
INSERT INTO gig_locations (gig_id, location_name) VALUES
  ('gig-id-from-above', 'Dubai'),
  ('gig-id-from-above', 'Abu Dhabi');

-- Test 4: Add gig references
INSERT INTO gig_references (gig_id, label, url, type) VALUES
  ('gig-id-from-above', 'Document.pdf', 'https://example.com/doc.pdf', 'file');

-- Test 5: Query with joins
SELECT
  g.*,
  json_agg(DISTINCT gd.*) AS dates,
  json_agg(DISTINCT gl.*) AS locations,
  json_agg(DISTINCT gr.*) AS references
FROM gigs g
LEFT JOIN gig_dates gd ON g.id = gd.gig_id
LEFT JOIN gig_locations gl ON g.id = gl.gig_id
LEFT JOIN gig_references gr ON g.id = gr.gig_id
WHERE g.id = 'gig-id-from-above'
GROUP BY g.id;
```

**Success Criteria:**
- ✅ All inserts succeed
- ✅ Foreign keys work correctly
- ✅ CHECK constraints enforce valid values
- ✅ RLS policies allow/deny correctly
- ✅ Joins return expected data

### Task 4.2: API Testing

**Using curl or Postman:**

```bash
# Test 1: Create gig
curl -X POST http://localhost:3000/api/gigs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video Editor",
    "description": "Looking for editor",
    "qualifyingCriteria": "Experience required",
    "amount": 5000,
    "currency": "AED",
    "crewCount": 2,
    "role": "editor",
    "type": "contract",
    "dateWindows": [{"label": "Sep 2025", "range": "1-5"}],
    "locations": ["Dubai"],
    "status": "active"
  }'

# Test 2: List gigs
curl http://localhost:3000/api/gigs

# Test 3: Get gig by slug
curl http://localhost:3000/api/gigs/slug/test-video-editor

# Test 4: Upload reference file
curl -X POST http://localhost:3000/api/upload/gig-reference \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf"

# Test 5: Get applications (as gig creator)
curl http://localhost:3000/api/gigs/GIG_ID/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Criteria:**
- ✅ All endpoints return expected responses
- ✅ Auth validation works
- ✅ RLS policies enforced
- ✅ Error handling returns proper messages
- ✅ Pagination works

### Task 4.3: Frontend Testing

**Manual Testing:**
1. Visit `/gigs` - see list of gigs
2. Click a gig - see details page with calendar
3. Visit `/gigs/manage-gigs/add-new` - create a gig
4. Fill all form fields, upload file, submit
5. Visit `/gigs/manage-gigs` - see your gigs
6. Select a gig, switch to Applications tab
7. See applicants with data from backend
8. Switch to Availability tab
9. See availability calendar with data
10. Switch to Contact List tab
11. See contacts grouped by department

**Success Criteria:**
- ✅ All pages render without errors
- ✅ No "undefined" or missing data
- ✅ Loading states appear correctly
- ✅ Error messages show when needed
- ✅ Forms submit successfully
- ✅ Data persists after refresh

---

## 🎨 Phase 5: Polish & Optimization

### Objective
Optimize performance and improve user experience.

### Task 5.1: Database Optimization

1. **Analyze query performance:**
```sql
EXPLAIN ANALYZE
SELECT * FROM gigs
WHERE status = 'active'
AND expiry_date > NOW()
ORDER BY created_at DESC
LIMIT 20;
```

2. **Check index usage:**
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename IN ('gigs', 'gig_references', 'crew_availability')
ORDER BY idx_scan DESC;
```

3. **Add missing indexes if needed**

### Task 5.2: API Optimization

1. **Add caching headers:**
```javascript
export async function GET(request) {
  // ... fetch gigs
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

2. **Optimize database queries:**
- Use `select()` with specific fields (not `*`)
- Batch related queries with joins
- Use `.maybeSingle()` for single record queries

3. **Add rate limiting (optional)**

### Task 5.3: Frontend Optimization

1. **Add data caching:**
```javascript
import useSWR from 'swr';

function GigsPage() {
  const { data, error, isLoading } = useSWR('/api/gigs', fetcher);
  // ...
}
```

2. **Implement infinite scroll for gigs list**

3. **Add skeleton loaders for better UX**

4. **Optimize images with Next.js Image component**

---

## ✅ Final Checklist

### Database
- ✅ All ALTER statements executed
- ✅ New tables created
- ✅ Indexes created and verified
- ✅ RLS policies active and tested
- ✅ Sample data inserted for testing

### API
- ✅ POST /api/gigs created/updated
- ✅ GET /api/gigs updated with new fields
- ✅ GET /api/gigs/slug/[slug] created
- ✅ PATCH /api/gigs/[id] updated
- ✅ DELETE /api/gigs/[id] works
- ✅ GET /api/gigs/[id]/applications updated
- ✅ GET /api/gigs/[id]/availability created
- ✅ POST /api/upload/gig-reference created

### Frontend
- ✅ /gigs page fetches from API
- ✅ /gigs/[slug] page fetches from API
- ✅ /gigs/manage-gigs/add-new submits to API
- ✅ Manage gigs tabs fetch from API
- ✅ All hardcoded data removed
- ✅ Loading states implemented
- ✅ Error handling implemented

### Testing
- ✅ Database queries tested
- ✅ API endpoints tested with curl/Postman
- ✅ Frontend pages tested manually
- ✅ Auth/RLS verified
- ✅ Edge cases handled (404, errors, empty states)

### Documentation
- ✅ API endpoints documented
- ✅ Database schema documented
- ✅ Frontend integration guide created
- ✅ Troubleshooting guide created

---

## 🚨 Troubleshooting

### Issue: Slug conflicts on gig creation

**Symptom:** Error "duplicate key value violates unique constraint \"gigs_slug_key\""

**Solution:** Append timestamp or UUID to slug:
```javascript
let slug = generateSlug(title);
const { data: existingGig } = await supabase
  .from('gigs')
  .select('id')
  .eq('slug', slug)
  .maybeSingle();

if (existingGig) {
  slug = `${slug}-${Date.now()}`;
}
```

### Issue: RLS policy blocks gig creation

**Symptom:** "new row violates row-level security policy"

**Solution:** Ensure `created_by` matches `auth.uid()`:
```javascript
const { data: { user } } = await supabase.auth.getUser();

await supabase.from('gigs').insert({
  ...gigData,
  created_by: user.id  // Critical!
});
```

### Issue: Calendar months not displaying correctly

**Symptom:** Calendar shows wrong dates or empty

**Solution:** Verify month index (0-based):
```javascript
// "Sep 2025" should be month: 8 (not 9)
const monthIndex = new Date("Sep 1, 2025").getMonth(); // Returns 8
```

### Issue: File upload fails

**Symptom:** 413 Payload Too Large or upload error

**Solution:**
1. Check Supabase Storage bucket configuration (max file size)
2. Compress files before upload if needed
3. Use multipart upload for large files

---

## 📚 Next Steps

After completing this guide:

1. **Monitor Performance:**
   - Check API response times
   - Monitor database query performance
   - Watch for slow queries

2. **Gather User Feedback:**
   - Test with real users
   - Collect feedback on UX
   - Identify pain points

3. **Iterate:**
   - Fix bugs reported by users
   - Add requested features
   - Optimize slow operations

4. **Scale:**
   - Add caching layer (Redis)
   - Implement CDN for static assets
   - Consider read replicas for database

---

**Implementation Time Estimate:**
- Phase 1 (Database): 1-2 hours
- Phase 2 (API): 4-6 hours
- Phase 3 (Frontend): 3-4 hours
- Phase 4 (Testing): 2-3 hours
- Phase 5 (Polish): 1-2 hours

**Total: 11-17 hours**

Good luck with implementation! 🚀
