# Collab Feature - Step-by-Step Implementation Plan

## Overview
This document provides a step-by-step guide to implement the backend for the Collab feature.

## Prerequisites

1. **Supabase Project Setup**
   - Active Supabase project
   - PostgreSQL database access
   - Supabase Storage enabled
   - Auth configured (Email/Password or OAuth)

2. **Existing Tables**
   - `auth.users` (Supabase Auth)
   - `user_profiles` (User profile information)

3. **Tools Required**
   - Supabase Dashboard access (SQL Editor)
   - Or Supabase CLI
   - Or Database client (psql, DBeaver, etc.)

---

## Phase 1: Database Setup

### Step 1: Create Tables
**File:** `01_CREATE_TABLES.sql`

**Actions:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `01_CREATE_TABLES.sql`
3. Execute the SQL
4. Verify success:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'collab_%'
   ORDER BY table_name;
   ```
   Expected: 4 tables (collab_posts, collab_tags, collab_interests, collab_collaborators)

**Expected Result:**
- ✅ 4 new tables created
- ✅ Foreign key constraints established
- ✅ Triggers for updated_at created

**Rollback (if needed):**
```sql
DROP TABLE IF EXISTS collab_collaborators CASCADE;
DROP TABLE IF EXISTS collab_interests CASCADE;
DROP TABLE IF EXISTS collab_tags CASCADE;
DROP TABLE IF EXISTS collab_posts CASCADE;
DROP FUNCTION IF EXISTS update_collab_updated_at();
```

---

### Step 2: Apply RLS Policies
**File:** `02_RLS_POLICIES.sql`

**Actions:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `02_RLS_POLICIES.sql`
3. Execute the SQL
4. Verify success:
   ```sql
   SELECT tablename, COUNT(*) as policy_count
   FROM pg_policies
   WHERE tablename LIKE 'collab_%'
   GROUP BY tablename
   ORDER BY tablename;
   ```
   Expected: 
   - collab_posts: 5 policies
   - collab_tags: 3 policies
   - collab_interests: 4 policies
   - collab_collaborators: 5 policies

**Expected Result:**
- ✅ RLS enabled on all collab tables
- ✅ 17 security policies created
- ✅ Proper access control enforced

**Test RLS (Important):**
After applying policies, test them:
1. Try to query as unauthenticated user
2. Try to insert with wrong user_id
3. Try to update someone else's post

---

### Step 3: Create Indexes
**File:** `03_INDEXES.sql`

**Actions:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `03_INDEXES.sql`
3. Execute the SQL
4. Verify success:
   ```sql
   SELECT tablename, COUNT(*) as index_count
   FROM pg_indexes
   WHERE tablename LIKE 'collab_%'
   AND indexname NOT LIKE '%pkey%'
   GROUP BY tablename
   ORDER BY tablename;
   ```

**Expected Result:**
- ✅ 15+ indexes created
- ✅ Query performance optimized
- ✅ Full-text search enabled on tags

**Performance Note:**
Indexes are created with `IF NOT EXISTS` so safe to run multiple times.

---

### Step 4: Setup Storage Bucket
**File:** `04_STORAGE_BUCKET.sql`

**Actions:**

**Option A: Via SQL (Recommended)**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `04_STORAGE_BUCKET.sql`
3. Execute the SQL

**Option B: Via Dashboard (If SQL fails)**
1. Go to Storage section in Supabase Dashboard
2. Click "New bucket"
3. Configuration:
   - Name: `collab-covers`
   - Public bucket: **YES**
   - File size limit: **5 MB**
   - Allowed MIME types: `image/jpeg, image/jpg, image/png`
4. Then run only the storage policy section from `04_STORAGE_BUCKET.sql`

**Verify:**
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'collab-covers';
```

**Expected Result:**
- ✅ collab-covers bucket created
- ✅ Public read access enabled
- ✅ 5MB file size limit set
- ✅ 4 storage policies created

---

## Phase 2: Backend API Implementation

### Step 5: Create API Route Structure

**Directory Structure:**
```
/app/api/collab/
  ├── route.js                    # POST (create), GET (list all)
  ├── my/
  │   └── route.js                # GET (my collabs)
  └── [id]/
      ├── route.js                # GET (details), PATCH (update), DELETE
      ├── interest/
      │   └── route.js            # POST (express), DELETE (remove)
      ├── interests/
      │   └── route.js            # GET (list interested users)
      ├── collaborators/
      │   ├── route.js            # GET (list), POST (add)
      │   └── [userId]/
      │       └── route.js        # DELETE (remove collaborator)
      └── close/
          └── route.js                # PATCH (close collab)

/app/api/upload/
  └── collab-cover/
      └── route.js                # POST (upload cover image)
```

---

### Step 6: Implement Core CRUD Endpoints

#### 6.1: POST /api/collab (Create New Collab)

