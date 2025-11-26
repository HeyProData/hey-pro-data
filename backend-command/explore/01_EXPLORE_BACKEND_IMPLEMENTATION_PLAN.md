# Explore Section Backend Implementation Plan

## Document Information
**Created:** January 2025  
**Version:** 1.0  
**Purpose:** Step-by-step guide to implement backend support for the Explore/Crew Directory feature

---

## 📋 Executive Summary

This document provides a comprehensive implementation plan to align the backend architecture with the frontend Explore section requirements. The Explore section displays crew profiles with filtering capabilities based on roles, location, availability, experience, and rates.

### Current State
- ✅ Frontend UI implemented with hardcoded data (`/data/exploreProfiles.ts`)
- ✅ Backend has comprehensive profile tables (18 tables total)
- ❌ Backend missing specific fields for explore functionality
- ❌ No API endpoints for explore/search functionality

### Target State
- ✅ Backend with all required fields for explore functionality
- ✅ Search/filter API endpoints
- ✅ Frontend consuming real backend data instead of hardcoded profiles

---

## 🎯 Frontend Requirements Analysis

### 1. Profile Card Display Requirements

From `explore/page.tsx` and `[slug]/page.tsx`, each profile card shows:

| Field | Type | Source (Current) | Backend Mapping |
|-------|------|------------------|-----------------|
| `id` | string | Hardcoded | `user_profiles.user_id` |
| `name` | string | Hardcoded | `user_profiles.legal_first_name + legal_surname` or `alias_first_name + alias_surname` |
| `location` | string | Hardcoded | `user_profiles.country + city` |
| `summary` | string | Hardcoded | `user_profiles.bio` |
| `roles` | string[] | Hardcoded | `user_roles.role_name[]` |
| `availability` | string | Hardcoded | `user_profiles.availability` ✅ EXISTS |
| `bgimage` | string | Hardcoded | `user_profiles.banner_url` ✅ EXISTS |
| `avatar` | string | Hardcoded | `user_profiles.profile_photo_url` ✅ EXISTS |
| `category` | string | Hardcoded | Derived from primary role |
| `slug` | string | Hardcoded | Generated from category |

### 2. Filter Requirements

From `template.tsx`, the filter system includes:

#### A. Role/Category Filters (15 main categories)
```javascript
filterOptions = [
  "Director" → [Director, Director | Commercial, Assistant Director, 1st AD, 2nd AD, 3rd AD]
  "Cinematographer" → [Cinematographer, DP, Camera Operator, 1st AC, 2nd AC, DIT, etc.]
  "Editor" → [Editor, Assistant Editor, Colorist, VFX Artist, Motion Graphics, etc.]
  "Producer" → [Producer, Executive Producer, Line Producer, PM, Coordinator, PA]
  "Writer" → [Writer, Screenwriter, Script Supervisor, Story Editor]
  "Production Designer" → [Production Designer, Art Director, Set Designer, etc.]
  "Sound Designer" → [Sound Designer, Sound Mixer, Boom Operator, etc.]
  "Camera Operator" → [Camera Operator, Steadicam, Gimbal, Drone]
  "Gaffer" → [Gaffer, Key Gaffer, Best Boy Gaffer, Grips]
  "Location Scout" → [Location Scout, Location Assistant]
  "VFX Artist" → [VFX Artist, VFX Supervisor, VFX Assistant]
  "Colorist" → [Colorist, Color Timer, Color Grading/Correction]
  "Sound Engineer" → [Sound Engineer, Sound Technician]
  "Makeup Artist" → [Makeup Artist, Makeup Artist | Commercial/TV]
  "Other" → [Other, Other | Commercial/TV]
]
```

**Backend Mapping:** These are stored in `user_roles` table

#### B. Availability Filter
```javascript
options = ["available", "not_available", "booked"]
```

**Backend Status:** 
- ✅ Field exists: `user_profiles.availability`
- ⚠️ Current type: Text (should be enum or constrained)

#### C. Production Type Filter
```javascript
options = ["commercial", "tv", "film", "social / digital"]
```

**Backend Status:** 
- ❌ Field missing
- 🆕 Need to add: `production_types` array field to `user_profiles`

#### D. Location Filter
```javascript
Input field with location string (e.g., "UAE, Dubai")
```

