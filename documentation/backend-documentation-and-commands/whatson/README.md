# What's On Feature - Backend Implementation

## 📚 Overview

This folder contains complete SQL commands and documentation for implementing the **What's On** events feature backend to match the existing frontend in `/app/(app)/(whatson)/`.

**Purpose:** Enable users to discover, create, manage, and RSVP to events with multi-date scheduling and capacity management.

---

## 📁 Files in This Folder

| File | Purpose | Status |
|------|---------|--------|
| `00_ANALYSIS.md` | Frontend analysis and data requirements | ✅ Complete |
| `01_CREATE_TABLES.sql` | Create all database tables (5 tables) | ✅ Ready to execute |
| `02_RLS_POLICIES.sql` | Row Level Security policies (25 policies) | ✅ Ready to execute |
| `03_INDEXES.sql` | Performance indexes (27+ indexes) | ✅ Ready to execute |
| `04_STORAGE_BUCKET.sql` | Storage bucket configuration | ✅ Ready to execute |
| `05_IMPLEMENTATION_GUIDE.md` | Step-by-step implementation guide | ✅ Complete |
| `README.md` | This file | ✅ Complete |

---

## 🚀 Quick Start

### Prerequisites
- Supabase project with database access
- Supabase Storage enabled
- Authentication set up (Supabase Auth)

### Execute in Order

**1. Create Tables (5 tables)**
```bash
# Copy contents of 01_CREATE_TABLES.sql into Supabase SQL Editor
# Execute the SQL
```

**2. Apply RLS Policies (25 policies)**
```bash
# Copy contents of 02_RLS_POLICIES.sql
# Execute the SQL
```

**3. Create Indexes (27+ indexes)**
```bash
# Copy contents of 03_INDEXES.sql
# Execute the SQL
```

**4. Set Up Storage (1 bucket)**
```bash
# Copy contents of 04_STORAGE_BUCKET.sql
# Execute the SQL
```

**5. Verify Setup**
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'whatson_%';

-- Check policies (should return 25)
SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE 'whatson_%';

-- Check indexes (should return 27+)
SELECT COUNT(*) FROM pg_indexes WHERE tablename LIKE 'whatson_%';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'whatson-images';
```

**Expected Results:**
- ✅ 5 tables created
- ✅ 25 RLS policies active
- ✅ 27+ indexes created
- ✅ 1 storage bucket configured

---

## 📊 Database Schema

### Core Tables

**1. whatson_events (Main Events Table)**
- Event details (title, location, pricing, capacity, RSVP deadline)
- Creator reference (FK → auth.users)
- Status (draft/published/cancelled)
- Images (thumbnail_url, hero_image_url)

**2. whatson_schedule (Event Date/Time Slots)**
- Multiple dates per event
- Date, start/end time, timezone
- Sort order for display

**3. whatson_tags (Event Tags)**
- Tag-based discovery
- Many-to-many with events

**4. whatson_rsvps (User RSVPs)**
- User bookings with ticket numbers
- Number of spots booked
- Payment and confirmation status
- Auto-generated ticket and reference numbers

**5. whatson_rsvp_dates (RSVP Date Selections)**
- Tracks which dates attendee selected
- Links RSVPs to specific schedule slots

### Relationships

```
auth.users
    ├──[1:N]──> whatson_events (created events)
    └──[1:N]──> whatson_rsvps (user RSVPs)

whatson_events
    ├──[1:N]──> whatson_schedule (event dates)
    ├──[1:N]──> whatson_tags (event tags)
    └──[1:N]──> whatson_rsvps (event RSVPs)

whatson_rsvps
    └──[1:N]──> whatson_rsvp_dates (selected dates)
