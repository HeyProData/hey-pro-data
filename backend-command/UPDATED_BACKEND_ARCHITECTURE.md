# Backend Architecture Overview - UPDATED

## HeyProData Backend Infrastructure

This document provides a comprehensive overview of the **UPDATED** backend architecture including all profile-related enhancements.

**Last Updated:** January 2025  
**Version:** 2.3 (Updated with Gigs Enhancement)

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
│  │  /explore ⭐ │  │  Filters     │  │  useSearch   │            │
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
│                    API ROUTES (34+ Endpoints)                       │
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
│                                                                     │
│  ┌──────────────────────────────────────────────────┐            │
│  ┌──────────────────────────────────────────────────┐            │
│  │ Explore/Search (3) ⭐ v2.1                       │            │
│  │ - GET /api/explore (search & filter)              │            │
│  │ - GET /api/explore/categories                     │            │
│  │ - GET /api/explore/[userId]                       │            │
│  └──────────────────────────────────────────────────┘            │
│                                                                     │
│  ┌──────────────────────────────────────────────────┐            │
│  │ Collab (14) ⭐ NEW v2.2                           │            │
│  │ - POST/GET /api/collab (create, list)             │            │
│  │ - GET /api/collab/my (my posts)                   │            │
│  │ - GET/PATCH/DELETE /api/collab/[id]               │            │
│  │ - POST/DELETE /api/collab/[id]/interest           │            │
│  │ - GET/POST /api/collab/[id]/collaborators         │            │
│  │ - POST /api/upload/collab-cover                   │            │
│  └──────────────────────────────────────────────────┘            │
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
│  │  - 22 Tables with Relationships ⭐ UPDATED v2.2           │      │
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
│  │  - collab-covers/ (Public, 5MB) ⭐ NEW v2.2               │      │
│  └─────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Summary

### Core Tables (23 Total) ⭐ UPDATED v2.3

#### PROFILE TABLES (10 Tables)

##### 1. `user_profiles` ⭐ UPDATED (Version 2.1)
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
- `availability` ⭐ NEW - Work status (Available/Not Available/Booked)
- `profile_completion_percentage` ⭐ NEW - 0-100 completion score
- `is_profile_complete` (Boolean)
- `updated_at` ⭐ NEW - Last update timestamp

**Explore Feature Fields (v2.1):** ⭐ NEW
- `experience_level` - Skill level (Intern/Learning|Assisted/Competent|Independent/Expert|Lead)
- `day_rate` - Daily rate for work (integer)
- `rate_currency` - Currency code (AED, USD, EUR, etc.)
- `production_types` - Array of production types (commercial, tv, film, social)
- `visible_in_explore` - Boolean flag for explore visibility
- `primary_category` - Main role category for filtering (Director, Cinematographer, etc.)

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

#### GIGS & APPLICATIONS TABLES (9 Tables) ⭐ ENHANCED v2.3

##### 11. `gigs` ⭐ ENHANCED (Version 2.3)
Main table for job postings with comprehensive gig management.

**Key Fields:**
- `id` (PK)
- `title`, `description`, `qualifying_criteria`
- `amount`, `currency`
- `status` (active/closed/draft)
- `created_by` (FK → auth.users)

**New Fields (v2.3):** ⭐
- `slug` (TEXT, UNIQUE) - URL-friendly identifier for routing
- `crew_count` (INTEGER) - Number of crew needed (default 1)
- `role` (TEXT) - GIG role (director, producer, cinematographer, etc.)
- `type` (TEXT) - GIG type (contract, full-time, part-time)
- `department` (TEXT) - Department or specialty area
- `company` (TEXT) - Production company name (optional)
- `is_tbc` (BOOLEAN) - "To Be Confirmed" scheduling flag
- `request_quote` (BOOLEAN) - Whether to request quote instead of fixed rate
- `expiry_date` (TIMESTAMPTZ) - Application deadline ("Apply before" date)
- `supporting_file_label` (TEXT) - Label for reference file
- `reference_url` (TEXT) - URL for reference link

**Indexes:**
- `idx_gigs_created_by` on `created_by`
- `idx_gigs_status` on `status`
- `idx_gigs_slug` on `slug` ⭐ NEW - For slug-based lookups
- `idx_gigs_role` on `role` ⭐ NEW - Filter by role
- `idx_gigs_type` on `type` ⭐ NEW - Filter by type
- `idx_gigs_department` on `department` ⭐ NEW - Filter by department
- `idx_gigs_expiry_date` on `expiry_date` ⭐ NEW - Filter expired gigs
- `idx_gigs_status_expiry` on `(status, expiry_date)` ⭐ NEW - Active gigs query
- `idx_gigs_created_by_status` on `(created_by, status)` ⭐ NEW - User's gigs query
- `idx_gigs_search` (GIN) on title + description ⭐ NEW - Full-text search

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
- `idx_applications_gig_status` on `(gig_id, status)` ⭐ NEW v2.3 - Filter applications by status

