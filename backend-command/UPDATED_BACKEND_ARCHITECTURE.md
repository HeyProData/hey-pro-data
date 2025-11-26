# Backend Architecture Overview - UPDATED

## HeyProData Backend Infrastructure

This document provides a comprehensive overview of the **UPDATED** backend architecture including all profile-related enhancements.

**Last Updated:** January 2025  
**Version:** 2.0 (Updated with Profile Schema)

---

## 🏗️ Technology Stack

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Storage**: Supabase Storage (S3-compatible)
- **Real-time**: Supabase Realtime (available but not required)

### Backend Runtime
- **Runtime**: Node.js serverless functions
- **API Style**: RESTful
- **Response Format**: JSON
- **Authentication Method**: JWT Bearer tokens

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (New UI/UX)                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Pages      │  │  Components  │  │    Hooks     │            │
│  │  /home       │  │  Navbar      │  │  useAuth     │            │
│  │  /gigs       │  │  Cards       │  │  useGigs     │            │
│  │  /profile    │  │  Modals      │  │  useProfile  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│                    ▼ API Calls with JWT                            │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT LAYER                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  /lib/supabase.js (Client-side Auth & Session Management) │   │
│  │  - Adaptive Storage (localStorage/sessionStorage)          │   │
│  │  - PKCE OAuth Flow                                          │   │
│  │  - Session Persistence                                      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  /lib/supabaseServer.js (Server-side Utilities)           │   │
│  │  - Auth validation helpers                                  │   │
│  │  - File upload/download helpers                             │   │
│  │  - Response formatters                                      │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API ROUTES (31+ Endpoints)                       │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Gigs (5)     │  │ Profile (4+) │  │ Skills (3)   │            │
│  │ Applications │  │ Availability │  │ Notifications│            │
│  │ (6)          │  │ (4)          │  │ (3)          │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Uploads (3)  │  │ Contacts (3) │  │ Referrals(2) │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  AUTHENTICATION (Supabase Auth)                          │      │
│  │  - Email/Password with OTP                               │      │
│  │  - Google OAuth with PKCE                                │      │
│  │  - Session Management                                     │      │
│  │  - JWT Token Generation                                   │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  DATABASE (PostgreSQL)                                    │      │
│  │  - 18 Tables with Relationships ⭐ UPDATED                │      │
│  │  - Row Level Security (RLS) Policies                      │      │
│  │  - Indexes for Performance                                │      │
│  │  - Triggers for Auto-updates                              │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  STORAGE (Supabase Storage)                               │      │
│  │  - resumes/ (Private, 5MB)                                │      │
│  │  - portfolios/ (Private, 10MB)                            │      │
│  │  - profile-photos/ (Public, 2MB)                          │      │
│  └─────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Summary

### Core Tables (18 Total) ⭐ UPDATED

#### PROFILE TABLES (10 Tables)

##### 1. `user_profiles` ⭐ UPDATED
Stores user profile information linked to authentication.

**Key Fields:**
- `user_id` (PK, FK → auth.users)
- `legal_first_name`, `legal_surname`
- `alias_first_name`, `alias_surname`
- `phone`, `bio`
- `email` ⭐ NEW - Contact email
- `country_code` ⭐ NEW - Phone country code (ISO)
- `profile_photo_url`, `banner_url`
- `country`, `city`
- `availability` ⭐ NEW - Work status (Available/Not Available)
- `profile_completion_percentage` ⭐ NEW - 0-100 completion score
- `is_profile_complete` (Boolean)
- `updated_at` ⭐ NEW - Last update timestamp

**Indexes:**
- Primary key on `user_id`
- Foreign key to `auth.users(id)`

##### 2. `user_links` ⭐ NEW
Social media and portfolio links for user profiles.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users)
- `label` - Link name (LinkedIn, Portfolio, GitHub, etc.)
- `url` - Full URL
- `sort_order` - Display order
- `created_at`, `updated_at`

