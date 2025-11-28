# What's On Feature - Step-by-Step Implementation Guide

## Overview
This guide provides step-by-step instructions to implement the What's On events feature backend, matching the existing frontend requirements.

## Prerequisites
- Supabase project set up
- Database access via Supabase Dashboard or SQL client
- Access to Supabase Storage

---

## Phase 1: Database Setup

### Step 1: Create Tables
Execute the SQL file to create all required tables.

**File:** `01_CREATE_TABLES.sql`

**Actions:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `01_CREATE_TABLES.sql`
3. Execute the SQL
4. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name LIKE 'whatson_%'
   ORDER BY table_name;
   ```

**Expected Result:** 5 tables created
- `whatson_events`
- `whatson_schedule`
- `whatson_tags`
- `whatson_rsvps`
- `whatson_rsvp_dates`

**Also Creates:**
- Automatic timestamp update triggers
- Helper functions:
  - `generate_ticket_number()` - Auto-generates ticket numbers (WO-2025-NNNNNN)
  - `generate_reference_number()` - Auto-generates reference numbers (#ALPHANUMERIC13)

---

### Step 2: Apply Row Level Security (RLS)
Execute the SQL file to set up security policies.

**File:** `02_RLS_POLICIES.sql`

**Actions:**
1. Copy and paste contents of `02_RLS_POLICIES.sql`
2. Execute the SQL
3. Verify policies created:
   ```sql
   SELECT tablename, COUNT(*) as policy_count
   FROM pg_policies 
   WHERE tablename LIKE 'whatson_%'
   GROUP BY tablename
   ORDER BY tablename;
   ```

**Expected Result:** 25 policies created
- `whatson_events`: 5 policies
- `whatson_schedule`: 5 policies
- `whatson_tags`: 4 policies
- `whatson_rsvps`: 6 policies
- `whatson_rsvp_dates`: 5 policies

**Key Security Rules:**
- ✅ Public can view published events
- ✅ Users can only edit own events
- ✅ Users cannot RSVP to own events
- ✅ Event creators can view all RSVPs
- ✅ Users can view/cancel own RSVPs

---

### Step 3: Create Performance Indexes
Execute the SQL file to create indexes for query optimization.

**File:** `03_INDEXES.sql`

**Actions:**
1. Copy and paste contents of `03_INDEXES.sql`
2. Execute the SQL
3. Verify indexes created:
   ```sql
   SELECT tablename, indexname
   FROM pg_indexes
   WHERE tablename LIKE 'whatson_%'
   ORDER BY tablename, indexname;
   ```

**Expected Result:** 27+ indexes created

**Key Indexes:**
- Full-text search on title and description
- Filter by status, location, price type
- Date range queries
- RSVP management queries
- Tag-based filtering

---

### Step 4: Set Up Storage Bucket
Create storage bucket for event images.

**File:** `04_STORAGE_BUCKET.sql`

**Actions:**

**Option A: Via SQL (Recommended)**
1. Copy and paste contents of `04_STORAGE_BUCKET.sql`
2. Execute the SQL

**Option B: Via Supabase Dashboard**
1. Go to Storage in Supabase Dashboard
2. Click "New Bucket"
3. Configure:
   - **Name:** `whatson-images`
   - **Public:** Yes (checked)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg, image/jpg, image/png, image/webp`
4. Create bucket
5. Execute only the policy creation SQL from `04_STORAGE_BUCKET.sql`