##### 15. `crew_availability` ⭐ ENHANCED (Version 2.3)
User availability calendar with status tracking.

**Key Fields:**
- `user_id` (FK → auth.users)
- `availability_date`
- `status` (TEXT) ⭐ CHANGED - 'available' | 'hold' | 'na' (was `is_available` BOOLEAN)
- `gig_id` (optional FK → gigs)

**Constraints:**
- UNIQUE(user_id, availability_date)
- CHECK(status IN ('available', 'hold', 'na'))

**Indexes:**
- `idx_crew_availability_status` ⭐ NEW - Filter by status
- `idx_crew_availability_user_status` ⭐ NEW - User availability queries
- `idx_crew_availability_gig_status` ⭐ NEW - Gig availability queries

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

##### 19. `gig_references` ⭐ NEW v2.3
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

#### COLLAB TABLES (4 Tables) ⭐ NEW v2.2

##### 20. `collab_posts`
Main table for collaboration posts where users share project ideas and seek collaborators.

**Key Fields:**
- `id` (PK, UUID)
- `user_id` (FK → auth.users) - Post creator
- `title` (TEXT, NOT NULL)
- `slug` (TEXT, NOT NULL, UNIQUE)
- `summary` (TEXT, NOT NULL)
- `cover_image_url` (TEXT)
- `status` (TEXT) - open/closed/draft
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- `idx_collab_posts_user_id` on `user_id`
- `idx_collab_posts_status` on `status`
- `idx_collab_posts_created_at` on `created_at DESC`
- `idx_collab_posts_slug` on `slug`

##### 21. `collab_tags`
Tags for categorizing collab posts (many-to-many).

**Key Fields:**
- `id` (PK, UUID)
- `collab_id` (FK → collab_posts)
- `tag_name` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(collab_id, tag_name)

**Indexes:**
- `idx_collab_tags_collab_id` on `collab_id`
- `idx_collab_tags_tag_name` on `tag_name`

##### 22. `collab_interests`
Users who expressed interest in collab posts.

**Key Fields:**
- `id` (PK, UUID)
- `collab_id` (FK → collab_posts)
- `user_id` (FK → auth.users)
- `created_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(collab_id, user_id)

**Indexes:**
- `idx_collab_interests_collab_id` on `collab_id`
- `idx_collab_interests_user_id` on `user_id`

##### 23. `collab_collaborators`
Approved collaborators for collab projects.

**Key Fields:**
- `id` (PK, UUID)
- `collab_id` (FK → collab_posts)
- `user_id` (FK → auth.users)
- `role` (TEXT) - Designer, Editor, etc.
- `department` (TEXT) - Creative, Engineering, etc.
- `added_at` (TIMESTAMP)
- `added_by` (FK → auth.users)

**Constraints:**
- UNIQUE(collab_id, user_id)

**Indexes:**
- `idx_collab_collaborators_collab_id` on `collab_id`
- `idx_collab_collaborators_user_id` on `user_id`

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

### 4. `collab-covers/` (Public) ⭐ NEW v2.2
- **Purpose**: Cover images for collab posts
- **Max Size**: 5 MB
- **Allowed Types**: JPEG, JPG, PNG
- **Path Structure**: `{user_id}/{collab_id}/{filename}`
- **Access**: Public read, Owner write
- **Used For**: `collab_posts.cover_image_url`

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
├── applications/
│   ├── my/route.js                              # GET my apps
│   └── [id]/route.js                            # GET app details
├── explore/ ⭐ (v2.1)
│   ├── route.js                             # GET search & filter profiles
│   ├── categories/route.js                  # GET all categories
│   └── [userId]/route.js                    # GET profile details
└── collab/ ⭐ NEW (v2.2)
    ├── route.js                             # POST create, GET list all
    ├── my/route.js                          # GET my collab posts
    └── [id]/
        ├── route.js                         # GET details, PATCH update, DELETE
        ├── interest/route.js                # POST express, DELETE remove
        ├── interests/route.js               # GET list interested users
        ├── collaborators/
        │   ├── route.js                     # GET list, POST add
        │   └── [userId]/route.js            # DELETE remove collaborator
        └── close/route.js                   # PATCH close collab
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

## 🔍 Explore/Crew Directory Feature (v2.1)

### Overview
The Explore section (also called Crew Directory) allows users to discover and search for crew members based on various criteria including roles, location, experience, availability, and day rates.

### Frontend Location
- **Path:** `/app/(app)/(explore)/`
- **Main Pages:**
  - `/explore` - Browse all crew profiles
  - `/explore/[slug]` - Browse by category (Director, Cinematographer, etc.)
- **Components:**
  - `template.tsx` - Filter sidebar and search bar
  - Profile card display with avatar, banner, name, location, bio, roles

### Backend Requirements

#### Database Fields (user_profiles)
| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `experience_level` | TEXT (enum) | Skill level | "Competent \| Independent" |
| `day_rate` | INTEGER | Daily rate | 1500 |
| `rate_currency` | TEXT | Currency code | "AED" |
| `production_types` | TEXT[] | Production types | ["commercial", "tv"] |
| `visible_in_explore` | BOOLEAN | Explore visibility | true |
| `primary_category` | TEXT | Main role category | "Director" |

#### API Endpoints

##### 1. GET /api/explore
**Purpose:** Search and filter crew profiles

**Query Parameters:**
- `keyword` - Search in name, bio, roles
- `role` - Filter by specific role
- `category` - Filter by primary category
- `availability` - Filter by availability status
- `productionType` - Filter by production type
- `location` - Search in country/city
- `experienceLevel` - Filter by experience level
- `minRate` / `maxRate` - Rate range filter
- `page` / `limit` - Pagination
- `sortBy` / `sortOrder` - Sorting

**Response:**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "uuid",
        "name": "John Doe",
        "location": "UAE, Dubai",
        "summary": "Award-winning cinematographer...",
        "roles": ["Director", "Director | Commercial"],
        "availability": "Available",
        "category": "Director",
        "slug": "director",
        "bgimage": "https://...",
        "avatar": "https://...",
        "dayRate": 2000,
        "rateCurrency": "AED",
        "experienceLevel": "Expert | Lead",
        "productionTypes": ["commercial", "tv"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProfiles": 87,
      "limit": 20
    }
  }
}
```