**Indexes:**
- `idx_user_links_user_id` on `user_id`
- `idx_user_links_user_id_sort` on `(user_id, sort_order)`

##### 3. `user_roles` ⭐ NEW
Professional roles and titles for users.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users)
- `role_name` - Role title (Director, Cinematographer, Editor, etc.)
- `sort_order` - Display order
- `created_at`

**Constraints:**
- UNIQUE(user_id, role_name) - No duplicate roles per user

**Indexes:**
- `idx_user_roles_user_id` on `user_id`
- `idx_user_roles_user_id_sort` on `(user_id, sort_order)`

##### 4. `user_languages` ⭐ NEW
Languages with speaking and writing proficiency.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users)
- `language_name` - Language (English, Spanish, etc.)
- `can_speak` (Boolean)
- `can_write` (Boolean)
- `created_at`, `updated_at`

**Constraints:**
- UNIQUE(user_id, language_name)
- CHECK: At least one of `can_speak` or `can_write` must be true

**Indexes:**
- `idx_user_languages_user_id` on `user_id`

##### 5. `user_visa_info` ⭐ NEW
Visa and work authorization information.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users, UNIQUE)
- `visa_type` - Type (H1B, L1, O1, TN, E3, F1, J1, B1/B2)
- `issued_by` - Issuing country
- `expiry_date` - Expiration date
- `created_at`, `updated_at`

**Note:** One visa per user (1:1 relationship)

**Indexes:**
- `idx_user_visa_info_user_id` on `user_id`

##### 6. `user_travel_countries` ⭐ NEW
Countries available for work travel.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users)
- `country_code` - ISO country code
- `country_name` - Full country name
- `created_at`

**Constraints:**
- UNIQUE(user_id, country_code)

**Indexes:**
- `idx_user_travel_countries_user_id` on `user_id`

##### 7. `user_credits` ⭐ NEW
Work history, credits, and past projects.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users)
- `credit_title` - Project or company name
- `description` - Work description
- `start_date` - Project start
- `end_date` - Project end (NULL if ongoing)
- `image_url` - Project thumbnail
- `sort_order` - Display order
- `created_at`, `updated_at`

**Constraints:**
- CHECK: `end_date >= start_date` (if not NULL)

**Indexes:**
- `idx_user_credits_user_id` on `user_id`
- `idx_user_credits_user_id_sort` on `(user_id, sort_order)`
- `idx_user_credits_user_id_dates` on `(user_id, start_date DESC)`

##### 8. `user_highlights` ⭐ NEW
Profile highlights and featured achievements.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users)
- `title` - Highlight title
- `description` - Detailed description
- `image_url` - Featured image
- `sort_order` - Display order
- `created_at`, `updated_at`

**Indexes:**
- `idx_user_highlights_user_id` on `user_id`
- `idx_user_highlights_user_id_sort` on `(user_id, sort_order)`

##### 9. `user_recommendations` ⭐ NEW
Profile recommendations ("People also viewed").

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users) - User being viewed
- `recommended_user_id` (FK → auth.users) - Recommended user
- `created_at`

**Constraints:**
- UNIQUE(user_id, recommended_user_id)
- CHECK: `user_id != recommended_user_id`

**Indexes:**
- `idx_user_recommendations_user_id` on `user_id`
- `idx_user_recommendations_recommended_id` on `recommended_user_id`

##### 10. `applicant_skills` ⭐ UPDATED
Skills associated with users.

**Key Fields:**
- `id` ⭐ NEW (PK, UUID)
- `user_id` (FK → auth.users)
- `skill_name`
- `description` ⭐ NEW - Skill details and expertise
- `sort_order` ⭐ NEW - Display order
- `created_at` ⭐ NEW
- `updated_at` ⭐ NEW

**Constraints:**
- UNIQUE(user_id, skill_name)

