# What's On Feature - Architecture Document Update

This file contains the complete section to be added to `UPDATED_BACKEND_ARCHITECTURE.md`

---

## INSERT AFTER SLATE TABLES SECTION (after line ~650)

---

#### WHAT'S ON TABLES (5 Tables) ⭐ NEW v2.5

##### 30. `whatson_events`
Main table for What's On events where users create and manage events.

**Key Fields:**
- `id` (UUID, PK) - Unique event identifier
- `created_by` (UUID, FK → auth.users) - Event creator
- `title` (TEXT, NOT NULL) - Event name (3-200 chars)
- `slug` (TEXT, NOT NULL, UNIQUE) - URL-friendly identifier
- `location` (TEXT) - Venue name/address
- `is_online` (BOOLEAN) - Online or in-person flag
- `is_paid` (BOOLEAN) - Free or paid event
- `price_amount` (INTEGER) - Price value (default 0)
- `price_currency` (TEXT) - Currency code (default AED)
- `rsvp_deadline` (TIMESTAMPTZ) - Last date to RSVP
- `max_spots_per_person` (INTEGER) - Booking limit per user (default 1)
- `total_spots` (INTEGER) - Total capacity (NULL if unlimited)
- `is_unlimited_spots` (BOOLEAN) - Unlimited capacity flag
- `description` (TEXT, NOT NULL) - Event details (max 10000 chars)
- `terms_conditions` (TEXT) - Terms and conditions
- `thumbnail_url` (TEXT) - Card image URL
- `hero_image_url` (TEXT) - Detail page banner URL
- `status` (TEXT) - 'draft' | 'published' | 'cancelled'
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Constraints:**
- CHECK: Title length between 3-200 characters
- CHECK: Location required if not online
- CHECK: Total spots required if not unlimited
- CHECK: Status must be draft/published/cancelled
- UNIQUE: slug

**Indexes:**
- `idx_whatson_events_created_by` on `created_by` - User's events
- `idx_whatson_events_status` on `status` - Filter by status
- `idx_whatson_events_status_created` on `(status, created_at DESC)` - Browse sorting
- `idx_whatson_events_slug` on `slug` - Slug lookups
- `idx_whatson_events_location` on `location` - Location filtering
- `idx_whatson_events_is_online` on `is_online` - Attendance mode
- `idx_whatson_events_is_paid` on `is_paid` - Price filtering
- `idx_whatson_events_rsvp_deadline` on `rsvp_deadline` - Deadline queries
- `idx_whatson_events_browse` on `(status, is_paid, is_online, created_at)` - Common browse query
- Full-text search index on `(title, description)` - Keyword search

##### 31. `whatson_schedule`
Event date and time slots (multiple per event).

**Key Fields:**
- `id` (UUID, PK)
- `event_id` (UUID, FK → whatson_events)
- `event_date` (DATE, NOT NULL) - Event date
- `start_time` (TIME, NOT NULL) - Start time
- `end_time` (TIME, NOT NULL) - End time
- `timezone` (TEXT, NOT NULL) - Timezone code (default GST)
- `sort_order` (INTEGER) - Display order
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- CHECK: `end_time > start_time`
- ON DELETE CASCADE: Removed when event deleted

**Indexes:**
- `idx_whatson_schedule_event_id` on `event_id` - Join with events
- `idx_whatson_schedule_event_sort` on `(event_id, sort_order)` - Sorted slots
- `idx_whatson_schedule_date` on `event_date` - Date filtering
- `idx_whatson_schedule_event_date` on `(event_id, event_date)` - Event date queries

##### 32. `whatson_tags`
Tags for categorizing and discovering events.

**Key Fields:**
- `id` (UUID, PK)
- `event_id` (UUID, FK → whatson_events)
- `tag_name` (TEXT, NOT NULL) - Tag value (1-50 chars)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(event_id, tag_name) - No duplicate tags per event
- ON DELETE CASCADE: Removed when event deleted

**Indexes:**
- `idx_whatson_tags_event_id` on `event_id` - Join with events
- `idx_whatson_tags_name` on `tag_name` - Tag filtering
- `idx_whatson_tags_name_lower` on `LOWER(tag_name)` - Case-insensitive search