##### 2. GET /api/explore/categories
**Purpose:** Get all role categories with counts

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "slug": "director",
        "title": "Director",
        "count": 25,
        "roles": ["Director", "Director | Commercial", "Assistant Director"]
      }
    ]
  }
}
```

##### 3. GET /api/explore/[userId]
**Purpose:** Get detailed profile for a specific user

**Response:** Complete profile object with all relations

### Filter Options

#### Role Categories (15 main categories)
1. **Director** - Director, Director | Commercial, Assistant Director, 1st/2nd/3rd AD
2. **Cinematographer** - Cinematographer, DP, Camera Operator, 1st/2nd AC, DIT, Steadicam, Gimbal, Drone
3. **Editor** - Editor, Assistant Editor, Colorist, VFX Artist, Motion Graphics, Sound Editor
4. **Producer** - Producer, Executive Producer, Line Producer, PM, Coordinator, PA
5. **Writer** - Writer, Screenwriter, Script Supervisor, Story Editor
6. **Production Designer** - Production Designer, Art Director, Set Designer, Set Decorator, Props, Costume, Makeup, Hair
7. **Sound Designer** - Sound Designer, Sound Mixer, Boom Operator, Location Sound
8. **Camera Operator** - Camera Operator, Steadicam, Gimbal, Drone
9. **Gaffer** - Gaffer, Key Gaffer, Best Boy, Grips
10. **Location Scout** - Location Scout, Location Assistant
11. **VFX Artist** - VFX Artist, VFX Supervisor, VFX Assistant
12. **Colorist** - Colorist, Color Timer, Color Grading/Correction
13. **Sound Engineer** - Sound Engineer, Sound Technician
14. **Makeup Artist** - Makeup Artist (various specializations)
15. **Other** - Miscellaneous roles

#### Experience Levels
- **Intern** - Helped on set, shadowed role
- **Learning | Assisted** - Assisted the role under supervision
- **Competent | Independent** - Can handle role solo
- **Expert | Lead** - Leads team, multiple projects

#### Production Types
- Commercial
- TV
- Film
- Social / Digital

#### Other Filters
- **Availability:** Available, Not Available, Booked
- **Location:** Free text search
- **Rate Range:** 0 - 5000+ (with currency)

### Implementation Status
- ✅ Frontend UI complete with hardcoded data
- ⏳ Backend database fields (pending - see implementation plan)
- ⏳ API endpoints (pending - see implementation plan)
- ⏳ Frontend-backend integration (pending - see implementation plan)

### Implementation Guide
See detailed step-by-step guide:
- **`backend-command/explore/01_EXPLORE_BACKEND_IMPLEMENTATION_PLAN.md`**

---

## 🔥 Collab Feature Overview (v2.2) ⭐ NEW

### Purpose
The Collab feature is a collaboration platform where users can:
- Post project ideas and creative collaborations with cover images
- Browse and search collab opportunities with filters
- Express interest in projects (with notification to owner)
- View interested users' profiles
- Manage team collaborators (add/remove)
- Track collaboration status (open/closed/draft)
- Close completed collaborations

### Frontend Location
- **Path:** `/app/(app)/(collab)/`
- **Main Pages:**
  - `/collab` - Browse all collabs feed and create new collab post
  - `/collab/manage-collab` - List of user's collab posts with management options
  - `/collab/manage-collab/[id]` - Edit specific collab post, view applicants, manage collaborators

### User Features

#### For All Users
1. **Browse Collab Feed:**
   - View all open collaboration posts
   - See post details (cover image, title, summary, tags)
   - View interest count and avatars of interested users
   - See author information (name, avatar, posted date)
   - Action buttons: Like, Share, Message, Express Interest

2. **Search & Filter:**
   - Search by keyword in title/summary
   - Filter by tags
   - Filter by status (open/closed)
   - Sort by date or popularity (interest count)

3. **Express Interest:**
   - Click "I'm interested" on any collab post (except own)
   - Join waitlist for popular projects
   - View own interest status

#### For Collab Post Creators
1. **Create Collab Post:**
   - Upload cover image (16:9 recommended, PNG/JPG up to 5MB)
   - Enter title (min 3 chars, max 200 chars)
   - Write summary/idea description (min 10 chars, max 5000 chars)
   - Add multiple tags (max 10 tags)
   - Set status (open/closed/draft)

2. **Manage Collab Posts:**
   - View all own collab posts
   - Edit existing posts (title, summary, tags, cover)
   - View list of interested users with profiles
   - View list of collaborators
   - Add collaborators from interested users
   - Remove collaborators
   - Close collaboration when complete
   - Delete collab posts

3. **Collaborator Management:**
   - View all users who expressed interest
   - Add users as collaborators with role and department
   - Chat with collaborators (future feature)
   - Organize team members by role/department

### Backend Implementation

#### Database Tables (4 New Tables)

**1. collab_posts (Main table)**
- `id` (UUID, PK) - Unique post identifier
- `user_id` (UUID, FK → auth.users) - Post creator
- `title` (TEXT, NOT NULL) - Post title
- `slug` (TEXT, NOT NULL, UNIQUE) - URL-friendly identifier
- `summary` (TEXT, NOT NULL) - Project description
- `cover_image_url` (TEXT) - Supabase Storage URL
- `status` (TEXT) - "open" | "closed" | "draft"
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**2. collab_tags (Tags system)**
- `id` (UUID, PK)
- `collab_id` (UUID, FK → collab_posts)
- `tag_name` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP)
- **Constraint:** UNIQUE(collab_id, tag_name)

**3. collab_interests (Interest tracking)**
- `id` (UUID, PK)
- `collab_id` (UUID, FK → collab_posts)
- `user_id` (UUID, FK → auth.users)
- `created_at` (TIMESTAMP)
- **Constraint:** UNIQUE(collab_id, user_id) - One interest per user per collab

**4. collab_collaborators (Team members)**
- `id` (UUID, PK)
- `collab_id` (UUID, FK → collab_posts)
- `user_id` (UUID, FK → auth.users)
- `role` (TEXT) - Collaborator role (Designer, Editor, etc.)
- `department` (TEXT) - Department/specialty (Creative, Engineering, etc.)
- `added_at` (TIMESTAMP)
- `added_by` (UUID, FK → auth.users) - Who added them
- **Constraint:** UNIQUE(collab_id, user_id)

#### Storage Bucket

**collab-covers/ (Public)**
- **Purpose:** Cover images for collab posts
- **Max Size:** 5 MB
- **Allowed Types:** PNG, JPG, JPEG
- **Path Structure:** `{user_id}/{collab_id}/{filename}`
- **Access Control:**
  - Public read access (anyone can view)
  - Authenticated write to own folder
  - File size validation enforced
  - Type validation enforced

#### API Endpoints (14 Total)

**CRUD Operations (6 endpoints):**
1. `POST /api/collab` - Create new collab post
2. `GET /api/collab` - List all collab posts (public feed with pagination)
3. `GET /api/collab/my` - Get my collab posts
4. `GET /api/collab/[id]` - Get specific collab details
5. `PATCH /api/collab/[id]` - Update collab post (owner only)
6. `DELETE /api/collab/[id]` - Delete collab post (owner only)

**Interest Management (3 endpoints):**
7. `POST /api/collab/[id]/interest` - Express interest (not on own posts)
8. `DELETE /api/collab/[id]/interest` - Remove interest
9. `GET /api/collab/[id]/interests` - List interested users (owner only)

**Collaborator Management (3 endpoints):**
10. `GET /api/collab/[id]/collaborators` - List collaborators (public)
11. `POST /api/collab/[id]/collaborators` - Add collaborator (owner only)
12. `DELETE /api/collab/[id]/collaborators/[userId]` - Remove collaborator (owner only)

**Additional Features (2 endpoints):**
13. `PATCH /api/collab/[id]/close` - Close collab (owner only)
14. `POST /api/upload/collab-cover` - Upload cover image

#### Row Level Security (17 Policies)

**collab_posts:**
- ✅ Public can view open/closed posts
- ✅ Users can view own drafts
- ✅ Authenticated users can create posts
- ✅ Only owners can update their posts
- ✅ Only owners can delete their posts

**collab_tags:**
- ✅ Public can view tags
- ✅ Only post owner can add tags
- ✅ Only post owner can delete tags

**collab_interests:**
- ✅ Users can express interest (validation: not on own posts)
- ✅ Users can remove own interest
- ✅ Owners can view all interests on their posts
- ✅ Users can view own interests

**collab_collaborators:**
- ✅ Public can view collaborators
- ✅ Only owners can add collaborators
- ✅ Only owners can remove collaborators

#### Performance Indexes (15+)

**collab_posts indexes:**
- `idx_collab_posts_user_id` ON `user_id` (filter by creator)
- `idx_collab_posts_status` ON `status` (filter by status)
- `idx_collab_posts_created_at` ON `created_at DESC` (sort by date)
- `idx_collab_posts_slug` ON `slug` (lookup by slug)
- Full-text search index on `title` and `summary`

**collab_tags indexes:**
- `idx_collab_tags_collab_id` ON `collab_id` (join with posts)
- `idx_collab_tags_tag_name` ON `tag_name` (filter by tag)

**collab_interests indexes:**
- `idx_collab_interests_collab_id` ON `collab_id` (count interests)
- `idx_collab_interests_user_id` ON `user_id` (user's interests)
- Composite index for unique constraint

**collab_collaborators indexes:**
- `idx_collab_collaborators_collab_id` ON `collab_id` (list team)
- `idx_collab_collaborators_user_id` ON `user_id` (user's collabs)

### API Request/Response Examples

#### Create Collab Post
**Request:**
```json
POST /api/collab
{
  "title": "Midnight Circus | Horror Launch",
  "summary": "Enter a chilling world of suspense and terror...",
  "tags": ["film writing", "screenplay", "creativity", "collaboration"],
  "cover_image_url": "https://project.supabase.co/storage/v1/object/public/collab-covers/...",
  "status": "open"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collab post created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "midnight-circus-horror-launch",
    "title": "Midnight Circus | Horror Launch",
    "summary": "Enter a chilling world of suspense and terror...",
    "tags": ["film writing", "screenplay", "creativity", "collaboration"],
    "cover_image_url": "https://...",
    "status": "open",
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-15T10:00:00.000Z"
  }
}
```

#### List Collab Posts (with filters)
**Request:**
```
GET /api/collab?page=1&limit=20&status=open&tag=screenplay&sortBy=interests
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collabs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Midnight Circus | Horror Launch",
        "slug": "midnight-circus-horror-launch",
        "summary": "Enter a chilling world of suspense and terror...",
        "tags": ["film writing", "screenplay", "creativity"],
        "cover_image_url": "https://...",
        "status": "open",
        "interests": 18,
        "interestAvatars": ["https://avatar1.jpg", "https://avatar2.jpg", "https://avatar3.jpg"],
        "author": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Michael Molar",
          "avatar": "https://avatar.jpg"
        },
        "created_at": "2025-01-15T10:00:00.000Z",
        "updated_at": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCollabs": 87,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Data Relationships

