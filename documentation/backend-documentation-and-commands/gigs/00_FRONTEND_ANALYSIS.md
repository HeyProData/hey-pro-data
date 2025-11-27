# Gigs Frontend Analysis

**Created:** January 2025  
**Purpose:** Analyze hardcoded UI data in `app/(app)/(gigs)` to design matching backend architecture

---

## 📂 Frontend File Structure

```
/app/(app)/(gigs)/
├── gigs/
│   ├── page.tsx                    # Gigs list page (browse all gigs)
│   ├── [slug]/page.tsx             # Individual gig details page
│   └── manage-gigs/
│       ├── page.tsx                # Manage gigs dashboard (tabs: gigs, applications, availability, contacts)
│       └── add-new/page.tsx        # Create new gig form
├── components/
│   ├── gig-details.tsx            # Gig detail view component
│   ├── gigs-header.tsx            # Header for gigs pages
│   ├── recommend-gigs.tsx         # Recommended gigs widget
│   ├── applygigs.tsx              # Apply to gig modal/form
│   └── manage-gigs/
│       ├── gig-list.tsx           # List of gigs with checkboxes
│       ├── application-tab.tsx     # Applications table with actions
│       ├── availability-tab.tsx    # Availability calendar view
│       ├── contact-list-tab.tsx    # Contact list by department
│       └── sample-data.ts          # Hardcoded applicant/contact data
└── /data/gigs.ts                  # Main hardcoded gigs data
```

---

## 📊 Data Structures Found in Frontend

### 1. Gig Entry (from `/data/gigs.ts`)

**TypeScript Interface:**
```typescript
type GigEntry = {
  id: string;
  slug: string;                    // URL-friendly identifier (e.g., "video-editors-shortfilm")
  title: string;                   // "4 Video Editors for Shortfilm"
  postedOn: string;                // "18 Oct, 2025" (formatted date)
  postedBy: {
    name: string;                  // "Michael Molar"
    avatar: string;                // "/assets/whatson/host-avatar.svg"
  };
  description: string;             // Gig description
  qualifyingCriteria: string;      // Criteria for applicants
  budgetLabel: string;             // "AED 20000"
  dateWindows: GigDateWindow[];    // Date ranges
  calendarMonths: GigCalendarMonth[]; // Calendar view data
  references: GigReference[];      // Supporting files/links
  location: string;                // "Dubai Design District, location1, location3"
  supportingFileLabel: string;     // "Supporting file attached"
  applyBefore: string;             // "22 Oct, 2025" (deadline)
};

type GigDateWindow = {
  label: string;                   // "Sep 2025"
  range: string;                   // "12, 15, 16-25"
};

type GigCalendarMonth = {
  month: number;                   // 0-indexed (0 = Jan)
  year: number;                    // 2025
  highlightedDays: number[];       // [1, 3, 4, 5, 6, 7, 8, 10, 17]
};

type GigReference = {
  label: string;                   // "Document.pdf"
  href?: string;                   // "https://somewebsite.com/Document"
  type: "file" | "link";
};
```

**Sample Data:**
```json
{
  "id": "1",
  "slug": "video-editors-shortfilm",
  "title": "4 Video Editors for Shortfilm",
  "postedOn": "18 Oct, 2025",
  "postedBy": {
    "name": "Michael Molar",
    "avatar": "/assets/whatson/host-avatar.svg"
  },
  "description": "Description of the GIG will be here abcdefghij .......",
  "qualifyingCriteria": "This is where the qualifying criteria value comes....",
  "budgetLabel": "AED 20000",
  "dateWindows": [
    { "label": "Sep 2025", "range": "12, 15, 16-25" },
    { "label": "Oct 2025", "range": "1-30" }
  ],
  "calendarMonths": [
    { "month": 8, "year": 2025, "highlightedDays": [1, 3, 4, 5, 6, 7, 8, 10, 17] },
    { "month": 9, "year": 2025, "highlightedDays": [2, 5, 6, 7, 8, 13, 14, 20, 27, 28] }
  ],
  "references": [
    { "label": "Document.pdf", "type": "file" },
    { "label": "www.somewebsite.com/Document", "href": "https://somewebsite.com/Document", "type": "link" }
  ],
  "location": "Dubai Design District, location1, location3",
  "supportingFileLabel": "Supporting file attached",
  "applyBefore": "22 Oct, 2025"
}
```

---

### 2. Create Gig Form (from `/gigs/manage-gigs/add-new/page.tsx`)

