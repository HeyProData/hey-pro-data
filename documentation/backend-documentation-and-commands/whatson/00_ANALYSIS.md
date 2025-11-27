# What's On Feature - Frontend Analysis

## Overview
The What's On feature is an events platform where users can discover, create, and manage events with RSVP functionality.

## Frontend Location
- **Path:** `/app/(app)/(whatson)/`
- **Main Pages:**
  - `/whats-on` - Browse all events with filters
  - `/whats-on/[slug]` - Event detail page with RSVP
  - `/whats-on/manage-whats-on` - User's events dashboard
  - `/whats-on/manage-whats-on/add-new` - Create new event
  - `/whats-on/manage-whats-on/[id]` - Edit event and manage RSVPs

## Data Structure (from /data/whatsOnEvents.ts)

```typescript
type WhatsOnEvent = {
  id: string;
  isOnline?: boolean;
  title: string;
  slug: string;
  location: string;
  isPaid: boolean;
  priceLabel: string;
  dateRangeLabel: string;
  rsvpBy: string;
  host: {
    name: string;
    organization: string;
    avatar: string;
  };
  schedule: Array<{
    dateLabel: string;
    timeRange: string;
    timezone: string;
  }>;
  description: string[];
  terms: string[];
  tags: string[];
  thumbnail: string;
  heroImage: string;
};
```

## Key Features Analysis

### 1. Event Creation/Management
**Fields Required:**
- `title` (TEXT, NOT NULL) - Event name
- `slug` (TEXT, UNIQUE) - URL-friendly identifier
- `location` (TEXT) - Venue name/address
- `is_online` (BOOLEAN) - Online/in-person flag
- `is_paid` (BOOLEAN) - Free or paid event
- `price_amount` (INTEGER) - Price value
- `price_currency` (TEXT) - Currency code (default: AED)
- `rsvp_deadline` (TIMESTAMPTZ) - RSVP by date
- `max_spots_per_person` (INTEGER) - Booking limit per user
- `total_spots` (INTEGER) - Total capacity
- `is_unlimited_spots` (BOOLEAN) - Unlimited capacity flag
- `description` (TEXT) - Event details
- `terms_conditions` (TEXT) - T&Cs
- `thumbnail_url` (TEXT) - Card image
- `hero_image_url` (TEXT) - Detail page banner
- `status` (TEXT) - 'draft' | 'published' | 'cancelled'
- `created_by` (UUID, FK → auth.users) - Event creator

**Host Information:**
- Links to `user_profiles` table for creator info
- Uses `user_profiles.legal_first_name`, `alias_first_name`, `profile_photo_url`
- Organization name stored in event or profile?

### 2. Schedule Slots (Multiple per Event)
**Table:** `whatson_schedule`
- `id` (UUID, PK)
- `event_id` (UUID, FK → whatson_events)
- `date` (DATE) - Event date
- `start_time` (TIME) - Start time
- `end_time` (TIME) - End time
- `timezone` (TEXT) - Timezone (e.g., "IST", "GST")
- `sort_order` (INTEGER) - Display order

### 3. Event Tags
**Table:** `whatson_tags`
- `id` (UUID, PK)
- `event_id` (UUID, FK → whatson_events)
- `tag_name` (TEXT) - Tag value
- Unique constraint: (event_id, tag_name)

### 4. RSVP System
**Table:** `whatson_rsvps`
- `id` (UUID, PK)
- `event_id` (UUID, FK → whatson_events)
- `user_id` (UUID, FK → auth.users) - Attendee
- `ticket_number` (TEXT, UNIQUE) - Generated ticket ID
- `reference_number` (TEXT, UNIQUE) - Booking reference
- `number_of_spots` (INTEGER) - How many spots booked
- `payment_status` (TEXT) - 'paid' | 'unpaid' | 'n/a'
- `status` (TEXT) - 'confirmed' | 'cancelled' | 'waitlist'
- `created_at` (TIMESTAMPTZ)
- Unique constraint: (event_id, user_id) - One RSVP per user per event

### 5. RSVP Date Selections
**Table:** `whatson_rsvp_dates`
- `id` (UUID, PK)
- `rsvp_id` (UUID, FK → whatson_rsvps)
- `schedule_id` (UUID, FK → whatson_schedule)
- Unique constraint: (rsvp_id, schedule_id)

**Note:** This allows tracking which specific dates an attendee selected

### 6. Additional Attendee Information
**Table:** `whatson_rsvp_attendees`
- `id` (UUID, PK)
- `rsvp_id` (UUID, FK → whatson_rsvps)
- `name` (TEXT) - Attendee name
- `email` (TEXT) - Attendee email
- `sort_order` (INTEGER)

**Note:** For cases where users book multiple spots and provide attendee details

## Browse & Filter Requirements

### Search Parameters:
- `keyword` - Search in title, description
- `price` - Filter by free/paid
- `eventType` - Filter by event type (screening, festival, masterclass)
- `eventStatus` - Filter by upcoming/ongoing/past
- `location` - Search in location field
- `attendance` - Filter by online/in-person
- `dateFrom` / `dateTo` - Filter by event dates
- `tags` - Filter by tags

### Sort Options:
- By date (ascending/descending)
- By RSVP count
- By created date

## Storage Requirements