**Indexes:**
- `idx_applicant_skills_user_id_sort` on `(user_id, sort_order)`

---

#### GIGS & APPLICATIONS TABLES (8 Tables)

##### 11. `gigs`
Main table for job postings.

**Key Fields:**
- `id` (PK)
- `title`, `description`, `qualifying_criteria`
- `amount`, `currency`
- `status` (active/closed/draft)
- `created_by` (FK → auth.users)

**Indexes:**
- `idx_gigs_created_by` on `created_by`
- `idx_gigs_status` on `status`

##### 12. `gig_dates`
Multiple date ranges per gig.

**Key Fields:**
- `gig_id` (FK → gigs)
- `month`, `days` (e.g., "1-5, 10-15")

##### 13. `gig_locations`
Multiple locations per gig.

**Key Fields:**
- `gig_id` (FK → gigs)
- `location_name`

##### 14. `applications`
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

##### 15. `crew_availability`
User availability calendar.

**Key Fields:**
- `user_id` (FK → auth.users)
- `availability_date`, `is_available`
- `gig_id` (optional FK → gigs)

**Constraints:**
- UNIQUE(user_id, availability_date)

##### 16. `crew_contacts`
Contacts added to gigs by creators.

**Key Fields:**
- `gig_id` (FK → gigs)
- `user_id` (FK → auth.users)
- `department`, `role`, `company`
- `phone`, `email`

##### 17. `referrals`
User-to-user gig referrals.

**Key Fields:**
- `gig_id` (FK → gigs)
- `referred_user_id`, `referrer_user_id` (FK → auth.users)
- `status` (pending/accepted/declined)

##### 18. `notifications`
In-app notification system.

**Key Fields:**
- `user_id` (FK → auth.users)
- `type` (application_received/status_changed/referral_received)
- `title`, `message`
- `related_gig_id`, `related_application_id`
- `is_read` (Boolean)

**Indexes:**
- `idx_notifications_user_id` on `user_id`

---

## 📦 Storage Buckets

### 1. `resumes/` (Private)
- **Purpose**: User CVs and resumes
- **Max Size**: 5 MB
- **Allowed Types**: PDF, DOC, DOCX
- **Path Structure**: `{user_id}/{filename}`
- **Access**: Owner + Gig creators (for applicants)

### 2. `portfolios/` (Private)
- **Purpose**: Portfolio files (work samples, videos)
- **Max Size**: 10 MB
- **Allowed Types**: PDF, Images (JPEG/PNG/GIF/WebP), Videos (MP4/MOV/AVI)
- **Path Structure**: `{user_id}/{filename}`
- **Access**: Owner + Gig creators (for applicants)
- **Used For**: `user_credits.image_url`, `user_highlights.image_url`

### 3. `profile-photos/` (Public)
- **Purpose**: User profile pictures and banners
- **Max Size**: 2 MB
- **Allowed Types**: JPEG, PNG, WebP
- **Path Structure**: `{user_id}/{filename}`
- **Access**: Public read, Owner write
- **Used For**: `user_profiles.profile_photo_url`, `user_profiles.banner_url`

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Email/Password + OTP**
   ```
   Sign Up → Email Verification (OTP) → Profile Creation → Access Granted
   ```

2. **Google OAuth (PKCE)**
   ```
   Google Sign In → OAuth Callback → Profile Check → Access Granted
   ```

### Session Management

- **JWT Tokens**: Issued by Supabase Auth
- **Storage**: Adaptive (localStorage or sessionStorage)
- **Expiry**: Configurable (default: 1 hour access token, 7 days refresh token)
- **Keep Me Logged In**: Uses localStorage (persists after browser close)
- **Don't Keep Me Logged In**: Uses sessionStorage (expires on browser close)

### Authorization Levels

#### Public Access
- View active gigs (GET /api/gigs)
- View user profiles (public sections)
- No authentication required