**Verify:**
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'whatson-images';
```

**Expected Result:**
- Bucket name: `whatson-images`
- Public: `true`
- File size limit: `5242880` (5 MB)
- Allowed types: `{image/jpeg, image/jpg, image/png, image/webp}`

---

## Phase 2: Database Verification

### Test Database Setup

**1. Check Tables:**
```sql
-- Should return 5 tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'whatson_%'
ORDER BY table_name;
```

**2. Check Constraints:**
```sql
-- Should show foreign keys, unique constraints, check constraints
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    rel.relname AS table_name
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
WHERE rel.relname LIKE 'whatson_%'
ORDER BY rel.relname, con.conname;
```

**3. Check Functions:**
```sql
-- Should return 3 functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%whatson%'
OR routine_name LIKE 'generate_%number'
ORDER BY routine_name;
```

**4. Test Ticket Number Generation:**
```sql
SELECT generate_ticket_number();
-- Should return: WO-2025-000001 (or similar)
```

**5. Test Reference Number Generation:**
```sql
SELECT generate_reference_number();
-- Should return: #ABC123XYZ4567 (or similar)
```

---

## Phase 3: API Implementation

### Required API Endpoints

#### Events CRUD

**1. POST /api/whatson - Create Event**
```typescript
// Request Body
{
  title: string;
  location: string;
  is_online: boolean;
  is_paid: boolean;
  price_amount: number;
  price_currency: string;
  rsvp_deadline: string; // ISO 8601
  max_spots_per_person: number;
  total_spots: number | null;
  is_unlimited_spots: boolean;
  description: string;
  terms_conditions: string;
  thumbnail_url: string;
  hero_image_url: string;
  status: 'draft' | 'published';
  schedule: Array<{
    event_date: string; // YYYY-MM-DD
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    timezone: string;
  }>;
  tags: string[];
}

// Implementation Steps:
// 1. Validate auth (user must be authenticated)
// 2. Generate slug from title (ensure uniqueness)
// 3. Insert into whatson_events
// 4. Insert schedule slots into whatson_schedule
// 5. Insert tags into whatson_tags
// 6. Return complete event object with relations
```

**2. GET /api/whatson - List Events with Filters**
```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  keyword?: string; // Search title/description
  price?: 'free' | 'paid';
  is_online?: boolean;
  location?: string;
  status?: string;
  dateFrom?: string; // Filter by event dates
  dateTo?: string;
  tags?: string; // Comma-separated
  sortBy?: 'created_at' | 'rsvp_deadline' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Implementation Steps:
// 1. Build query with filters
// 2. Join with whatson_schedule for date filtering
// 3. Join with whatson_tags for tag filtering
// 4. Join with user_profiles for creator info
// 5. Count RSVPs per event
// 6. Apply pagination
// 7. Return events array with pagination metadata
```

**3. GET /api/whatson/my - User's Created Events**
```typescript
// Returns events created by authenticated user
// Similar to GET /api/whatson but filtered by created_by = auth.uid()
```

**4. GET /api/whatson/[id] - Event Details**
```typescript
// Implementation Steps:
// 1. Fetch event by ID (check RLS - published or owner)
// 2. Join with whatson_schedule (ordered by sort_order)
// 3. Join with whatson_tags
// 4. Join with user_profiles for creator info
// 5. Count RSVPs (total and by status)
// 6. If authenticated, check if user has RSVP'd
// 7. Return complete event object
```

**5. PATCH /api/whatson/[id] - Update Event**
```typescript
// Request Body (partial update)
{
  title?: string;
  location?: string;
  // ... other updatable fields
  schedule?: Array<Schedule>; // Replace all
  tags?: string[]; // Replace all
}

// Implementation Steps:
// 1. Validate auth (must be creator)
// 2. Update whatson_events
// 3. If schedule provided, delete old and insert new
// 4. If tags provided, delete old and insert new
// 5. Return updated event
```

**6. DELETE /api/whatson/[id] - Delete Event**
```typescript
// Implementation Steps:
// 1. Validate auth (must be creator)
// 2. Delete from whatson_events (cascades to schedule, tags, RSVPs)
// 3. Delete images from storage
// 4. Return success
```

---

#### RSVP Management

**7. POST /api/whatson/[id]/rsvp - Create RSVP**
```typescript
// Request Body
{
  number_of_spots: number;
  schedule_ids: string[]; // Selected date slots
}