**Form Fields:**
```typescript
type GigFormValues = {
  role: string;                    // Select: "director" | "producer" | "cinematographer"
  type: string;                    // Select: "contract" | "full-time" | "part-time"
  department: string;              // Text input
  location: string;                // Text input (multiple locations)
  company: string;                 // Text input (production company, optional)
  description: string;             // Textarea ("I am looking for...")
  referenceUrl: string;            // Text input (optional)
  qualifyingCriteria: string;      // Textarea (optional)
  gigRate: string;                 // Number input with AED prefix
  expiryDate: string;              // Date picker (defaults to 3 days)
};

// Additional form state:
crewCount: number;                 // Increment/decrement (default: 1)
isTbc: boolean;                    // "TBC" checkbox
requestQuote: boolean;             // "Request quote" checkbox (disables gigRate)
referenceFile: File | null;        // File upload (images show preview)
selectedDates: Date[];             // Custom calendar multi-select
```

**Form Behavior:**
- Crew count: Min 1, increment/decrement buttons
- Role dropdown: director, producer, cinematographer
- Type dropdown: contract, full-time, part-time
- Date selection: Custom calendar with multi-select, shows range summaries
- Reference: Can provide URL OR upload file (not both)
- GIG rate: Either enter amount OR check "Request quote"
- Expiry: Auto-expires in 3 days if not set
- Preview: Live preview panel shows formatted gig card
- Actions: "Save to draft" (status=draft) or "Publish" (status=active)

---

### 3. Sample Applicants (from `/components/manage-gigs/sample-data.ts`)

**Applicant Structure:**
```typescript
type SampleApplicant = {
  id: string;
  name: string;                    // "Aarav Mehta"
  city: string;                    // "Dubai"
  skills: string[];                // ["Guitarist", "Sound Engineer"]
  credits: string;                 // "View credits" (link)
  referrals: number;               // 15
  phone: string;                   // "+91 9876543210"
  email: string;                   // "aaravmehta12@gmail.com"
  avatar: string;                  // "/image (1).png"
};
```

**Sample Data:**
```json
[
  {
    "id": "1",
    "name": "Aarav Mehta",
    "city": "Dubai",
    "skills": ["Guitarist", "Sound Engineer"],
    "credits": "View credits",
    "referrals": 15,
    "phone": "+91 9876543210",
    "email": "aaravmehta12@gmail.com",
    "avatar": "/image (1).png"
  }
]
```

---

### 4. Availability Schedule (from `/components/manage-gigs/sample-data.ts`)

**Availability Structure:**
```typescript
type AvailabilityState = "available" | "hold" | "na";
type AvailabilitySchedule = Record<string, AvailabilityState>;

// Format: "[Month Year]-[Day]": "available" | "hold" | "na"
const availabilityScheduleByApplicant: Record<string, AvailabilitySchedule> = {
  "1": {
    "Sep 2025-12": "available",
    "Sep 2025-15": "available",
    "Sep 2025-18": "hold",
    "Oct 2025-2": "available",
    "Oct 2025-20": "na"
  }
};
```

**UI Display:**
- `available`: Yellow badge with "P1" (Priority 1)
- `hold`: Blue badge with "C" (Confirmed)
- `na`: Gray text "N/A"

---

### 5. Contact Groups (from `/components/manage-gigs/sample-data.ts`)

**Contact Group Structure:**
```typescript
type ContactGroup = {
  id: string;                      // "camera"
  department: string;              // "Camera"
  summary: string;                 // "4 Camera Operator for Shortfilm"
  entries: {
    role: string;                  // "Camera Operator"
    company: string;               // "Central Films"
    person: SampleApplicant;       // Full applicant object
  }[];
};
```

**Sample Data:**
```json
[
  {
    "id": "camera",
    "department": "Camera",
    "summary": "4 Camera Operator for Shortfilm",
    "entries": [
      {
        "role": "Camera Operator",
        "company": "Central Films",
        "person": { /* applicant object */ }
      }
    ]
  }
]
```

---

## 🔍 Backend Comparison

### Existing Backend Tables (from UPDATED_BACKEND_ARCHITECTURE.md)

#### 1. `gigs` table (Existing)
**Current Fields:**
- `id` (PK)
- `title`
- `description`
- `qualifying_criteria`
- `amount` (numeric)
- `currency` (text)
- `status` (active/closed/draft)
- `created_by` (FK → auth.users)
- `created_at`, `updated_at`