**Request Body:**
```json
{
  "title": "Midnight Circus | Horror Launch",
  "summary": "Enter a chilling world...",
  "tags": ["film writing", "screenplay", "creativity"],
  "cover_image_url": "https://...supabase.co/storage/.../cover.jpg",
  "status": "open"  // optional, defaults to "open"
}
```

**Logic:**
1. Validate authentication
2. Validate required fields (title, summary)
3. Generate slug from title
4. Insert into `collab_posts`
5. Insert tags into `collab_tags`
6. Return complete collab object with tags

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Midnight Circus | Horror Launch",
    "slug": "midnight-circus-horror-launch",
    "summary": "Enter a chilling world...",
    "tags": ["film writing", "screenplay", "creativity"],
    "cover_image_url": "https://...",
    "status": "open",
    "user_id": "uuid",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

---

#### 6.2: GET /api/collab (List All Collabs)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (filter: "open", "closed", "all")
- `tag` (filter by tag name)
- `search` (search in title/summary)

**Logic:**
1. Query `collab_posts` with filters
2. Join with `user_profiles` for author info
3. Aggregate tags from `collab_tags`
4. Count interests from `collab_interests`
5. Get first 3 interested user avatars
6. Apply pagination
7. Return array of collab objects

**Response:**
```json
{
  "success": true,
  "data": {
    "collabs": [
      {
        "id": "uuid",
        "title": "Midnight Circus | Horror Launch",
        "slug": "midnight-circus-horror-launch",
        "summary": "Enter a chilling world...",
        "tags": ["film writing", "screenplay"],
        "status": "open",
        "interests": 18,
        "interestAvatars": ["/image1.png", "/image2.png"],
        "postedOn": "15 Oct, 2025",
        "author": "Michael Molar",
        "avatar": "/avatar.jpg",
        "cover": "/bg.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCollabs": 87,
      "limit": 20
    }
  }
}
```

---

#### 6.3: GET /api/collab/my (My Collab Posts)

**Logic:**
1. Validate authentication
2. Query `collab_posts` where `user_id = auth.uid()`
3. Include all statuses (open, closed, draft)
4. Join with tags and interests
5. Return array of user's collab posts

---

#### 6.4: GET /api/collab/[id] (Collab Details)

**Logic:**
1. Query `collab_posts` by ID
2. Join with `user_profiles` for author
3. Get all tags from `collab_tags`
4. Get interest count and avatars
5. If requester is owner, include collaborators
6. Return complete collab object

---

#### 6.5: PATCH /api/collab/[id] (Update Collab)

**Request Body:**
```json
{
  "title": "Updated Title",
  "summary": "Updated summary",
  "tags": ["new tag 1", "new tag 2"],
  "cover_image_url": "https://..."
}
```

**Logic:**
1. Validate authentication and ownership
2. Update `collab_posts`
3. Delete old tags and insert new ones
4. Return updated collab object

---

#### 6.6: DELETE /api/collab/[id] (Delete Collab)

**Logic:**
1. Validate authentication and ownership
2. Delete from `collab_posts` (CASCADE will delete related records)
3. Return success message

---

### Step 7: Implement Interest Endpoints

#### 7.1: POST /api/collab/[id]/interest (Express Interest)

**Logic:**
1. Validate authentication
2. Check if collab exists
3. Check if user is not the owner
4. Check if interest already exists
5. Insert into `collab_interests`
6. Create notification for collab owner (optional)
7. Return success with updated interest count

---

#### 7.2: DELETE /api/collab/[id]/interest (Remove Interest)

**Logic:**
1. Validate authentication
2. Delete from `collab_interests` where user_id = auth.uid()
3. Return success

---

#### 7.3: GET /api/collab/[id]/interests (List Interested Users)

**Logic:**
1. Validate authentication and ownership
2. Query `collab_interests` for the collab
3. Join with `user_profiles` for user details
4. Return array of interested users

---

### Step 8: Implement Collaborator Endpoints

#### 8.1: GET /api/collab/[id]/collaborators

**Logic:**
1. Query `collab_collaborators` for the collab
2. Join with `user_profiles` for user details
3. Return array of collaborators with roles

---

#### 8.2: POST /api/collab/[id]/collaborators

**Request Body:**
```json
{
  "user_id": "uuid",
  "role": "Designer",
  "department": "Creative"
}
```

**Logic:**
1. Validate authentication and ownership
2. Check if user exists
3. Check if not already a collaborator
4. Insert into `collab_collaborators`
5. Create notification for added user (optional)
6. Return success

---

#### 8.3: DELETE /api/collab/[id]/collaborators/[userId]

**Logic:**
1. Validate authentication and ownership
2. Delete from `collab_collaborators`
3. Return success

---

### Step 9: Implement Additional Endpoints

#### 9.1: PATCH /api/collab/[id]/close (Close Collab)