```

---

## 🔐 Security (RLS Policies)

### whatson_events (5 policies)
- ✅ Public can view published events
- ✅ Users can view own events (all statuses)
- ✅ Authenticated users can create events
- ✅ Users can update own events
- ✅ Users can delete own events

### whatson_schedule (5 policies)
- ✅ Public can view published event schedules
- ✅ Users can view own event schedules
- ✅ Event creators can add/update/delete schedules

### whatson_tags (4 policies)
- ✅ Public can view published event tags
- ✅ Users can view own event tags
- ✅ Event creators can add/delete tags

### whatson_rsvps (6 policies)
- ✅ Users can view own RSVPs
- ✅ Event creators can view event RSVPs
- ✅ Users can create RSVPs (with validations)
- ✅ Users cannot RSVP to own events
- ✅ Users can update/cancel own RSVPs
- ✅ Event creators can update payment status

### whatson_rsvp_dates (5 policies)
- ✅ Users can view/add/update/delete own RSVP dates
- ✅ Event creators can view RSVP dates for their events

---

## 📦 Storage Configuration

**Bucket:** `whatson-images` (Public)
- **Purpose:** Event thumbnails and hero images
- **Max Size:** 5 MB per file
- **Allowed Types:** JPEG, JPG, PNG, WebP
- **Path Structure:** `{user_id}/{event_id}/{filename}`
- **Access:** Public read, Authenticated write (own folder)

---

## 🛠️ Features Supported

### Event Creation
- ✅ Basic info (title, location, online/in-person)
- ✅ Pricing (free/paid with amount and currency)
- ✅ Capacity management (unlimited or limited)
- ✅ Max spots per person
- ✅ RSVP deadline
- ✅ Multiple schedule slots with dates/times/timezones
- ✅ Rich description and terms & conditions
- ✅ Multiple tags for discovery
- ✅ Image uploads (thumbnail and hero)
- ✅ Draft/published/cancelled status

### Event Discovery
- ✅ Browse all published events
- ✅ Search by keyword (title/description)
- ✅ Filter by: price, online/in-person, location, dates, tags
- ✅ Sort by: date, title, RSVP count
- ✅ Pagination support

### RSVP System
- ✅ User RSVP with date selection
- ✅ Multiple spots per booking
- ✅ Auto-generated ticket numbers (WO-2025-NNNNNN)
- ✅ Auto-generated reference numbers (#ALPHANUMERIC)
- ✅ Payment status tracking
- ✅ RSVP confirmation/cancellation/waitlist
- ✅ Cannot RSVP to own events
- ✅ Capacity validation
- ✅ Deadline validation

### RSVP Management (for Event Creators)
- ✅ View all RSVPs with attendee details
- ✅ Filter by status and payment
- ✅ Update payment status
- ✅ Track spots filled vs capacity
- ✅ Export RSVP data (CSV)
- ✅ View which dates each attendee selected

---

## 🔧 Helper Functions

**Auto-generated on table creation:**

### 1. generate_ticket_number()
Generates unique ticket numbers in format: `WO-2025-NNNNNN`
- Incremental counter
- Year prefix
- 6-digit padded number
- Uniqueness guaranteed

### 2. generate_reference_number()
Generates unique reference numbers in format: `#ALPHANUMERIC13`
- Random alphanumeric string
- 13 characters
- Uppercase letters and numbers
- Uniqueness guaranteed

### 3. update_whatson_updated_at()
Auto-updates `updated_at` timestamp on record changes
- Applied to `whatson_events`
- Applied to `whatson_rsvps`

---

## 📋 Required API Endpoints

**Events CRUD (6 endpoints):**
1. `POST /api/whatson` - Create event
2. `GET /api/whatson` - List events with filters
3. `GET /api/whatson/my` - User's created events
4. `GET /api/whatson/[id]` - Event details
5. `PATCH /api/whatson/[id]` - Update event
6. `DELETE /api/whatson/[id]` - Delete event

**RSVP Management (5 endpoints):**
7. `POST /api/whatson/[id]/rsvp` - Create RSVP
8. `DELETE /api/whatson/[id]/rsvp` - Cancel RSVP
9. `GET /api/whatson/[id]/rsvps` - List RSVPs (creator only)
10. `GET /api/whatson/rsvps/my` - User's RSVPs
11. `GET /api/whatson/[id]/rsvps/export` - Export RSVP data

**Image Upload (1 endpoint):**
12. `POST /api/upload/whatson-image` - Upload event images

**Total: 12 API endpoints**

---

## 🎯 Frontend Integration Points

### Pages to Update

**1. Browse Page** (`/whats-on/page.tsx`)
- Replace `whatsOnEvents` import with API call to `GET /api/whatson`
- Pass filter parameters to API
- Handle pagination

**2. Event Details** (`/whats-on/[slug]/page.tsx`)
- Fetch event by slug from `GET /api/whatson/[slug]`
- Display all event details
- Show RSVP button if authenticated

**3. Manage Events** (`/whats-on/manage-whats-on/page.tsx`)
- Fetch user's events from `GET /api/whatson/my`
- Display event cards with stats

**4. Create Event** (`/whats-on/manage-whats-on/add-new/page.tsx`)
- Submit form to `POST /api/whatson`
- Upload images to `POST /api/upload/whatson-image`