**Backend Status:** 
- ✅ Fields exist: `user_profiles.country`, `user_profiles.city`
- 📝 Format as: `{country}, {city}`

#### E. Experience Level Filter
```javascript
options = [
  { title: "Intern", description: "helped on set, shadowed role" },
  { title: "Learning | Assisted", description: "assisted the role under supervision" },
  { title: "Competent | Independent", description: "can handle role solo" },
  { title: "Expert | Lead", description: "leads team, multiple projects" }
]
```

**Backend Status:** 
- ❌ Field missing
- 🆕 Need to add: `experience_level` enum field to `user_profiles`

#### F. Rate Range Filter
```javascript
minRate: 900
maxRate: 3000
range: 0-5000
```

**Backend Status:** 
- ❌ Field missing
- 🆕 Need to add: `day_rate`, `rate_currency` fields to `user_profiles`

---

## 🔧 Required Backend Changes

### PHASE 1: Database Schema Updates

#### 1.1 Add Missing Fields to `user_profiles`

```sql
-- Add experience level enum
ALTER TABLE user_profiles 
ADD COLUMN experience_level TEXT CHECK (
  experience_level IN ('Intern', 'Learning | Assisted', 'Competent | Independent', 'Expert | Lead')
);

-- Add rate information
ALTER TABLE user_profiles 
ADD COLUMN day_rate INTEGER; -- Daily rate in local currency

ALTER TABLE user_profiles 
ADD COLUMN rate_currency TEXT DEFAULT 'AED'; -- Currency code (AED, USD, EUR, etc.)

-- Add production types as array
ALTER TABLE user_profiles 
ADD COLUMN production_types TEXT[]; -- Array: ['commercial', 'tv', 'film', 'social']

-- Add visibility flag for explore section
ALTER TABLE user_profiles 
ADD COLUMN visible_in_explore BOOLEAN DEFAULT true;

-- Add primary category for easy filtering
ALTER TABLE user_profiles 
ADD COLUMN primary_category TEXT; -- e.g., 'Director', 'Cinematographer', 'Editor'

-- Update availability to be more structured
ALTER TABLE user_profiles 
ALTER COLUMN availability TYPE TEXT;

ALTER TABLE user_profiles 
ADD CONSTRAINT check_availability 
CHECK (availability IN ('Available', 'Not Available', 'Booked'));
```

#### 1.2 Add Indexes for Performance

```sql
-- Index for explore searches
CREATE INDEX idx_user_profiles_visible_in_explore 
ON user_profiles(visible_in_explore) 
WHERE visible_in_explore = true;

CREATE INDEX idx_user_profiles_availability 
ON user_profiles(availability);

CREATE INDEX idx_user_profiles_primary_category 
ON user_profiles(primary_category);

CREATE INDEX idx_user_profiles_day_rate 
ON user_profiles(day_rate) 
WHERE day_rate IS NOT NULL;

-- Composite index for common filter combinations
CREATE INDEX idx_user_profiles_explore_filters 
ON user_profiles(visible_in_explore, availability, primary_category) 
WHERE visible_in_explore = true;

-- GIN index for production types array
CREATE INDEX idx_user_profiles_production_types 
ON user_profiles USING GIN(production_types);
```

#### 1.3 Update Existing Data (Optional Migration)

```sql
-- Set default values for existing users
UPDATE user_profiles 
SET visible_in_explore = true,
    experience_level = 'Competent | Independent',
    rate_currency = 'AED'
WHERE visible_in_explore IS NULL;

-- Infer primary category from first role (if user_roles populated)
UPDATE user_profiles p
SET primary_category = (
  SELECT role_name 
  FROM user_roles 
  WHERE user_id = p.user_id 
  ORDER BY sort_order 
  LIMIT 1
)
WHERE primary_category IS NULL;
```

---

### PHASE 2: API Endpoint Design

#### 2.1 Explore/Search Endpoint

**Endpoint:** `GET /api/explore`

**Purpose:** Search and filter crew profiles for the explore section