**Logic:**
1. Validate authentication and ownership
2. Update status to "closed" in `collab_posts`
3. Return success

---

#### 9.2: POST /api/upload/collab-cover (Upload Cover)

**Request:** FormData with file

**Logic:**
1. Validate authentication
2. Validate file (type, size)
3. Generate unique filename
4. Upload to Supabase Storage (collab-covers bucket)
5. Return public URL

---

## Phase 3: Frontend Integration

### Step 10: Update Frontend to Use API

**Files to Modify:**
1. `/app/data/collabPosts.ts` - Replace with API calls
2. `/app/app/(app)/(collab)/collab/page.tsx` - Use API for create and list
3. `/app/app/(app)/(collab)/collab/manage-collab/page.tsx` - Use API for my collabs
4. `/app/app/(app)/(collab)/collab/manage-collab/[id]/EditCollabForm.tsx` - Use API for update

**API Integration Steps:**
1. Create API utility functions in `/app/lib/apiCalling.ts`
2. Replace hardcoded data with API calls
3. Handle loading states
4. Handle error states
5. Update UI based on real data

---

## Phase 4: Testing

### Step 11: Testing Checklist

**Database Tests:**
- [ ] Create collab post
- [ ] List all collab posts
- [ ] Filter by status
- [ ] Filter by tag
- [ ] Update collab post
- [ ] Delete collab post
- [ ] Express interest
- [ ] Remove interest
- [ ] Add collaborator
- [ ] Remove collaborator
- [ ] Close collab

**RLS Tests:**
- [ ] Anonymous users can view open collabs
- [ ] Users cannot update others' collabs
- [ ] Users cannot delete others' collabs
- [ ] Users cannot express interest in own collabs
- [ ] Only owners can add collaborators

**Performance Tests:**
- [ ] List query with 1000+ records
- [ ] Search with various keywords
- [ ] Filter by multiple tags
- [ ] Load collab with many interests

**Integration Tests:**
- [ ] Create collab from frontend
- [ ] Upload cover image
- [ ] Express interest from UI
- [ ] Manage collaborators from UI

---

## Phase 5: Optimization & Monitoring

### Step 12: Performance Optimization

1. **Query Optimization:**
   - Use EXPLAIN ANALYZE on slow queries
   - Add missing indexes if needed
   - Consider materialized views for complex aggregations

2. **Caching Strategy:**
   - Cache public collab feed (1-5 minutes)
   - Invalidate cache on new posts
   - Use Supabase Realtime for live updates (optional)

3. **Image Optimization:**
   - Implement image compression on upload
   - Generate thumbnails for list views
   - Use CDN for faster delivery

### Step 13: Monitoring Setup

1. **Database Monitoring:**
   - Track query performance in Supabase Dashboard
   - Monitor table sizes
   - Check index usage

2. **API Monitoring:**
   - Log API errors
   - Track response times
   - Monitor rate limits

3. **User Metrics:**
   - Track collab creation rate
   - Track interest engagement
   - Monitor active collaborations

---

## Rollback Plan

If you need to rollback the entire implementation:

```sql
-- 1. Drop storage policies
DROP POLICY IF EXISTS "Public can view collab cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own collab cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own collab cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own collab cover images" ON storage.objects;

-- 2. Delete storage bucket
DELETE FROM storage.buckets WHERE id = 'collab-covers';

-- 3. Drop helper functions
DROP FUNCTION IF EXISTS generate_collab_cover_path(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS get_collab_cover_url(TEXT);

-- 4. Drop tables (CASCADE removes all constraints and policies)
DROP TABLE IF EXISTS collab_collaborators CASCADE;
DROP TABLE IF EXISTS collab_interests CASCADE;
DROP TABLE IF EXISTS collab_tags CASCADE;
DROP TABLE IF EXISTS collab_posts CASCADE;

-- 5. Drop trigger function
DROP FUNCTION IF EXISTS update_collab_updated_at();
```

---

## Support & Troubleshooting

### Common Issues

**Issue: RLS policies blocking queries**
- Check if user is authenticated
- Verify JWT token is valid
- Check policy conditions match your use case

**Issue: Storage upload failing**
- Verify bucket exists and is public
- Check file size is under 5MB
- Verify MIME type is allowed

**Issue: Slow queries**
- Run EXPLAIN ANALYZE on the query
- Check if indexes are being used
- Consider adding composite indexes

**Issue: Foreign key violations**
- Ensure referenced user exists in auth.users
- Check CASCADE settings on DELETE

---

## Completion Checklist

- [ ] All tables created
- [ ] All RLS policies applied
- [ ] All indexes created
- [ ] Storage bucket configured
- [ ] All API endpoints implemented
- [ ] Frontend integrated with API
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Monitoring setup
- [ ] Documentation updated

---

**Implementation Status:** Ready for Execution
**Estimated Time:** 4-6 hours for complete implementation
**Priority:** High (Core Feature)