**5. Edit Event** (`/whats-on/manage-whats-on/[id]/page.tsx`)
- Fetch event from `GET /api/whatson/[id]`
- Update via `PATCH /api/whatson/[id]`
- Fetch RSVPs from `GET /api/whatson/[id]/rsvps`

**6. RSVP Component** (`components/rsvp.tsx`)
- Submit RSVP to `POST /api/whatson/[id]/rsvp`
- Display ticket and reference numbers

---

## 📈 Performance Optimizations

**27+ Indexes Created:**
- Full-text search on title/description
- Foreign key indexes for joins
- Composite indexes for common queries
- Filter indexes (status, location, price, dates)
- RSVP management indexes
- Tag-based search indexes

**Query Optimization:**
- Selective field fetching
- Proper JOIN strategies
- Pagination support
- Cached counts for RSVP totals

---

## ✅ Validation Rules

### Event Creation
- Title: 3-200 characters
- Location: Required if not online
- RSVP deadline: Must be before event dates
- Total spots: Min 1 (if not unlimited)
- Max spots per person: Min 1, max <= total spots
- Schedule: At least one slot required
- Description: Max 10000 characters
- Images: Max 5MB each

### RSVP
- User cannot RSVP to own event
- Cannot RSVP after deadline
- Cannot exceed max spots per person
- Cannot exceed total capacity (unless unlimited)
- Must select at least one date
- No duplicate RSVPs per event

---

## 🐛 Common Issues & Solutions

### Issue: Slug already exists
**Solution:** Auto-append number (e.g., "event-title-2")

### Issue: Cannot RSVP (capacity full)
**Solution:** Check `SUM(number_of_spots)` vs `total_spots`

### Issue: Image upload fails
**Solution:** Verify storage policies and file size limits

### Issue: RLS policy blocks query
**Solution:** Check `auth.uid()` is set and user has permissions

---

## 📚 Documentation

**Detailed Guides:**
- `00_ANALYSIS.md` - Frontend requirements analysis
- `05_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation

**SQL Files:**
- `01_CREATE_TABLES.sql` - Table schemas with comments
- `02_RLS_POLICIES.sql` - Security policies with comments
- `03_INDEXES.sql` - Performance indexes with comments
- `04_STORAGE_BUCKET.sql` - Storage configuration with comments

**All files include:**
- Inline comments
- Verification queries
- Usage examples
- Troubleshooting tips

---

## 🔄 Next Steps

After executing all SQL files:

1. **Verify Setup:**
   ```sql
   -- Run verification queries from each SQL file
   ```

2. **Test Database:**
   - Create test event manually
   - Generate ticket numbers
   - Test RLS policies

3. **Implement API:**
   - Follow API structure in Implementation Guide
   - Test with Postman or curl

4. **Integrate Frontend:**
   - Replace hardcoded data with API calls
   - Test all user flows

5. **Update Documentation:**
   - Add What's On section to UPDATED_BACKEND_ARCHITECTURE.md

---

## 🆘 Support

**For Issues:**
1. Check verification queries in SQL files
2. Review RLS policy errors in Supabase logs
3. Test queries in Supabase SQL Editor
4. Verify authentication tokens

**Related Documentation:**
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Storage: https://supabase.com/docs/guides/storage
- PostgreSQL Indexes: https://www.postgresql.org/docs/current/indexes.html

---

## 📊 Summary

**Database:**
- ✅ 5 tables with proper relationships
- ✅ 25 RLS policies for security
- ✅ 27+ indexes for performance
- ✅ 1 storage bucket for images
- ✅ 3 helper functions for automation

**Features:**
- ✅ Event creation with multi-date scheduling
- ✅ Capacity management with spots tracking
- ✅ RSVP system with ticket generation
- ✅ Tag-based discovery
- ✅ Advanced filtering and search
- ✅ Image uploads
- ✅ RSVP management and export

**Implementation:**
- ✅ Ready-to-execute SQL files
- ✅ Complete documentation
- ✅ API endpoint specifications
- ✅ Frontend integration guide
- ✅ Testing checklist

---

**Total Implementation Time:** 8-12 hours
**Complexity:** Medium
**Status:** Ready for Implementation ✅

---

## 📝 Changelog

- **v1.0** (2025-01-XX) - Initial implementation
  - Created all database tables
  - Implemented RLS policies
  - Created performance indexes
  - Set up storage bucket
  - Documented complete implementation