#### 2. `gig_dates` table (Existing)
**Current Fields:**
- `id` (PK)
- `gig_id` (FK → gigs)
- `month` (text) - e.g., "Sep 2025"
- `days` (text) - e.g., "1-5, 10-15"
- `created_at`

#### 3. `gig_locations` table (Existing)
**Current Fields:**
- `id` (PK)
- `gig_id` (FK → gigs)
- `location_name` (text)
- `created_at`

#### 4. `applications` table (Existing)
**Current Fields:**
- `id` (PK)
- `gig_id` (FK → gigs)
- `applicant_user_id` (FK → auth.users)
- `status` (pending/shortlisted/confirmed/released)
- `cover_letter` (text)
- `portfolio_links` (text[])
- `resume_url` (text)
- `created_at`, `updated_at`
- **Constraint:** UNIQUE(gig_id, applicant_user_id)

#### 5. `crew_availability` table (Existing)
**Current Fields:**
- `id` (PK)
- `user_id` (FK → auth.users)
- `availability_date` (date)
- `is_available` (boolean)
- `gig_id` (FK → gigs, optional)
- `created_at`, `updated_at`
- **Constraint:** UNIQUE(user_id, availability_date)

#### 6. `crew_contacts` table (Existing)
**Current Fields:**
- `id` (PK)
- `gig_id` (FK → gigs)
- `user_id` (FK → auth.users)
- `department` (text)
- `role` (text)
- `company` (text)
- `phone` (text)
- `email` (text)
- `created_at`

#### 7. `referrals` table (Existing)
**Current Fields:**
- `id` (PK)
- `gig_id` (FK → gigs)
- `referred_user_id` (FK → auth.users)
- `referrer_user_id` (FK → auth.users)
- `status` (pending/accepted/declined)
- `created_at`

---

## ❌ Gap Analysis: Missing Backend Fields

### 1. Missing Fields in `gigs` Table

| Frontend Field | Backend Field | Type | Notes |
|----------------|---------------|------|-------|
| `slug` | **MISSING** | TEXT (UNIQUE) | URL-friendly identifier for routing |
| `crewCount` | **MISSING** | INTEGER | Number of crew needed (min 1) |
| `role` | **MISSING** | TEXT | GIG role (director, producer, cinematographer) |
| `type` | **MISSING** | TEXT | GIG type (contract, full-time, part-time) |
| `department` | **MISSING** | TEXT | Department/specialty |
| `company` | **MISSING** | TEXT | Production company name (optional) |
| `isTbc` | **MISSING** | BOOLEAN | "To Be Confirmed" flag |
| `requestQuote` | **MISSING** | BOOLEAN | Whether rate is "Request quote" |
| `expiryDate` / `applyBefore` | **MISSING** | TIMESTAMP | Application deadline |
| `postedOn` | **MISSING** | TIMESTAMP | Can use `created_at` |
| `postedBy.name` | **DERIVE** | - | Join from user_profiles (legal_first_name + legal_surname) |
| `postedBy.avatar` | **DERIVE** | - | Join from user_profiles (profile_photo_url) |
| `supportingFileLabel` | **MISSING** | TEXT | Label for reference file |
| `referenceUrl` | **MISSING** | TEXT | Reference link URL |
| `budgetLabel` | **DERIVE** | - | Combine `amount` + `currency` (e.g., "AED 20000") |

### 2. Missing Table: `gig_references`

Frontend has array of references with `label`, `href`, `type` ("file" | "link").