```
auth.users (Supabase Auth)
    │
    ├──[1:N]──> collab_posts (Created collabs)
    │               │
    │               ├──[1:N]──> collab_tags (Tags for categorization)
    │               ├──[1:N]──> collab_interests (Users who expressed interest)
    │               └──[1:N]──> collab_collaborators (Team members)
    │
    ├──[1:N]──> collab_interests (Expressed interests)
    └──[1:N]──> collab_collaborators (Collaborations)
```

### Data Flow Examples

#### Creating a Collab Post
```
1. User uploads cover image → POST /api/upload/collab-cover
2. Backend validates file (size < 5MB, type = PNG/JPG)
3. Backend stores in collab-covers/{user_id}/{temp-id}/{filename}
4. Backend returns public URL
5. User submits form → POST /api/collab with cover URL
6. Backend validates auth and required fields
7. Backend generates URL-friendly slug from title
8. Backend inserts into collab_posts
9. Backend inserts tags into collab_tags (batch insert)
10. Backend returns complete collab object with slug
11. Frontend redirects to /collab/manage-collab
```

#### Expressing Interest
```
1. User clicks "I'm interested" → POST /api/collab/[id]/interest
2. Backend validates:
   - User is authenticated
   - Collab exists and is open
   - User is not the owner (RLS check)
   - User hasn't already expressed interest (unique constraint)
3. Backend inserts into collab_interests
4. Backend creates notification for collab owner
5. Backend counts total interests
6. Backend returns updated interest count
7. Frontend updates button to "Waitlisted" with new count
8. Frontend updates interest avatars list
```