// Implementation Steps:
// 1. Validate auth
// 2. Check event is published and not expired
// 3. Check user is not event creator
// 4. Check no existing RSVP
// 5. Check capacity (if not unlimited)
// 6. Check spots <= max_spots_per_person
// 7. Generate ticket_number and reference_number
// 8. Insert into whatson_rsvps
// 9. Insert selected dates into whatson_rsvp_dates
// 10. Return RSVP with ticket/reference numbers
```

**8. DELETE /api/whatson/[id]/rsvp - Cancel RSVP**
```typescript
// Implementation Steps:
// 1. Validate auth
// 2. Find user's RSVP for this event
// 3. Delete from whatson_rsvps (cascades to rsvp_dates)
// 4. Return success
```

**9. GET /api/whatson/[id]/rsvps - List RSVPs (Creator Only)**
```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  status?: 'confirmed' | 'cancelled' | 'waitlist';
  payment_status?: 'paid' | 'unpaid' | 'n/a';
}

// Implementation Steps:
// 1. Validate auth (must be event creator)
// 2. Fetch RSVPs for event
// 3. Join with user_profiles for attendee info
// 4. Join with whatson_rsvp_dates for selected dates
// 5. Apply filters and pagination
// 6. Return RSVP list with attendee details
```

**10. GET /api/whatson/rsvps/my - User's RSVPs**
```typescript
// Returns authenticated user's RSVPs
// Join with whatson_events for event details
// Join with whatson_rsvp_dates for selected dates
```

**11. GET /api/whatson/[id]/rsvps/export - Export RSVP Data (Creator Only)**
```typescript
// Format: CSV
// Columns: Name, Email, Ticket No, Reference, Status, Payment Status, Selected Dates
// Implementation:
// 1. Validate auth (must be creator)
// 2. Fetch all RSVPs with full details
// 3. Format as CSV
// 4. Return file download
```

---

#### Image Upload

**12. POST /api/upload/whatson-image - Upload Event Image**
```typescript
// Request: multipart/form-data
{
  file: File;
  event_id: string; // If updating existing event
}

// Implementation Steps:
// 1. Validate auth
// 2. Validate file (type, size)
// 3. Generate path: {user_id}/{event_id}/{filename}
// 4. Upload to whatson-images bucket
// 5. Get public URL
// 6. Return URL
```

---

## Phase 4: Frontend Integration

### Update API Calls

**1. Replace Hardcoded Data:**
- Replace `import { whatsOnEvents }` with API calls
- Remove `/data/whatsOnEvents.ts` dependency

**2. Browse Page (`/whats-on/page.tsx`):**
```typescript
// Fetch events with filters
const fetchEvents = async (filters) => {
  const params = new URLSearchParams({
    price: filters.price,
    is_online: filters.attendance === 'online',
    // ... other filters
  });
  
  const response = await fetch(`/api/whatson?${params}`);
  const { data } = await response.json();
  return data;
};
```

**3. Event Details (`/whats-on/[slug]/page.tsx`):**
```typescript
// Fetch by slug
const response = await fetch(`/api/whatson/${slug}`);
const { data: event } = await response.json();
```

**4. Create Event (`/whats-on/manage-whats-on/add-new/page.tsx`):**
```typescript
// Upload images first
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/whatson-image', {
    method: 'POST',
    body: formData,
  });
  
  const { data } = await response.json();
  return data.url;
};