**Query Parameters:**
```typescript
interface ExploreQueryParams {
  // Search & Filters
  keyword?: string;           // Search in name, bio, roles
  role?: string;              // Filter by specific role (from user_roles)
  category?: string;          // Filter by primary category
  availability?: string;      // 'Available' | 'Not Available' | 'Booked'
  productionType?: string;    // 'commercial' | 'tv' | 'film' | 'social'
  location?: string;          // Search in country/city
  experienceLevel?: string;   // 'Intern' | 'Learning | Assisted' | etc.
  minRate?: number;           // Minimum day rate
  maxRate?: number;           // Maximum day rate
  
  // Pagination
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100
  
  // Sorting
  sortBy?: string;            // 'name' | 'rate' | 'updated_at'
  sortOrder?: 'asc' | 'desc'; // Default: 'asc'
}
```

**Response Format:**
```typescript
interface ExploreResponse {
  success: boolean;
  data: {
    profiles: ExploreProfileCard[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProfiles: number;
      limit: number;
    };
    filters: {
      appliedFilters: AppliedFilters;
      availableRoles: string[];      // All roles from user_roles
      availableCategories: string[]; // Unique categories
    };
  };
}

interface ExploreProfileCard {
  id: string;                    // user_id
  name: string;                  // Full name (alias or legal)
  location: string;              // "{country}, {city}"
  summary: string;               // bio (truncated to 200 chars)
  roles: string[];               // Array of role_name from user_roles
  availability: 'Available' | 'Not Available' | 'Booked';
  category: string;              // primary_category
  slug: string;                  // Generated from category
  bgimage: string;               // banner_url
  avatar: string;                // profile_photo_url
  dayRate?: number;              // day_rate
  rateCurrency?: string;         // rate_currency
  experienceLevel?: string;      // experience_level
  productionTypes?: string[];    // production_types
}
```

**Implementation Steps:**

1. **Create route file:** `/app/api/explore/route.js`

2. **Query Logic:**
```javascript
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const keyword = searchParams.get('keyword') || '';
    const role = searchParams.get('role') || '';
    const category = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const productionType = searchParams.get('productionType') || '';
    const location = searchParams.get('location') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const minRate = parseInt(searchParams.get('minRate') || '0');
    const maxRate = parseInt(searchParams.get('maxRate') || '999999');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Build base query
    let query = supabase
      .from('user_profiles')
      .select(`
        user_id,
        legal_first_name,
        legal_surname,
        alias_first_name,
        alias_surname,
        bio,
        country,
        city,
        availability,
        primary_category,
        banner_url,
        profile_photo_url,
        day_rate,
        rate_currency,
        experience_level,
        production_types,
        user_roles!inner(role_name, sort_order)
      `, { count: 'exact' })
      .eq('visible_in_explore', true)
      .eq('is_profile_complete', true);
    
    // Apply filters
    if (keyword) {
      // Search in name and bio
      query = query.or(`
        legal_first_name.ilike.%${keyword}%,
        legal_surname.ilike.%${keyword}%,
        alias_first_name.ilike.%${keyword}%,
        alias_surname.ilike.%${keyword}%,
        bio.ilike.%${keyword}%
      `);
    }
    
    if (availability) {
      query = query.eq('availability', availability);
    }
    
    if (category) {
      query = query.eq('primary_category', category);
    }
    
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }
    
    if (location) {
      query = query.or(`country.ilike.%${location}%,city.ilike.%${location}%`);
    }
    
    if (productionType) {
      query = query.contains('production_types', [productionType]);
    }
    
    if (minRate > 0 || maxRate < 999999) {
      query = query.gte('day_rate', minRate).lte('day_rate', maxRate);
    }
    
    // Role-specific filter (search in user_roles)
    if (role) {
      query = query.eq('user_roles.role_name', role);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Sorting
    const sortColumn = sortBy === 'rate' ? 'day_rate' : sortBy === 'updated_at' ? 'updated_at' : 'legal_first_name';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Transform data
    const profiles = data.map(profile => {
      const displayName = profile.alias_first_name && profile.alias_surname
        ? `${profile.alias_first_name} ${profile.alias_surname}`
        : `${profile.legal_first_name} ${profile.legal_surname}`;
      
      return {
        id: profile.user_id,
        name: displayName,
        location: `${profile.country || ''}, ${profile.city || ''}`.trim().replace(/^,|,$/g, ''),
        summary: profile.bio ? profile.bio.substring(0, 200) : '',
        roles: profile.user_roles.map(r => r.role_name).sort((a, b) => a.sort_order - b.sort_order),
        availability: profile.availability,
        category: profile.primary_category,
        slug: toSlug(profile.primary_category),
        bgimage: profile.banner_url || '',
        avatar: profile.profile_photo_url || '',
        dayRate: profile.day_rate,
        rateCurrency: profile.rate_currency,
        experienceLevel: profile.experience_level,
        productionTypes: profile.production_types
      };
    });
    
    return Response.json({
      success: true,
      data: {
        profiles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
          totalProfiles: count || 0,
          limit
        }
      }
    });
    
  } catch (error) {
    console.error('Explore API error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

#### 2.2 Explore Categories Endpoint

**Endpoint:** `GET /api/explore/categories`

**Purpose:** Get all available categories with profile counts

**Response:**
```typescript
{
  success: true,
  data: {
    categories: [
      {
        slug: "director",
        title: "Director",
        count: 25,
        roles: ["Director", "Director | Commercial", "Assistant Director", ...]
      },
      // ...
    ]
  }
}
```

#### 2.3 Explore Profile Detail Endpoint

**Endpoint:** `GET /api/explore/[userId]`

**Purpose:** Get full profile details for a specific user (for detail view/modal)

**Response:** Complete profile object with all relations

---

### PHASE 3: Row Level Security (RLS) Updates

#### 3.1 Public Read Access for Explore

```sql
-- Allow public to view profiles marked as visible in explore
CREATE POLICY "Public can view explore profiles"
ON user_profiles FOR SELECT
USING (visible_in_explore = true AND is_profile_complete = true);