#### Viewing Collab Details
```
1. Request GET /api/collab/[id]
2. Backend queries collab_posts with JOIN to user_profiles (author data)
3. Backend queries collab_tags (array of tag names)
4. Backend counts collab_interests + fetches first 3 avatars
5. If authenticated:
   - Check if user expressed interest (userHasInterest flag)
   - Check if user is owner (isOwner flag)
6. If requester is owner:
   - Include full list of collab_collaborators with user profiles
7. Backend combines all data into complete object
8. Frontend renders collab details with conditional UI
```

#### Adding a Collaborator
```
1. Owner views interested users → GET /api/collab/[id]/interests
2. Backend validates ownership (RLS)
3. Backend returns paginated list with user profiles
4. Owner clicks "Add" on a user → POST /api/collab/[id]/collaborators
5. Backend validates:
   - User is owner
   - Target user exists
   - Target user not already a collaborator
6. Backend inserts into collab_collaborators with role/department
7. Backend creates notification for added user
8. Backend returns collaborator object
9. Frontend updates collaborator list and removes from interests
```

### Validation Rules

**Cover Image Upload:**
- Max file size: 5 MB
- Allowed types: PNG, JPG, JPEG only
- Recommended aspect ratio: 16:9
- Path validation: user must own the folder

**Collab Post Creation:**
- `title`: Required, 3-200 characters
- `summary`: Required, 10-5000 characters
- `tags`: Optional, array, max 10 tags
- `cover_image_url`: Optional, valid URL from collab-covers bucket
- `status`: Enum ("open" | "closed" | "draft"), defaults to "open"