**Proposed Table:**
```sql
CREATE TABLE gig_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'link')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Missing: `calendarMonths` Data

Frontend shows calendar view with `{ month, year, highlightedDays: number[] }`.

**Solution:** This can be **derived from `gig_dates`** table by parsing the `days` field.
- No separate table needed
- API endpoint should transform `gig_dates` into calendar format

### 4. Application Status Values

Frontend uses: `pending`, `shortlisted`, `confirmed`, `released`  
Backend already supports these values ✅

### 5. Availability Display

Frontend shows: `"available"`, `"hold"`, `"na"`  
Backend has: `is_available` (boolean)

**Solution:** Enhance `crew_availability` table
- Change `is_available` to `status` (TEXT)
- Enum: `"available"` | `"hold"` | `"na"`

---

## 📋 Summary of Required Changes

### ALTER Statements Needed

1. **Alter `gigs` table** - Add 11 new columns:
   - `slug` (TEXT, UNIQUE)
   - `crew_count` (INTEGER, DEFAULT 1)
   - `role` (TEXT)
   - `type` (TEXT)
   - `department` (TEXT)
   - `company` (TEXT)
   - `is_tbc` (BOOLEAN, DEFAULT false)
   - `request_quote` (BOOLEAN, DEFAULT false)
   - `expiry_date` (TIMESTAMPTZ)
   - `supporting_file_label` (TEXT)
   - `reference_url` (TEXT)

2. **Alter `crew_availability` table** - Change availability type:
   - Change `is_available` (BOOLEAN) → `status` (TEXT)
   - Enum: `"available"` | `"hold"` | `"na"`

### CREATE Statements Needed

3. **Create `gig_references` table** - Store file/link references:
   - `id` (UUID, PK)
   - `gig_id` (FK → gigs)
   - `label` (TEXT)
   - `url` (TEXT)
   - `type` (TEXT: "file" | "link")
   - `created_at` (TIMESTAMPTZ)

### Indexes Needed

4. **Performance indexes:**
   - `idx_gigs_slug` on `gigs(slug)` - For slug-based lookups
   - `idx_gigs_role` on `gigs(role)` - For filtering by role
   - `idx_gigs_type` on `gigs(type)` - For filtering by type
   - `idx_gigs_expiry_date` on `gigs(expiry_date)` - For filtering expired gigs
   - `idx_gig_references_gig_id` on `gig_references(gig_id)` - For join performance

### RLS Policies Needed

5. **Row Level Security:**
   - Public can view active gigs (existing)
   - Users can view own drafts (existing)
   - Only owners can update/delete gigs (existing)
   - Public can view gig_references (new)
   - Only gig owner can add/delete references (new)

---

## 🎯 API Endpoints Required

Frontend pages need these API endpoints:

### 1. GET /api/gigs
**Purpose:** List all active gigs with search/filter  
**Query Params:**
- `search` - Search in title/description
- `role` - Filter by role
- `type` - Filter by type
- `location` - Filter by location
- `page`, `limit` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "gigs": [/* array of gig objects */],
    "pagination": { /* pagination info */ }
  }
}
```

### 2. GET /api/gigs/[id] or /api/gigs/slug/[slug]
**Purpose:** Get single gig details with all relations

**Response includes:**
- Gig data
- `gig_dates` array
- `gig_locations` array
- `gig_references` array
- `postedBy` object (from user_profiles join)
- `calendarMonths` (derived from gig_dates)

### 3. POST /api/gigs
**Purpose:** Create new gig  
**Auth:** Required  
**Body:**
```json
{
  "title": "4 Video Editors for Shortfilm",
  "description": "...",
  "qualifyingCriteria": "...",
  "amount": 20000,
  "currency": "AED",
  "crewCount": 4,
  "role": "director",
  "type": "contract",
  "department": "Post-production",
  "company": "Central Films",
  "isTbc": false,
  "requestQuote": false,
  "expiryDate": "2025-10-22T00:00:00Z",
  "referenceUrl": "https://example.com",
  "supportingFileLabel": "Supporting file attached",
  "dateWindows": [
    { "label": "Sep 2025", "range": "12, 15, 16-25" }
  ],
  "locations": ["Dubai Design District", "location1"],
  "references": [
    { "label": "Document.pdf", "url": "https://storage/...", "type": "file" }
  ],
  "status": "active" // or "draft"
}
```

### 4. PATCH /api/gigs/[id]
**Purpose:** Update existing gig  
**Auth:** Required (owner only)

### 5. DELETE /api/gigs/[id]
**Purpose:** Delete gig  
**Auth:** Required (owner only)

### 6. GET /api/gigs/[id]/applications
**Purpose:** Get all applications for a gig  
**Auth:** Required (gig creator only)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "...",
        "applicant": {
          "id": "...",
          "name": "Aarav Mehta",
          "city": "Dubai",
          "avatar": "...",
          "skills": ["Guitarist", "Sound Engineer"],
          "phone": "+91 9876543210",
          "email": "aaravmehta12@gmail.com"
        },
        "status": "pending",
        "coverLetter": "...",
        "resumeUrl": "...",
        "createdAt": "..."
      }
    ]
  }
}
```

### 7. GET /api/gigs/[id]/availability
**Purpose:** Get applicant availability for gig dates  
**Auth:** Required (gig creator only)

**Response:**
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "applicantId": "...",
        "name": "Aarav Mehta",
        "avatar": "...",
        "schedule": {
          "Sep 2025-12": "available",
          "Sep 2025-15": "hold",
          "Oct 2025-2": "na"
        }
      }
    ]
  }
}
```