-- Allow public to view roles of users in explore
CREATE POLICY "Public can view roles of explore users"
ON user_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = user_roles.user_id
    AND user_profiles.visible_in_explore = true
    AND user_profiles.is_profile_complete = true
  )
);
```

#### 3.2 User Control of Visibility

```sql
-- Users can update their own explore visibility
CREATE POLICY "Users can update own explore visibility"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### PHASE 4: Frontend Integration Updates

#### 4.1 Replace Hardcoded Data Source

**Current:** `/data/exploreProfiles.ts`  
**Target:** API call to `/api/explore`

**Changes in `explore/page.tsx`:**

```typescript
// BEFORE (Hardcoded)
import { listExploreCategories } from "@/data/exploreProfiles"

// AFTER (API)
async function fetchExploreProfiles(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/explore?${queryString}`, {
    cache: 'no-store' // or use revalidate for ISR
  });
  return res.json();
}

export default async function ExplorePage() {
  const { data } = await fetchExploreProfiles();
  const profiles = data.profiles;
  
  // Rest of component...
}
```

#### 4.2 Connect Filters to API

**Changes in `template.tsx`:**

```typescript
const handleFilterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  
  // Build filter object
  const filters = {
    keyword: filterForm.keyword,
    availability: filterForm.availability,
    productionType: filterForm.productionType,
    location: filterForm.location,
    experienceLevel: filterForm.experience,
    minRate: filterForm.minRate,
    maxRate: filterForm.maxRate,
  };
  
  // Update URL with filters (client-side navigation)
  const queryString = new URLSearchParams(filters).toString();
  router.push(`/explore?${queryString}`);
};
```

#### 4.3 Dynamic Category Routes

**Changes in `explore/[slug]/page.tsx`:**

```typescript
// BEFORE
const category = getExploreCategory(slug)