**Express Interest:**
- Cannot express interest on own posts (RLS check)
- Cannot duplicate interest (unique constraint)
- Collab must be "open" status

**Add Collaborator:**
- Must be collab owner (RLS check)
- Target user must exist
- Cannot add duplicate collaborator (unique constraint)
- Role and department are optional

### Implementation Guide
See complete step-by-step implementation guide:
- **`backend-command/collab/README.md`** - Overview and quick start (START HERE)
- **`backend-command/collab/00_ANALYSIS.md`** - Frontend analysis and requirements
- **`backend-command/collab/01_CREATE_TABLES.sql`** - Database table creation SQL
- **`backend-command/collab/02_RLS_POLICIES.sql`** - Row Level Security policies SQL
- **`backend-command/collab/03_INDEXES.sql`** - Performance optimization indexes SQL
- **`backend-command/collab/04_STORAGE_BUCKET.sql`** - Storage bucket setup SQL
- **`backend-command/collab/05_IMPLEMENTATION_PLAN.md`** - Step-by-step implementation guide
- **`backend-command/collab/06_API_ENDPOINTS.md`** - Complete API documentation with examples
- **`backend-command/collab/07_QUICK_REFERENCE.md`** - Quick reference for common tasks

### Implementation Checklist

**Phase 1: Database Setup**
- [ ] Execute 01_CREATE_TABLES.sql (creates 4 tables)
- [ ] Execute 02_RLS_POLICIES.sql (applies 17 security policies)
- [ ] Execute 03_INDEXES.sql (creates 15+ performance indexes)
- [ ] Execute 04_STORAGE_BUCKET.sql (creates collab-covers bucket)
- [ ] Verify tables exist and have correct schema
- [ ] Verify RLS policies are active
- [ ] Verify indexes are created
- [ ] Verify storage bucket is configured