// Create event
const createEvent = async (eventData) => {
  const response = await fetch('/api/whatson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  
  const { data } = await response.json();
  return data;
};
```

**5. RSVP (`components/rsvp.tsx`):**
```typescript
const handleRSVP = async (selectedDates, attendees) => {
  const response = await fetch(`/api/whatson/${eventId}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      number_of_spots: attendees.length,
      schedule_ids: selectedDates,
    }),
  });
  
  const { data } = await response.json();
  // Show ticket number and reference
  alert(`RSVP Confirmed! Ticket: ${data.ticket_number}`);
};
```

---

## Phase 5: Testing

### Manual Testing Checklist

**Event Creation:**
- [ ] Create draft event
- [ ] Create published event
- [ ] Upload thumbnail and hero image
- [ ] Add multiple schedule slots
- [ ] Add tags
- [ ] Set capacity limits
- [ ] Set RSVP deadline

**Event Browsing:**
- [ ] View all published events
- [ ] Filter by free/paid
- [ ] Filter by online/in-person
- [ ] Filter by location
- [ ] Filter by date range
- [ ] Search by keyword
- [ ] Sort by date

**Event Details:**
- [ ] View event details by slug
- [ ] See all schedule slots
- [ ] See tags
- [ ] See creator info
- [ ] View RSVP count

**RSVP:**
- [ ] RSVP to event
- [ ] Select multiple dates
- [ ] View ticket number
- [ ] View reference number
- [ ] Cannot RSVP to own event
- [ ] Cannot RSVP after deadline
- [ ] Cannot exceed capacity
- [ ] Cancel RSVP

**RSVP Management:**
- [ ] View all RSVPs for own event
- [ ] See attendee details
- [ ] Filter by status
- [ ] Filter by payment
- [ ] Export RSVP data
- [ ] Update payment status

### API Testing with cURL

**Create Event:**
```bash
curl -X POST https://your-project.supabase.co/rest/v1/whatson_events \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_USER_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Test Event",
    "location": "Dubai, UAE",
    "is_online": false,
    "is_paid": false,
    "description": "Test event description",
    "status": "published"
  }'
```

**List Events:**
```bash
curl https://your-project.supabase.co/rest/v1/whatson_events?status=eq.published \\
  -H "apikey: YOUR_ANON_KEY"
```

---

## Phase 6: Update Documentation

### Update UPDATED_BACKEND_ARCHITECTURE.md

Add What's On section with:
- Table descriptions (5 tables)
- RLS policies (25 policies)
- Indexes (27+ indexes)
- Storage bucket (whatson-images)
- API endpoints (12 endpoints)
- Data flow examples

**Location in doc:** After Slate section, before final sections

---

## Common Issues & Solutions

### Issue 1: Slug Already Exists
**Solution:** Append number to slug (e.g., "event-title-2")

```sql
-- Check if slug exists
SELECT COUNT(*) FROM whatson_events WHERE slug = 'event-title';
-- If > 0, try 'event-title-2', 'event-title-3', etc.
```

### Issue 2: Cannot RSVP (Capacity Full)
**Solution:** Check current capacity before allowing RSVP

```sql
-- Get current RSVP count
SELECT SUM(number_of_spots) as total_rsvps
FROM whatson_rsvps
WHERE event_id = 'event-uuid' AND status = 'confirmed';

-- Compare with total_spots
```

### Issue 3: RSVP After Deadline
**Solution:** Validate deadline on server side

```sql
-- Check if RSVP deadline passed
SELECT rsvp_deadline < NOW() as is_expired
FROM whatson_events
WHERE id = 'event-uuid';
```

### Issue 4: Image Upload Fails
**Solution:** Check storage policies and file size

```sql
-- Verify storage policies
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%whatson%';
```

---

## Next Steps After Implementation

1. **Performance Monitoring:**
   - Monitor slow queries
   - Check index usage
   - Optimize as needed

2. **Add Features:**
   - Email notifications for RSVPs
   - Calendar integration (iCal export)
   - Event reminders
   - Wait list management
   - Event analytics dashboard

3. **Security Audit:**
   - Test RLS policies thoroughly
   - Check for injection vulnerabilities
   - Validate all user inputs

4. **User Testing:**
   - Get feedback from real users
   - Track usage metrics
   - Iterate on UX improvements

---

## Support

For issues or questions:
1. Check existing Supabase documentation
2. Review RLS policy errors in Supabase logs
3. Test queries in Supabase SQL Editor
4. Verify authentication tokens

---

## Summary Checklist

- [ ] Phase 1: Database setup complete (tables, RLS, indexes, storage)
- [ ] Phase 2: Database verification passed
- [ ] Phase 3: API endpoints implemented (12 endpoints)
- [ ] Phase 4: Frontend integration complete
- [ ] Phase 5: Testing completed
- [ ] Phase 6: Documentation updated
- [ ] Ready for production deployment

---

**Total Implementation Time:** 8-12 hours
**Complexity:** Medium
**Dependencies:** Supabase Auth, Storage, PostgreSQL