#### Authenticated User
- View own profile, applications, skills
- Create gigs (if profile complete)
- Apply to gigs (if profile complete)
- Upload files
- Manage availability
- Edit profile, skills, credits, highlights

#### Gig Creator (Enhanced Access)
- View all applications to their gigs
- Update application status
- Access applicant resumes/portfolios
- Add contacts to their gigs
- Update/delete their gigs

---

## 🔒 Row Level Security (RLS)

All database tables enforce RLS policies:

### Key Security Rules

1. **Ownership Checks**: Users can only modify their own data
2. **Creator Access**: Gig creators have read access to applicant data
3. **Profile Completeness**: Certain actions require complete profiles
4. **Anti-Fraud**: Users cannot apply to their own gigs
5. **Privacy**: 
   - Applicants cannot see other applicants
   - Visa information is private (only owner can see)
   - Most profile data is publicly viewable

### RLS Policy Examples

```sql
-- Users can view their own profile data
CREATE POLICY "Users can view own links"
ON user_links FOR SELECT
USING (auth.uid() = user_id);

-- Public can view profile links (for profile viewing)
CREATE POLICY "Public can view all user links"
ON user_links FOR SELECT
USING (true);

-- Users can only modify their own data
CREATE POLICY "Users can update own links"
ON user_links FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Visa info is private
CREATE POLICY "Users can view own visa info"
ON user_visa_info FOR SELECT
USING (auth.uid() = user_id);
-- No public policy for visa_info

-- Gig creators can view all applications to their gigs
CREATE POLICY "Creators can view gig applications"
ON applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM gigs
    WHERE gigs.id = applications.gig_id
    AND gigs.created_by = auth.uid()
  )
);

-- Users cannot apply to their own gigs
CREATE POLICY "Cannot apply to own gigs"
ON applications FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM gigs
    WHERE gigs.id = gig_id
    AND gigs.created_by = auth.uid()
  )
);
```

---

## 📡 API Architecture

### Modular Route Structure

```
/app/api/
├── health/route.js                              # API health check
├── profile/
│   ├── route.js                                 # GET/PATCH profile
│   ├── check/route.js                           # GET profile status
│   ├── links/route.js                           # GET/POST/PATCH/DELETE links ⭐ NEW
│   ├── roles/route.js                           # GET/POST/DELETE roles ⭐ NEW
│   ├── languages/route.js                       # GET/POST/PATCH/DELETE languages ⭐ NEW
│   ├── visa/route.js                            # GET/POST/PATCH visa info ⭐ NEW
│   ├── travel-countries/route.js                # GET/POST/DELETE travel countries ⭐ NEW
│   ├── credits/route.js                         # GET/POST/PATCH/DELETE credits ⭐ NEW
│   ├── highlights/route.js                      # GET/POST/PATCH/DELETE highlights ⭐ NEW
│   └── recommendations/route.js                 # GET/POST/DELETE recommendations ⭐ NEW
├── skills/
│   ├── route.js                                 # GET/POST skills
│   └── [id]/route.js                            # PATCH/DELETE skill ⭐ UPDATED
├── availability/
│   ├── route.js                                 # GET/POST availability
│   ├── check/route.js                           # GET conflicts
│   └── [id]/route.js                            # PATCH availability
├── notifications/
│   ├── route.js                                 # GET notifications
│   ├── [id]/read/route.js                       # PATCH mark read
│   └── mark-all-read/route.js                   # PATCH mark all
├── contacts/
│   ├── route.js                                 # POST contact
│   ├── gig/[gigId]/route.js                     # GET gig contacts
│   └── [id]/route.js                            # DELETE contact
├── referrals/
│   └── route.js                                 # GET/POST referrals
├── upload/
│   ├── resume/route.js                          # POST resume
│   ├── portfolio/route.js                       # POST portfolio
│   └── profile-photo/route.js                   # POST photo
├── gigs/
│   ├── route.js                                 # GET/POST gigs
│   └── [id]/
│       ├── route.js                             # GET/PATCH/DELETE gig
│       ├── apply/route.js                       # POST apply
│       └── applications/
│           ├── route.js                         # GET applications
│           └── [applicationId]/status/route.js  # PATCH status
└── applications/
    ├── my/route.js                              # GET my apps
    └── [id]/route.js                            # GET app details
```

### Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional details"
}
```

---

## 🔧 Key Backend Features

### 1. Automatic Notifications
Triggered on specific events:
- Application received → Notifies gig creator
- Application status changed → Notifies applicant
- Referral created → Notifies referred user

### 2. Profile Completeness Check
Before creating gigs or applying:
```javascript
const { isComplete } = await checkProfileComplete(userId);
if (!isComplete) {
  return errorResponse('Complete your profile first', 403);
}
```

### 3. Availability Conflict Detection
Check if user has conflicting bookings:
```javascript
const conflicts = await checkAvailabilityConflicts(userId, date);
```

### 4. File Upload with Validation
- Size limits enforced
- MIME type checking
- Path-based access control
- Automatic URL generation

### 5. Comprehensive Logging
All API routes log:
- Method and endpoint
- User ID
- Parameters
- Success/failure

### 6. Automatic Timestamp Updates ⭐ NEW
Triggers automatically update `updated_at` columns on:
- user_profiles
- applicant_skills
- user_links
- user_languages
- user_visa_info
- user_credits
- user_highlights

---

## 🌐 Environment Variables

### Required Variables

```env
# Base URL (for API calls)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# CORS (optional)
CORS_ORIGINS=*
```

### Security Notes
- `NEXT_PUBLIC_*` variables are exposed to browser
- Anon key is safe to expose (RLS protects data)
- Never expose service role key in frontend

---

## 📈 Performance Considerations

### Database Indexes

**Existing Indexes:**
- `gigs.created_by`
- `gigs.status`
- `applications.gig_id`
- `applications.applicant_user_id`
- `notifications.user_id`

**New Profile Indexes:** ⭐
- `user_links(user_id, sort_order)`
- `user_roles(user_id, sort_order)`
- `user_languages(user_id)`
- `user_visa_info(user_id)`
- `user_travel_countries(user_id)`
- `user_credits(user_id, sort_order)`
- `user_credits(user_id, start_date DESC)`
- `user_highlights(user_id, sort_order)`
- `user_recommendations(user_id)`
- `user_recommendations(recommended_user_id)`
- `applicant_skills(user_id, sort_order)`

### Pagination
All list endpoints support pagination:
```
GET /api/gigs?page=1&limit=10
```

### Efficient Queries
- Uses `.maybeSingle()` to avoid errors
- Joins minimize database round-trips
- Selective field fetching
- Sort order columns for efficient ordering

---

## 🚦 Data Flow Examples

### Creating a Complete Profile

```
1. Frontend: POST /api/profile with basic data
2. Backend: Validate auth
3. Database: Insert/Update user_profiles
4. Frontend: POST /api/profile/links with social links
5. Database: Insert into user_links
6. Frontend: POST /api/profile/roles with professional roles
7. Database: Insert into user_roles
8. Frontend: POST /api/profile/languages with languages
9. Database: Insert into user_languages
10. Frontend: POST /api/skills with skills + descriptions
11. Database: Insert into applicant_skills
12. Frontend: POST /api/profile/credits with work history
13. Database: Insert into user_credits
14. Backend: Calculate profile_completion_percentage
15. Backend: Update user_profiles.profile_completion_percentage
16. Frontend: Display success message
```

### Viewing a Profile

```
1. Frontend: GET /api/profile?userId={id}
2. Backend: Query user_profiles
3. Backend: Query user_links (ordered by sort_order)
4. Backend: Query user_roles (ordered by sort_order)
5. Backend: Query user_languages
6. Backend: Query user_travel_countries
7. Backend: Query applicant_skills (ordered by sort_order)
8. Backend: Query user_credits (ordered by sort_order)
9. Backend: Query user_highlights (ordered by sort_order)
10. Backend: Query user_recommendations with profile photos
11. Backend: Combine all data into profile object
12. Frontend: Render complete profile
```

### Creating a Gig
```
1. Frontend: POST /api/gigs with gig data
2. Backend: Validate auth and profile completeness
3. Database: Insert into gigs table
4. Database: Insert gig_dates records
5. Database: Insert gig_locations records
6. Backend: Return complete gig object
7. Frontend: Display success message
```

### Applying to a Gig
```
1. Frontend: Upload resume → POST /api/upload/resume
2. Backend: Store in Supabase Storage → Return URL
3. Frontend: POST /api/gigs/{id}/apply with resume URL
4. Backend: Validate (auth, profile, not own gig, unique application)
5. Database: Insert application record
6. Database: Create notification for gig creator
7. Backend: Return application confirmation
8. Frontend: Display success message
```

---

## 📊 Database Relationship Diagram

```
auth.users (Supabase Auth)
    │
    ├──[1:1]──> user_profiles (Extended profile data)
    │               ├── Updated with 5 new columns ⭐
    │               │
    ├──[1:N]──> user_links (Social/portfolio links) ⭐ NEW
    ├──[1:N]──> user_roles (Professional roles) ⭐ NEW
    ├──[1:N]──> user_languages (Languages with skills) ⭐ NEW
    ├──[1:1]──> user_visa_info (Visa information) ⭐ NEW
    ├──[1:N]──> user_travel_countries (Travel availability) ⭐ NEW
    ├──[1:N]──> user_credits (Work history) ⭐ NEW
    ├──[1:N]──> user_highlights (Profile highlights) ⭐ NEW
    ├──[M:N]──> user_recommendations (Profile recommendations) ⭐ NEW
    │
    ├──[1:N]──> applicant_skills (Skills - Updated with 5 new columns) ⭐
    ├──[1:N]──> gigs (Created gigs)
    ├──[1:N]──> applications (Gig applications)
    ├──[1:N]──> crew_availability (Availability calendar)
    ├──[1:N]──> notifications (User notifications)
    ├──[1:N]──> referrals (Sent/received referrals)
    └──[1:N]──> crew_contacts (Added contacts)