**Phase 2: API Implementation**
- [ ] Create /api/collab route structure
- [ ] Implement POST /api/collab (create collab)
- [ ] Implement GET /api/collab (list with filters)
- [ ] Implement GET /api/collab/my (user's collabs)
- [ ] Implement GET /api/collab/[id] (details)
- [ ] Implement PATCH /api/collab/[id] (update)
- [ ] Implement DELETE /api/collab/[id] (delete)
- [ ] Implement interest endpoints (POST, DELETE, GET)
- [ ] Implement collaborator endpoints (GET, POST, DELETE)
- [ ] Implement PATCH /api/collab/[id]/close
- [ ] Implement POST /api/upload/collab-cover

**Phase 3: Frontend Integration**
- [ ] Create API utility functions in frontend
- [ ] Update /collab page (replace hardcoded data)
- [ ] Update /collab/manage-collab page
- [ ] Update /collab/manage-collab/[id] page
- [ ] Add loading states and error handling
- [ ] Test all user flows end-to-end

**Phase 4: Testing & Optimization**
- [ ] Test create/edit/delete collab posts
- [ ] Test express/remove interest
- [ ] Test add/remove collaborators
- [ ] Test RLS policies (try unauthorized actions)
- [ ] Test file upload validation
- [ ] Performance test with large dataset (100+ posts)
- [ ] Test pagination and filters

### Implementation Status
- ✅ Frontend UI complete with hardcoded data
- ✅ Backend architecture designed and documented
- ✅ Database schema created (4 tables, complete SQL)
- ✅ RLS policies designed (17 policies, complete SQL)
- ✅ Performance indexes designed (15+ indexes, complete SQL)
- ✅ Storage bucket configured (complete SQL)
- ✅ API endpoints documented (14 endpoints with examples)
- ✅ Implementation plan ready (step-by-step guide)
- ⏳ Database migration pending (run SQL files in order)
- ⏳ API routes implementation pending
- ⏳ Frontend-backend integration pending

### Integration with Existing System
The collab feature integrates seamlessly with:
- **auth.users** - User authentication and profiles
- **user_profiles** - User names, avatars, bio for display
- **notifications** - Optional notifications for interests and collaborator additions
- **Storage system** - Uses existing Supabase Storage infrastructure

### Security Features
- ✅ Row Level Security (RLS) on all tables
- ✅ JWT token authentication via Supabase Auth
- ✅ Ownership validation (users can only modify own posts)
- ✅ File upload validation (size, type, ownership)
- ✅ Anti-fraud (cannot express interest on own posts)
- ✅ Unique constraints (no duplicate interests/collaborators)
- ✅ Public read for open posts, private for drafts

### Performance Features
- ✅ Database indexes on all foreign keys
- ✅ Composite indexes for common queries
- ✅ Full-text search indexes for title/summary
- ✅ Pagination support on all list endpoints
- ✅ Query optimization with selective field fetching
- ✅ Storage optimization (5MB limit, optimized paths)

---

## 🆕 What's New in Version 2.3

### Gigs Feature Enhancement ⭐ NEW
- ✅ Comprehensive analysis of frontend gigs UI requirements
- ✅ Added 11 new columns to `gigs` table for complete functionality
- ✅ Enhanced `crew_availability` table with status enum (available/hold/na)
- ✅ Created `gig_references` table for file and link references
- ✅ Designed 14+ performance indexes including full-text search
- ✅ Created 10 RLS policies for secure access control
- ✅ Complete SQL scripts ready to execute (ALTER, CREATE, INDEXES, RLS)
- ✅ Documented 8 API endpoints with request/response examples
- ✅ Created comprehensive implementation guide (5 phases, 11-17 hours)
- ⏳ Database migration ready (execute SQL files)
- ⏳ API routes implementation pending
- ⏳ Frontend-backend integration pending

**Key Enhancements:**
- **Slug-based routing:** SEO-friendly URLs for gigs (e.g., `/gigs/video-editors-shortfilm`)
- **Enhanced gig creation:** Support for crew count, role, type, department, company fields
- **Flexible scheduling:** TBC flag and expiry dates for applications
- **Reference management:** Multiple file and link references per gig
- **Quote requests:** Option to request quote instead of fixed rate
- **Calendar integration:** Transform gig dates into calendar view format
- **Availability tracking:** Detailed status (available/hold/na) for crew availability
- **Full-text search:** Fast search on gig title and description

**New Database Fields:**
| Field | Purpose |
|-------|---------|
| `slug` | URL-friendly identifier for routing |
| `crew_count` | Number of crew needed |
| `role` | GIG role (director, editor, etc.) |
| `type` | GIG type (contract, full-time, part-time) |
| `department` | Department/specialty |
| `company` | Production company |
| `is_tbc` | "To Be Confirmed" flag |
| `request_quote` | Request quote option |
| `expiry_date` | Application deadline |
| `supporting_file_label` | Reference file label |
| `reference_url` | Reference link URL |

**New Table:**
- `gig_references` - Store multiple file/link references per gig

**Documentation Files:** 6 comprehensive guides in `backend-command/gigs/`

---

## 🆕 What's New in Version 2.2

### Collab/Collaboration Feature ⭐ NEW
- ✅ Complete frontend UI for collaboration platform
- ✅ Designed 4 new database tables (collab_posts, collab_tags, collab_interests, collab_collaborators)
- ✅ Created 17 Row Level Security policies for data protection
- ✅ Designed 15+ performance indexes for fast queries
- ✅ Configured collab-covers storage bucket (5MB, PNG/JPG)
- ✅ Documented 14 new API endpoints with request/response examples
- ✅ Created comprehensive implementation guide with SQL scripts
- ✅ Validation rules, data flow examples, and integration patterns documented
- ⏳ Database migration pending (run SQL files)
- ⏳ API routes implementation pending
- ⏳ Frontend-backend integration pending

**Key Features:**
- Post project ideas with cover images and tags
- Browse collab feed with search and filters
- Express interest in projects with notifications
- Manage collaborators with roles and departments
- Track status (open/closed/draft)
- Full CRUD operations with proper security

**Documentation Files:** 8 comprehensive guides in `backend-command/collab/`

---

## 🆕 What's New in Version 2.1

### Explore/Search Feature
- ✅ Analyzed frontend explore section requirements
- ✅ Identified 6 new database fields needed for user_profiles
- ✅ Designed 3 new API endpoints for search and discovery
- ✅ Created comprehensive implementation plan
- ✅ Documented filter options and data structures
- ⏳ Database migration pending
- ⏳ API implementation pending
- ⏳ Frontend integration pending

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

### Profile Schema Documentation (Version 2.0) ⭐
7. **backend-command/profile/01_analysis.md** - Gap analysis
8. **backend-command/profile/02_alter_commands.sql** - ALTER statements
9. **backend-command/profile/03_create_tables.sql** - CREATE statements
10. **backend-command/profile/04_rls_policies.sql** - Security policies
11. **backend-command/profile/05_execution_plan.md** - Execution guide
12. **backend-command/profile/06_schema_diagram.md** - Visual schema
13. **backend-command/profile/07_quick_reference.md** - Quick reference

### Explore/Search Documentation (Version 2.1) ⭐
14. **backend-command/explore/01_EXPLORE_BACKEND_IMPLEMENTATION_PLAN.md** - Complete implementation guide

### Collab Feature Documentation (Version 2.2) ⭐
15. **backend-command/collab/README.md** - Overview and quick start
16. **backend-command/collab/00_ANALYSIS.md** - Frontend analysis and requirements
17. **backend-command/collab/01_CREATE_TABLES.sql** - Database table creation
18. **backend-command/collab/02_RLS_POLICIES.sql** - Security policies
19. **backend-command/collab/03_INDEXES.sql** - Performance indexes
20. **backend-command/collab/04_STORAGE_BUCKET.sql** - Storage configuration
21. **backend-command/collab/05_IMPLEMENTATION_PLAN.md** - Step-by-step guide
22. **backend-command/collab/06_API_ENDPOINTS.md** - API documentation
23. **backend-command/collab/07_QUICK_REFERENCE.md** - Quick reference guide

### Gigs Enhancement Documentation (Version 2.3) ⭐ NEW
24. **backend-command/gigs/README.md** - Overview and quick start (START HERE)
25. **backend-command/gigs/00_FRONTEND_ANALYSIS.md** - Frontend analysis and gap analysis
26. **backend-command/gigs/01_ALTER_STATEMENTS.sql** - ALTER gigs and crew_availability tables
27. **backend-command/gigs/02_CREATE_TABLES.sql** - CREATE gig_references table
28. **backend-command/gigs/03_INDEXES.sql** - Performance indexes (14+ indexes)
29. **backend-command/gigs/04_RLS_POLICIES.sql** - Security policies (10 policies)
30. **backend-command/gigs/05_IMPLEMENTATION_GUIDE.md** - Complete step-by-step implementation

---

## 📊 Statistics Summary

### Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 22 (⭐ +4 for collab v2.2) |
| Profile Tables | 10 |
| Gigs/Application Tables | 8 |
| Collab Tables | 4 (⭐ NEW v2.2) |
| Total Indexes | 50+ (⭐ +15 for collab v2.2) |
| Total RLS Policies | 79+ (⭐ +17 for collab v2.2) |
| Storage Buckets | 4 (⭐ +1 for collab v2.2) |
| API Endpoints | 57+ (⭐ +14 for collab v2.2) |

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
| Collab System | ⏳ Ready for Implementation (v2.2) |

---

**Document Version:** 2.2.0  
**Last Updated:** January 2025  
**Backend Status:** ✅ Production Ready (Profile Schema) | ⏳ Explore Feature (Planned) | ⏳ Collab Feature (Ready for Implementation)  
**Database Schema:** ✅ 18 Tables (10 Profile + 8 Gigs/Apps) | ⭐ +4 Tables for Collab v2.2 | ⏳ +6 Fields for Explore  
**API Endpoints:** ✅ 40+ Existing | ⭐ +14 Collab Endpoints (Documented) | ⏳ +3 Explore Endpoints (Planned)

### Recent Updates
- **v2.2 (Collab Feature):** ⭐ NEW - Complete collaboration platform with 4 tables, 14 endpoints, 17 RLS policies, comprehensive documentation
- **v2.1 (Explore/Search):** Added comprehensive implementation plan for crew directory feature
- **v2.0 (Profile Schema):** Enhanced profile system with 8 new tables and advanced features
- **v1.0 (Core System):** Initial gigs, applications, and authentication system