// AFTER
const category = await fetchExploreProfiles({ category: slug });
```

---

## 📝 Implementation Checklist

### Database Changes
- [ ] Add new fields to `user_profiles` table
- [ ] Create indexes for performance
- [ ] Add RLS policies for public explore access
- [ ] Run data migration for existing users
- [ ] Test database queries with sample data

### API Development
- [ ] Create `/api/explore/route.js` endpoint
- [ ] Implement search and filter logic
- [ ] Add pagination support
- [ ] Create `/api/explore/categories/route.js`
- [ ] Create `/api/explore/[userId]/route.js`
- [ ] Test all API endpoints with Postman/curl
- [ ] Add error handling and validation

### Frontend Integration
- [ ] Update `explore/page.tsx` to use API
- [ ] Update `explore/[slug]/page.tsx` to use API
- [ ] Connect filters in `template.tsx` to API
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test responsive behavior
- [ ] Test filter combinations

### Testing & Validation
- [ ] Test search functionality
- [ ] Test all filter combinations
- [ ] Test pagination
- [ ] Test sorting
- [ ] Performance test with 100+ profiles
- [ ] Mobile responsiveness test
- [ ] Cross-browser testing

### Documentation
- [ ] Update API documentation
- [ ] Update user guide for profile visibility settings
- [ ] Create admin guide for managing explore section

---

## 🚀 Execution Order

### Step 1: Database Schema (1-2 hours)
1. Run ALTER TABLE commands to add new fields
2. Create indexes
3. Add RLS policies
4. Test with sample INSERT/SELECT queries

### Step 2: API Endpoint Development (3-4 hours)
1. Create explore route handler
2. Implement filter logic
3. Test with various query combinations
4. Create helper/utility functions

### Step 3: Frontend Integration (2-3 hours)
1. Replace hardcoded data with API calls
2. Connect filters to API
3. Add loading and error states
4. Test user experience

### Step 4: Testing & Polish (2-3 hours)
1. End-to-end testing
2. Performance optimization
3. Edge case handling
4. Documentation

**Total Estimated Time:** 8-12 hours

---

## 🔍 Data Migration Strategy

### For Existing Users

If you already have users in `user_profiles` table:

```sql
-- Step 1: Add fields with NULL allowed
ALTER TABLE user_profiles ADD COLUMN experience_level TEXT;
ALTER TABLE user_profiles ADD COLUMN day_rate INTEGER;
ALTER TABLE user_profiles ADD COLUMN rate_currency TEXT DEFAULT 'AED';
ALTER TABLE user_profiles ADD COLUMN production_types TEXT[];
ALTER TABLE user_profiles ADD COLUMN visible_in_explore BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN primary_category TEXT;

-- Step 2: Set defaults for existing users
UPDATE user_profiles 
SET 
  experience_level = 'Competent | Independent',
  visible_in_explore = true,
  rate_currency = 'AED'
WHERE experience_level IS NULL;

-- Step 3: Infer primary_category from user_roles
UPDATE user_profiles p
SET primary_category = (
  SELECT role_name 
  FROM user_roles 
  WHERE user_id = p.user_id 
  ORDER BY sort_order 
  LIMIT 1
)
WHERE primary_category IS NULL AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = p.user_id
);

-- Step 4: Add constraints after data is populated
ALTER TABLE user_profiles 
ADD CONSTRAINT check_experience_level 
CHECK (experience_level IN ('Intern', 'Learning | Assisted', 'Competent | Independent', 'Expert | Lead'));

ALTER TABLE user_profiles 
ADD CONSTRAINT check_availability 
CHECK (availability IN ('Available', 'Not Available', 'Booked'));
```

---

## 🎯 Success Metrics

After implementation, verify:

1. **Functional:**
   - ✅ Search returns relevant results
   - ✅ All filters work correctly
   - ✅ Pagination works smoothly
   - ✅ Profile cards display correctly

2. **Performance:**
   - ✅ API response time < 200ms for 20 profiles
   - ✅ Page load time < 1 second
   - ✅ Smooth scrolling and filtering

3. **Data Quality:**
   - ✅ All profiles have required fields populated
   - ✅ Images load correctly
   - ✅ Location data is accurate

---

## 📚 Related Documentation

- `UPDATED_BACKEND_ARCHITECTURE.md` - Overall backend structure
- `API_ENDPOINTS_REFERENCE.md` - API documentation template
- `DATABASE_MODELS_AND_RELATIONSHIPS.md` - Database schema details
- `FRONTEND_INTEGRATION_CHECKLIST.md` - Frontend integration guide

---

## 🐛 Common Issues & Solutions

### Issue 1: Slow Query Performance
**Solution:** Ensure indexes are created, use EXPLAIN ANALYZE to check query plan

### Issue 2: Missing Roles
**Solution:** Check that user_roles table is populated, verify JOIN conditions

### Issue 3: Filter Not Working
**Solution:** Check query parameter names match exactly, verify data types

### Issue 4: Images Not Loading
**Solution:** Verify Supabase Storage URLs, check bucket permissions (public)

---

**Document Status:** ✅ Ready for Implementation  
**Next Steps:** Review and execute Phase 1 (Database Schema Updates)