##### 33. `whatson_rsvps`
User RSVPs to events with ticket generation.

**Key Fields:**
- `id` (UUID, PK)
- `event_id` (UUID, FK → whatson_events)
- `user_id` (UUID, FK → auth.users) - Attendee
- `ticket_number` (TEXT, NOT NULL, UNIQUE) - Auto-generated (WO-2025-NNNNNN)
- `reference_number` (TEXT, NOT NULL, UNIQUE) - Auto-generated (#ALPHANUMERIC13)
- `number_of_spots` (INTEGER, NOT NULL) - Spots booked (default 1)
- `payment_status` (TEXT, NOT NULL) - 'paid' | 'unpaid' | 'n/a'
- `status` (TEXT, NOT NULL) - 'confirmed' | 'cancelled' | 'waitlist'
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(event_id, user_id) - One RSVP per user per event
- CHECK: `number_of_spots >= 1`
- CHECK: `payment_status IN ('paid', 'unpaid', 'n/a')`
- CHECK: `status IN ('confirmed', 'cancelled', 'waitlist')`
- ON DELETE CASCADE: Removed when event or user deleted

**Indexes:**
- `idx_whatson_rsvps_event_id` on `event_id` - Event RSVPs
- `idx_whatson_rsvps_user_id` on `user_id` - User's RSVPs
- `idx_whatson_rsvps_status` on `status` - Status filtering
- `idx_whatson_rsvps_payment_status` on `payment_status` - Payment filtering
- `idx_whatson_rsvps_event_status` on `(event_id, status, created_at)` - RSVP management
- `idx_whatson_rsvps_ticket_number` on `ticket_number` - Ticket lookups
- `idx_whatson_rsvps_reference_number` on `reference_number` - Reference lookups
- `idx_whatson_rsvps_user_active` on `(user_id, status, created_at)` - Active RSVPs

##### 34. `whatson_rsvp_dates`
Tracks which event dates an attendee selected for their RSVP.

**Key Fields:**
- `id` (UUID, PK)
- `rsvp_id` (UUID, FK → whatson_rsvps)
- `schedule_id` (UUID, FK → whatson_schedule)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(rsvp_id, schedule_id) - No duplicate date selections
- ON DELETE CASCADE: Removed when RSVP or schedule deleted

**Indexes:**
- `idx_whatson_rsvp_dates_rsvp_id` on `rsvp_id` - Join with RSVPs
- `idx_whatson_rsvp_dates_schedule_id` on `schedule_id` - Date selection queries

---

## INSERT IN STORAGE BUCKETS SECTION (after slate-media bucket)

### 6. `whatson-images/` (Public) ⭐ NEW v2.5
- **Purpose:** Event thumbnails and hero images for What's On
- **Max Size:** 5 MB
- **Allowed Types:** JPEG, JPG, PNG, WebP
- **Path Structure:** `{user_id}/{event_id}/{filename}`
- **Access:** Public read, Authenticated write (own folder only)
- **Used For:** `whatson_events.thumbnail_url`, `whatson_events.hero_image_url`

---

## INSERT IN API ARCHITECTURE SECTION (after slate routes)

```
└── whatson/ ⭐ NEW (v2.5)
    ├── route.js                             # POST create, GET list all
    ├── my/route.js                          # GET user's events
    └── [id]/
        ├── route.js                         # GET details, PATCH update, DELETE
        └── rsvp/
            ├── route.js                     # POST create, DELETE cancel
            ├── my/route.js                  # GET user's RSVPs
            └── list/route.js                # GET event RSVPs (creator only)
```

---

## UPDATE CORE TABLES COUNT

Change:
```
### Core Tables (29 Total) ⭐ UPDATED v2.4
```

To:
```
### Core Tables (34 Total) ⭐ UPDATED v2.5
```

---

## UPDATE TECHNOLOGY STACK VERSION

Change:
```
**Version:** 2.4 (Updated with Slate Group Social Media Feature)
```

To:
```
**Version:** 2.5 (Updated with What's On Events Feature)
```

---

## ADD TO SYSTEM ARCHITECTURE DIAGRAM

Update the count in the diagram:
```
│  │  - 22 Tables with Relationships ⭐ UPDATED v2.2           │      │
```

To:
```
│  │  - 34 Tables with Relationships ⭐ UPDATED v2.5           │      │
```

---

## INSERT NEW SECTION AFTER SLATE FEATURE

---

## 🎭 What's On Feature Overview (v2.5) ⭐ NEW

### Purpose
The What's On feature is an events platform where users can:
- Create and manage events with multi-date scheduling
- Browse and discover events with advanced filters
- RSVP to events with date selection
- Track capacity and manage spots
- Generate ticket and reference numbers automatically
- Export RSVP data for event management
- Upload event images (thumbnails and hero banners)

### Frontend Location
- **Path:** `/app/(app)/(whatson)/`
- **Main Pages:**
  - `/whats-on` - Browse all events with filters
  - `/whats-on/[slug]` - Event detail page with RSVP
  - `/whats-on/manage-whats-on` - User's events dashboard
  - `/whats-on/manage-whats-on/add-new` - Create new event
  - `/whats-on/manage-whats-on/[id]` - Edit event and manage RSVPs

### User Features

#### For All Users
1. **Browse Events:**
   - View all published events
   - Search by keyword in title/description
   - Filter by price (free/paid)
   - Filter by attendance mode (online/in-person)
   - Filter by location
   - Filter by date range
   - Filter by tags
   - Sort by date or title
   - Pagination support

2. **Event Details:**
   - View complete event information
   - See all scheduled dates and times
   - View host information
   - See tags and description
   - View capacity (spots filled/total)
   - Check RSVP deadline

3. **RSVP System:**
   - RSVP to events
   - Select specific dates to attend
   - Book multiple spots (up to max per person)
   - Receive ticket and reference numbers
   - View own RSVPs
   - Cancel RSVPs

#### For Event Creators
1. **Create Events:**
   - Set title, location, online/in-person
   - Set pricing (free or paid with amount)
   - Configure capacity (unlimited or limited)
   - Set max spots per person
   - Set RSVP deadline
   - Add multiple schedule slots with dates/times
   - Upload thumbnail and hero images
   - Write description and terms & conditions
   - Add tags for discovery
   - Save as draft or publish immediately

2. **Manage Events:**
   - View all created events
   - Edit event details
   - Update schedule, pricing, capacity
   - Change event status
   - Delete events

3. **RSVP Management:**
   - View all RSVPs for their events
   - See attendee details (name, ticket, reference)
   - Filter by RSVP status (confirmed/cancelled/waitlist)
   - Filter by payment status (paid/unpaid)
   - Track spots filled vs total capacity
   - See which dates each attendee selected
   - Update payment status
   - Export RSVP data to CSV

### Backend Implementation

#### Database Tables (5 New Tables)

**1. whatson_events (Main table)**
- Event information with creator, title, slug, location
- Pricing details (is_paid, amount, currency)
- Capacity management (total_spots, max_per_person, unlimited)
- RSVP deadline and status (draft/published/cancelled)
- Images (thumbnail_url, hero_image_url)
- Description and terms & conditions

**2. whatson_schedule (Date/time slots)**
- Multiple slots per event
- Date, start time, end time, timezone
- Sort order for display
- Supports multi-day events

**3. whatson_tags (Tag system)**
- Many-to-many relationship with events
- Case-insensitive tag search
- Tag-based discovery

**4. whatson_rsvps (User bookings)**
- Links users to events
- Auto-generated ticket numbers (WO-2025-NNNNNN)
- Auto-generated reference numbers (#ALPHANUMERIC13)
- Number of spots booked
- Payment and confirmation status
- One RSVP per user per event

**5. whatson_rsvp_dates (Date selections)**
- Tracks which specific dates attendee selected
- Links RSVPs to schedule slots
- Supports multi-date attendance

#### Storage Bucket

**whatson-images/ (Public)**
- **Purpose:** Event images (thumbnails and hero banners)
- **Max Size:** 5 MB per file
- **Allowed Types:** JPEG, JPG, PNG, WebP
- **Path Structure:** `{user_id}/{event_id}/{filename}`
- **Access Control:**
  - Public read access (anyone can view)
  - Authenticated write to own folder
  - File size and type validation enforced

#### API Endpoints (12 Total)

**Events CRUD (6 endpoints):**
1. `POST /api/whatson` - Create new event
2. `GET /api/whatson` - List all events with filters and pagination
3. `GET /api/whatson/my` - Get user's created events
4. `GET /api/whatson/[id]` - Get event details by ID or slug
5. `PATCH /api/whatson/[id]` - Update event (owner only)
6. `DELETE /api/whatson/[id]` - Delete event (owner only)

**RSVP Management (5 endpoints):**
7. `POST /api/whatson/[id]/rsvp` - Create RSVP with date selection
8. `DELETE /api/whatson/[id]/rsvp` - Cancel own RSVP
9. `GET /api/whatson/[id]/rsvps` - List event RSVPs (creator only)
10. `GET /api/whatson/rsvps/my` - Get user's RSVPs
11. `GET /api/whatson/[id]/rsvps/export` - Export RSVP data to CSV (creator only)

**Image Upload (1 endpoint):**
12. `POST /api/upload/whatson-image` - Upload event images

#### Row Level Security (25 Policies)

**whatson_events (5 policies):**
- ✅ Public can view published events
- ✅ Users can view own events (all statuses)
- ✅ Authenticated users can create events
- ✅ Users can update own events
- ✅ Users can delete own events

**whatson_schedule (5 policies):**
- ✅ Public can view published event schedules
- ✅ Users can view own event schedules
- ✅ Event creators can add schedules
- ✅ Event creators can update schedules
- ✅ Event creators can delete schedules

**whatson_tags (4 policies):**
- ✅ Public can view published event tags
- ✅ Users can view own event tags
- ✅ Event creators can add tags
- ✅ Event creators can delete tags

**whatson_rsvps (6 policies):**
- ✅ Users can view own RSVPs
- ✅ Event creators can view event RSVPs
- ✅ Users can create RSVPs (with validations)
- ✅ Users cannot RSVP to own events
- ✅ Users can update own RSVPs
- ✅ Event creators can update payment status

**whatson_rsvp_dates (5 policies):**
- ✅ Users can view own RSVP dates
- ✅ Event creators can view event RSVP dates
- ✅ Users can add dates to own RSVPs
- ✅ Users can update own RSVP dates
- ✅ Users can delete own RSVP dates

#### Performance Indexes (27+)

**whatson_events indexes:**
- Filter by creator, status, location, pricing, attendance mode
- Full-text search on title and description
- Composite indexes for common browse queries
- Slug lookups for event detail pages
- RSVP deadline queries

**whatson_schedule indexes:**
- Join optimization with events
- Date range filtering
- Sort order optimization

**whatson_tags indexes:**
- Join optimization with events
- Tag name filtering
- Case-insensitive search

**whatson_rsvps indexes:**
- Join optimization with events and users
- Status and payment filtering
- Ticket and reference number lookups
- RSVP management queries

**whatson_rsvp_dates indexes:**
- Join optimization with RSVPs and schedule
- Date selection queries

### API Request/Response Examples

#### Create Event
**Request:**
```json
POST /api/whatson
{
  \"title\": \"Movie Makers' Meetup: Bi-Weekly Q&A\",
  \"location\": \"Dubai, UAE\",
  \"is_online\": false,
  \"is_paid\": true,
  \"price_amount\": 100,
  \"price_currency\": \"AED\",
  \"rsvp_deadline\": \"2025-10-23T23:59:59Z\",
  \"max_spots_per_person\": 3,
  \"total_spots\": 150,
  \"is_unlimited_spots\": false,
  \"description\": \"Filmmaking Q&A - Bi-weekly event for all your filmmaking questions.\",
  \"terms_conditions\": \"By attending, you agree to...\",
  \"thumbnail_url\": \"https://project.supabase.co/storage/...\",
  \"hero_image_url\": \"https://project.supabase.co/storage/...\",
  \"status\": \"published\",
  \"schedule\": [
    {
      \"event_date\": \"2025-10-26\",
      \"start_time\": \"21:00\",
      \"end_time\": \"22:00\",
      \"timezone\": \"GST\"
    }
  ],
  \"tags\": [\"Movie\", \"Film\", \"Filmmaking\", \"Q&A\"]
}
```

**Response:**
```json
{
  \"success\": true,
  \"message\": \"Event created successfully\",
  \"data\": {
    \"id\": \"550e8400-e29b-41d4-a716-446655440000\",
    \"slug\": \"movie-makers-meetup-bi-weekly-q-a\",
    \"title\": \"Movie Makers' Meetup: Bi-Weekly Q&A\",
    \"location\": \"Dubai, UAE\",
    \"is_online\": false,
    \"is_paid\": true,
    \"price_label\": \"100 AED\",
    \"status\": \"published\",
    \"created_at\": \"2025-01-15T10:00:00.000Z\",
    \"schedule\": [...],
    \"tags\": [\"Movie\", \"Film\", \"Filmmaking\", \"Q&A\"]
  }
}
```

#### List Events with Filters
**Request:**
```
GET /api/whatson?page=1&limit=20&price=paid&is_online=false&location=Dubai&status=published&sortBy=created_at&sortOrder=desc
```

**Response:**
```json
{
  \"success\": true,
  \"data\": {
    \"events\": [
      {
        \"id\": \"550e8400-e29b-41d4-a716-446655440000\",
        \"slug\": \"movie-makers-meetup-bi-weekly-q-a\",
        \"title\": \"Movie Makers' Meetup: Bi-Weekly Q&A\",
        \"location\": \"Dubai, UAE\",
        \"is_online\": false,
        \"is_paid\": true,
        \"price_label\": \"100 AED\",
        \"date_range_label\": \"Oct 15, 2025 - Oct 18, 2025\",
        \"rsvp_deadline\": \"Sun, Oct 23 2025\",
        \"thumbnail_url\": \"https://...\",
        \"host\": {
          \"name\": \"Cinema Studio\",
          \"avatar\": \"https://...\"
        },
        \"spots_filled\": 95,
        \"total_spots\": 150,
        \"tags\": [\"Movie\", \"Film\", \"Filmmaking\"]
      }
    ],
    \"pagination\": {
      \"current_page\": 1,
      \"total_pages\": 5,
      \"total_events\": 87,
      \"limit\": 20
    }
  }
}
```

#### Create RSVP
**Request:**
```json
POST /api/whatson/{event_id}/rsvp
{
  \"number_of_spots\": 2,
  \"schedule_ids\": [
    \"schedule-uuid-1\",
    \"schedule-uuid-2\"
  ]
}
```

**Response:**
```json
{
  \"success\": true,
  \"message\": \"RSVP confirmed successfully\",
  \"data\": {
    \"id\": \"rsvp-uuid\",
    \"event_id\": \"event-uuid\",
    \"user_id\": \"user-uuid\",
    \"ticket_number\": \"WO-2025-000123\",
    \"reference_number\": \"#ABC123XYZ4567\",
    \"number_of_spots\": 2,
    \"status\": \"confirmed\",
    \"payment_status\": \"unpaid\",
    \"selected_dates\": [
      {\"date\": \"2025-10-26\", \"time\": \"21:00 - 22:00 GST\"}
    ]
  }
}
```

### Data Relationships

```
auth.users
    │
    ├──[1:N]──> whatson_events (created events)
    │               │
    │               ├──[1:N]──> whatson_schedule (event dates/times)
    │               ├──[1:N]──> whatson_tags (event tags)
    │               └──[1:N]──> whatson_rsvps (event RSVPs)
    │
    └──[1:N]──> whatson_rsvps (user RSVPs)
                    │
                    └──[1:N]──> whatson_rsvp_dates (selected dates)
```

### Data Flow Examples

#### Creating an Event
```
1. User uploads images → POST /api/upload/whatson-image
2. Backend validates file (size < 5MB, type = JPEG/PNG/WebP)
3. Backend stores in whatson-images/{user_id}/{temp-id}/{filename}
4. Backend returns public URLs
5. User submits form → POST /api/whatson with image URLs
6. Backend validates auth and required fields
7. Backend generates URL-friendly slug from title
8. Backend inserts into whatson_events
9. Backend inserts schedule slots into whatson_schedule (batch)
10. Backend inserts tags into whatson_tags (batch)
11. Backend returns complete event object with slug
12. Frontend redirects to /whats-on/manage-whats-on
```

#### Creating an RSVP
```
1. User clicks \"Count me in!\" → Opens RSVP modal
2. User selects dates and fills attendee info
3. User submits → POST /api/whatson/[id]/rsvp
4. Backend validates:
   - User is authenticated
   - Event exists and is published
   - RSVP deadline not passed
   - User is not the event creator (RLS check)
   - User hasn't already RSVP'd (unique constraint)
   - Requested spots <= max_spots_per_person
   - Available capacity (if not unlimited)
5. Backend generates ticket_number (WO-2025-NNNNNN)
6. Backend generates reference_number (#ALPHANUMERIC13)
7. Backend inserts into whatson_rsvps
8. Backend inserts selected dates into whatson_rsvp_dates
9. Backend returns RSVP details with ticket/reference
10. Frontend shows confirmation with ticket number
11. Frontend updates event capacity display
```

#### Managing RSVPs (Event Creator)
```
1. Creator clicks event → /whats-on/manage-whats-on/[id]
2. Request GET /api/whatson/[id]/rsvps
3. Backend validates ownership (RLS)
4. Backend queries whatson_rsvps with JOINs:
   - user_profiles (attendee name, avatar)
   - whatson_rsvp_dates (selected dates)
   - whatson_schedule (date details)
5. Backend returns paginated list with full attendee info
6. Frontend renders RSVP table with:
   - Attendee name and avatar
   - Ticket number
   - Reference number
   - Payment status
   - Selected dates
7. Creator can filter by status/payment
8. Creator can export to CSV
9. Creator can update payment status
```

### Validation Rules

**Event Creation:**
- Title: 3-200 characters
- Location: Required if not online
- RSVP deadline: Must be before event dates
- Total spots: Min 1 (if not unlimited)
- Max spots per person: Min 1, max <= total_spots
- Schedule: At least one slot required
- Description: Max 10000 characters
- Images: Max 5MB each, JPEG/PNG/WebP only

**RSVP:**
- User cannot RSVP to own event (RLS check)
- Cannot RSVP after deadline
- Cannot exceed max spots per person
- Cannot exceed total capacity (unless unlimited)
- Must select at least one date
- No duplicate RSVPs per event (unique constraint)

### Helper Functions

**1. generate_ticket_number()**
- Format: WO-YYYY-NNNNNN (e.g., WO-2025-000123)
- Incremental counter with year prefix
- Uniqueness guaranteed via loop check

**2. generate_reference_number()**
- Format: #ALPHANUMERIC13 (e.g., #ABC123XYZ4567)
- Random uppercase alphanumeric string
- Uniqueness guaranteed via loop check

**3. update_whatson_updated_at()**
- Auto-updates `updated_at` timestamp
- Applied to whatson_events and whatson_rsvps

### Implementation Guide

See complete step-by-step implementation guide:
- **`backend-command/whatson/README.md`** - Overview and quick start (START HERE)
- **`backend-command/whatson/00_ANALYSIS.md`** - Frontend analysis and requirements
- **`backend-command/whatson/01_CREATE_TABLES.sql`** - Database table creation SQL
- **`backend-command/whatson/02_RLS_POLICIES.sql`** - Row Level Security policies SQL
- **`backend-command/whatson/03_INDEXES.sql`** - Performance optimization indexes SQL
- **`backend-command/whatson/04_STORAGE_BUCKET.sql`** - Storage bucket setup SQL
- **`backend-command/whatson/05_IMPLEMENTATION_GUIDE.md`** - Step-by-step guide with API specs

### Implementation Checklist

**Phase 1: Database Setup**
- [ ] Execute 01_CREATE_TABLES.sql (creates 5 tables)
- [ ] Execute 02_RLS_POLICIES.sql (applies 25 security policies)
- [ ] Execute 03_INDEXES.sql (creates 27+ performance indexes)
- [ ] Execute 04_STORAGE_BUCKET.sql (creates whatson-images bucket)
- [ ] Verify tables, policies, indexes, and storage bucket

**Phase 2: API Implementation**
- [ ] Implement POST /api/whatson (create event)
- [ ] Implement GET /api/whatson (list with filters)
- [ ] Implement GET /api/whatson/my (user's events)
- [ ] Implement GET /api/whatson/[id] (event details)
- [ ] Implement PATCH /api/whatson/[id] (update event)
- [ ] Implement DELETE /api/whatson/[id] (delete event)
- [ ] Implement POST /api/whatson/[id]/rsvp (create RSVP)
- [ ] Implement DELETE /api/whatson/[id]/rsvp (cancel RSVP)
- [ ] Implement GET /api/whatson/[id]/rsvps (list RSVPs)
- [ ] Implement GET /api/whatson/rsvps/my (user's RSVPs)
- [ ] Implement GET /api/whatson/[id]/rsvps/export (export data)
- [ ] Implement POST /api/upload/whatson-image (upload images)

**Phase 3: Frontend Integration**
- [ ] Update /whats-on page (replace hardcoded data)
- [ ] Update /whats-on/[slug] page (event details)
- [ ] Update /whats-on/manage-whats-on page (user's events)
- [ ] Update /whats-on/manage-whats-on/add-new page (create event)
- [ ] Update /whats-on/manage-whats-on/[id] page (edit + RSVPs)
- [ ] Update RSVP component (create/cancel RSVP)
- [ ] Add loading states and error handling
- [ ] Test all user flows end-to-end

**Phase 4: Testing**
- [ ] Test event creation with all fields
- [ ] Test image uploads
- [ ] Test event browsing and filtering
- [ ] Test RSVP creation and cancellation
- [ ] Test capacity management
- [ ] Test RLS policies (unauthorized actions)
- [ ] Test RSVP management for creators
- [ ] Test export functionality
- [ ] Performance test with large dataset

### Implementation Status
- ✅ Frontend UI complete with hardcoded data
- ✅ Backend architecture designed and documented
- ✅ Database schema created (5 tables, complete SQL)
- ✅ RLS policies designed (25 policies, complete SQL)
- ✅ Performance indexes designed (27+ indexes, complete SQL)
- ✅ Storage bucket configured (complete SQL)
- ✅ Helper functions created (ticket/reference generation)
- ✅ API endpoints documented (12 endpoints with examples)
- ✅ Implementation guide ready (step-by-step)
- ⏳ Database migration pending (run SQL files in order)
- ⏳ API routes implementation pending
- ⏳ Frontend-backend integration pending

### Integration with Existing System
The What's On feature integrates seamlessly with:
- **auth.users** - User authentication and event creators
- **user_profiles** - User names, avatars for display
- **Storage system** - Uses existing Supabase Storage infrastructure
- No conflicts with existing tables or features

### Security Features
- ✅ Row Level Security (RLS) on all tables
- ✅ JWT token authentication via Supabase Auth
- ✅ Ownership validation (users can only modify own events)
- ✅ File upload validation (size, type, ownership)
- ✅ Anti-fraud (cannot RSVP to own events)
- ✅ Unique constraints (no duplicate RSVPs)
- ✅ Public read for published events, private for drafts
- ✅ Capacity validation before RSVP
- ✅ Deadline validation before RSVP

### Performance Features
- ✅ Database indexes on all foreign keys
- ✅ Composite indexes for common queries
- ✅ Full-text search indexes for title/description
- ✅ Pagination support on all list endpoints
- ✅ Query optimization with selective field fetching
- ✅ Storage optimization (5MB limit, optimized paths)
- ✅ Auto-generated ticket numbers (efficient counter)
- ✅ Cached RSVP counts for capacity tracking

---