gigs
    ├──[1:N]──> gig_dates (Date ranges)
    ├──[1:N]──> gig_locations (Locations)
    ├──[1:N]──> applications (Applications to gig)
    ├──[1:N]──> crew_contacts (Gig contacts)
    └──[1:N]──> referrals (Gig referrals)
```

---

## 📊 Backend Health Metrics

### Monitoring Endpoints

**Health Check:**
```bash
GET /api/health
Response: { "status": "ok", "timestamp": "2025-01-15T10:00:00Z" }
```

### Performance Expectations

| Operation | Expected Response Time |
|-----------|------------------------|
| Get gigs list | < 100ms |
| Create gig | < 200ms |
| Apply to gig | < 150ms |
| Upload file | < 500ms (depends on size) |
| Get profile | < 50ms |
| Get complete profile with relations | < 150ms ⭐ |
| Update profile section | < 100ms ⭐ |

---

## 🎯 Integration Requirements

### For New Frontend to Work:

1. ✅ Use Supabase client for authentication
2. ✅ Store JWT tokens correctly (adaptive storage)
3. ✅ Send Authorization header with all authenticated requests
4. ✅ Handle profile completion flow
5. ✅ Respect RLS policies (enforced by backend)
6. ✅ Use proper file upload patterns
7. ✅ Handle errors gracefully
8. ✅ Implement proper session management
9. ✅ Support profile relations (links, roles, languages, etc.) ⭐ NEW
10. ✅ Handle sort_order for ordered lists ⭐ NEW

---

## 🆕 What's New in Version 2.0

### Schema Changes
- ✅ 8 new profile-related tables
- ✅ 10 new columns added to existing tables
- ✅ 40+ new RLS policies
- ✅ 15+ new indexes for performance
- ✅ Automatic timestamp triggers
- ✅ Enhanced data integrity with constraints

### Feature Enhancements
- ✅ Complete profile system with all UI requirements
- ✅ Social/portfolio links management
- ✅ Professional roles/titles
- ✅ Language skills with proficiency levels
- ✅ Visa and work authorization tracking
- ✅ Travel availability by country
- ✅ Work history/credits with images
- ✅ Profile highlights and achievements
- ✅ Profile recommendations system
- ✅ Enhanced skills with descriptions and ordering

### API Additions (Recommended)
- `/api/profile/links` - Manage social links
- `/api/profile/roles` - Manage professional roles
- `/api/profile/languages` - Manage languages
- `/api/profile/visa` - Manage visa information
- `/api/profile/travel-countries` - Manage travel availability
- `/api/profile/credits` - Manage work history
- `/api/profile/highlights` - Manage highlights
- `/api/profile/recommendations` - Manage recommendations
- `/api/skills/[id]` - Update/delete individual skills

---

## 📝 Migration Notes

### From Version 1.0 to 2.0

**Database Changes:**
1. Run `02_alter_commands.sql` - Modifies existing tables
2. Run `03_create_tables.sql` - Creates 8 new tables
3. Run `04_rls_policies.sql` - Applies security policies

**Breaking Changes:**
- None - All changes are additive

**Backward Compatibility:**
- ✅ All existing functionality maintained
- ✅ Old API endpoints still work
- ✅ No data migration required for existing users
- ✅ New fields have sensible defaults

---

## 📝 Next Steps

Refer to the following documents for detailed information:

### Core Documentation (Existing)
1. **API_ENDPOINTS_REFERENCE.md** - Complete API documentation
2. **AUTHENTICATION_INTEGRATION_GUIDE.md** - Auth setup instructions
3. **DATABASE_MODELS_AND_RELATIONSHIPS.md** - Data structure details
4. **FILE_UPLOAD_PATTERNS.md** - Storage integration guide
5. **FRONTEND_INTEGRATION_CHECKLIST.md** - Step-by-step implementation
6. **COMMON_PITFALLS_AND_SOLUTIONS.md** - Troubleshooting guide

### Profile Schema Documentation (New) ⭐
7. **backend-command/profile/01_analysis.md** - Gap analysis
8. **backend-command/profile/02_alter_commands.sql** - ALTER statements
9. **backend-command/profile/03_create_tables.sql** - CREATE statements
10. **backend-command/profile/04_rls_policies.sql** - Security policies
11. **backend-command/profile/05_execution_plan.md** - Execution guide
12. **backend-command/profile/06_schema_diagram.md** - Visual schema
13. **backend-command/profile/07_quick_reference.md** - Quick reference

---

## 📊 Statistics Summary

### Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 18 |
| Profile Tables | 10 |
| Gigs/Application Tables | 8 |
| Total Indexes | 30+ |
| Total RLS Policies | 60+ |
| Storage Buckets | 3 |
| API Endpoints | 40+ |

### Code Coverage

| Component | Status |
|-----------|--------|
| Authentication | ✅ Complete |
| Profile Management | ✅ Complete |
| Gigs System | ✅ Complete |
| Applications | ✅ Complete |
| File Uploads | ✅ Complete |
| Notifications | ✅ Complete |
| RLS Security | ✅ Complete |

---

**Document Version:** 2.0.0  
**Last Updated:** January 2025  
**Backend Status:** ✅ Production Ready (Updated with Profile Schema)  
**Database Schema:** ✅ 18 Tables (10 Profile + 8 Gigs/Apps)