### Bucket: `whatson-images/` (Public)
- **Purpose:** Event thumbnails and hero images
- **Max Size:** 5 MB per file
- **Allowed Types:** JPEG, JPG, PNG, WebP
- **Path Structure:** `{user_id}/{event_id}/{filename}`
- **Access:** Public read, Authenticated write (own events only)

## User Interactions

### For All Users:
1. Browse events with filters
2. View event details
3. RSVP to events (if authenticated)
4. View own RSVPs
5. Cancel RSVPs

### For Event Creators:
1. Create events with all details
2. Upload event images
3. Manage multiple schedule slots
4. Add/edit tags
5. Set capacity and pricing
6. View RSVP list with details
7. Export RSVP data
8. Edit/cancel events
9. Track attendance (spots filled)

## Computed Fields

### Event Card Display:
- `spots_filled` - COUNT of confirmed RSVPs
- `attendee_count` - SUM of number_of_spots from RSVPs
- `is_fully_booked` - (spots_filled >= total_spots) AND NOT unlimited
- `date_range_label` - Formatted from min/max schedule dates

### RSVP Management:
- Attendee list with user profile info (name, avatar)
- Payment status summary
- Ticket numbers and references

## Required API Endpoints

### Events CRUD:
1. `POST /api/whatson` - Create event
2. `GET /api/whatson` - List events with filters
3. `GET /api/whatson/my` - User's created events
4. `GET /api/whatson/[id]` - Event details
5. `PATCH /api/whatson/[id]` - Update event
6. `DELETE /api/whatson/[id]` - Delete event

### RSVP Management:
7. `POST /api/whatson/[id]/rsvp` - Create RSVP
8. `DELETE /api/whatson/[id]/rsvp` - Cancel RSVP
9. `GET /api/whatson/[id]/rsvps` - List RSVPs (creator only)
10. `GET /api/whatson/rsvps/my` - User's RSVPs
11. `GET /api/whatson/[id]/rsvps/export` - Export RSVP data

### Image Upload:
12. `POST /api/upload/whatson-image` - Upload event images

## Validation Rules

### Event Creation:
- Title: Required, 3-200 characters
- Location: Required if not online
- RSVP deadline: Must be before first schedule date
- Total spots: Required if not unlimited, min 1
- Max spots per person: Min 1, max <= total_spots
- Schedule: At least one slot required
- Description: Required, max 5000 characters
- Images: Optional, max 5MB each

### RSVP:
- User cannot RSVP to own event
- Cannot RSVP after deadline
- Cannot exceed max spots per person
- Cannot exceed total spots (unless unlimited)
- Must select at least one date
- No duplicate RSVPs per event

## Database Relationships

```
auth.users
    |
    ├──[1:N]──> whatson_events (created events)
    |
    └──[1:N]──> whatson_rsvps (user RSVPs)

whatson_events
    |
    ├──[1:N]──> whatson_schedule (event dates/times)
    ├──[1:N]──> whatson_tags (event tags)
    └──[1:N]──> whatson_rsvps (event RSVPs)

whatson_rsvps
    |
    ├──[1:N]──> whatson_rsvp_dates (selected dates)
    └──[1:N]──> whatson_rsvp_attendees (additional attendees)
```

## Implementation Notes

1. **Ticket Number Generation:** Auto-generated unique identifier (e.g., "WO-2025-001234")
2. **Reference Number Generation:** Unique booking reference (e.g., "#1234567890ABC")
3. **Capacity Tracking:** Real-time calculation of available spots
4. **Date Filtering:** Use PostgreSQL date range queries
5. **Timezone Handling:** Store timezone with each schedule slot
6. **Image URLs:** Store full Supabase Storage URLs
7. **Slug Generation:** Auto-generate from title, ensure uniqueness
8. **Soft Deletes:** Consider using status='cancelled' instead of DELETE

## Frontend-Backend Data Mapping

### Event Card (Browse):
- `id`, `slug`, `title`, `location`, `isPaid`, `priceLabel`
- `dateRangeLabel` ← Computed from schedule
- `thumbnail` ← `thumbnail_url`
- `host.name` ← `user_profiles.alias_first_name` or `legal_first_name`
- `host.avatar` ← `user_profiles.profile_photo_url`
- `host.organization` ← TBD (new field in user_profiles?)

### Event Details:
- All event fields
- `schedule[]` ← `whatson_schedule` array
- `description[]` ← Split by paragraphs
- `terms[]` ← Split by paragraphs
- `tags[]` ← `whatson_tags` array
- `heroImage` ← `hero_image_url`

### RSVP Entry (Management Table):
- `name` ← `user_profiles` name
- `ticketNo` ← `ticket_number`
- `reference` ← `reference_number`
- `paid` ← `payment_status === 'paid'`
- Avatar ← `user_profiles.profile_photo_url`

## Missing Requirements to Clarify

✅ **RESOLVED:**
1. ✅ RSVP linked to authenticated users (user_id)
2. ✅ No payment integration - just paid/unpaid flag
3. ✅ Any authenticated user can create events
4. ✅ No chat functionality required

## Next Steps

1. Create database tables with proper schema
2. Set up RLS policies for security
3. Create performance indexes
4. Set up storage bucket
5. Implement API endpoints
6. Update UPDATED_BACKEND_ARCHITECTURE.md