### 8. GET /api/gigs/[id]/contacts
**Purpose:** Get crew contacts for a gig  
**Auth:** Required (gig creator only)  
**Note:** Already exists as `/api/contacts/gig/[gigId]`

---

## 📊 Data Flow Examples

### Creating a Gig

```
1. User fills form in /gigs/manage-gigs/add-new
2. User clicks "Publish" or "Save to draft"
3. Frontend uploads reference file (if any) → POST /api/upload/gig-reference
4. Frontend gets file URL from response
5. Frontend submits form → POST /api/gigs with all data
6. Backend:
   a. Validates auth and profile completeness
   b. Generates slug from title (e.g., "4-video-editors-shortfilm")
   c. Inserts into gigs table
   d. Batch inserts into gig_dates (for each dateWindow)
   e. Batch inserts into gig_locations (for each location)
   f. Batch inserts into gig_references (for each reference)
   g. Returns complete gig object with slug
7. Frontend redirects to /gigs/[slug] or /gigs/manage-gigs
```

### Browsing Gigs

```
1. User visits /gigs
2. Frontend → GET /api/gigs?page=1&limit=20
3. Backend:
   a. Query gigs WHERE status = 'active' AND expiry_date > NOW()
   b. Join with user_profiles for postedBy data
   c. Include gig_dates, gig_locations (aggregate)
   d. Order by created_at DESC
   e. Paginate results
4. Frontend renders gig cards with:
   - Avatar, name from postedBy
   - Title, description, qualifyingCriteria
   - Budget label (amount + currency)
   - Date windows
   - Locations
   - Apply before (expiryDate)
```

### Viewing Gig Details

```
1. User clicks gig card → Navigate to /gigs/[slug]
2. Frontend → GET /api/gigs/slug/[slug]
3. Backend:
   a. Query gigs WHERE slug = $1
   b. Join with user_profiles for postedBy
   c. Fetch gig_dates (ordered by month)
   d. Fetch gig_locations
   e. Fetch gig_references
   f. Transform gig_dates into calendarMonths format
   g. Return complete gig object
4. Frontend renders:
   - Full gig details
   - Calendar view with highlighted days
   - References (files/links)
   - Apply button (opens application modal)
```

### Managing Applications

```
1. Gig creator visits /gigs/manage-gigs
2. Selects gig from "Gigs" tab
3. Switches to "Application" tab
4. Frontend → GET /api/gigs/[id]/applications
5. Backend:
   a. Verify user is gig creator (RLS)
   b. Query applications WHERE gig_id = $1
   c. Join with user_profiles for applicant data
   d. Join with applicant_skills for skills
   e. Count referrals for each applicant
   f. Return applicants array with all data
6. Frontend renders applications table with:
   - Name, city, avatar
   - Skills list
   - Referrals count
   - Action buttons: Chat, Release, Shortlist, Confirm
7. User clicks action button → PATCH /api/applications/[id]/status
```

---

## ✅ Implementation Priority

### Phase 1: Database Schema (CRITICAL)
1. Execute ALTER statements on `gigs` table ✅
2. Execute ALTER statements on `crew_availability` table ✅
3. Execute CREATE statement for `gig_references` table ✅
4. Create indexes for performance ✅
5. Update RLS policies ✅

### Phase 2: API Implementation (HIGH)
1. Update POST /api/gigs to handle new fields ✅
2. Update GET /api/gigs to return new fields ✅
3. Update GET /api/gigs/[id] to include relations ✅
4. Create GET /api/gigs/slug/[slug] endpoint ✅
5. Update PATCH /api/gigs/[id] for new fields ✅
6. Create POST /api/upload/gig-reference endpoint ✅
7. Update GET /api/gigs/[id]/applications to join applicant data ✅
8. Create GET /api/gigs/[id]/availability endpoint ✅

### Phase 3: Frontend Integration (MEDIUM)
1. Update /gigs page to fetch from API
2. Update /gigs/[slug] to fetch from API
3. Update /gigs/manage-gigs/add-new to POST to API
4. Update manage-gigs tabs to fetch from API
5. Replace hardcoded data with API calls

### Phase 4: Testing (LOW)
1. Test gig creation flow
2. Test gig listing and filtering
3. Test application management
4. Test availability calendar
5. Test contact list

---

**Next Steps:** Proceed to `01_ALTER_STATEMENTS.sql` for database migration.
