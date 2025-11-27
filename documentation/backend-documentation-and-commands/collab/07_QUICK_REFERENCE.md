# Collab Feature - Quick Reference Guide

## 📦 Database Tables (4)

### collab_posts
Main collab posts table
```sql
id, user_id, title, slug, summary, cover_image_url, status, created_at, updated_at
```

### collab_tags
Tags for collabs (many-to-many)
```sql
id, collab_id, tag_name, created_at
```

### collab_interests
Users interested in collabs
```sql
id, collab_id, user_id, created_at
```

### collab_collaborators
Approved collaborators
```sql
id, collab_id, user_id, role, department, added_at, added_by
```

---

## 🔐 Key Relationships

```
collab_posts
  ├── user_id → auth.users (creator)
  ├── collab_tags (1:N)
  ├── collab_interests (1:N)
  └── collab_collaborators (1:N)

collab_interests
  ├── collab_id → collab_posts
  └── user_id → auth.users

collab_collaborators
  ├── collab_id → collab_posts
  ├── user_id → auth.users (collaborator)
  └── added_by → auth.users (who added them)
```

---

## 🔑 Key Indexes

```sql
-- collab_posts
idx_collab_posts_user_id (user_id)
idx_collab_posts_status (status)
idx_collab_posts_created_at (created_at DESC)
idx_collab_posts_slug (slug)

-- collab_tags
idx_collab_tags_collab_id (collab_id)
idx_collab_tags_tag_name (tag_name)

-- collab_interests
idx_collab_interests_collab_id (collab_id)
idx_collab_interests_user_id (user_id)

-- collab_collaborators
idx_collab_collaborators_collab_id (collab_id)
idx_collab_collaborators_user_id (user_id)
```

---

## 🔒 RLS Policy Summary

### collab_posts (5 policies)
- ✅ Public can view open/closed posts
- ✅ Users can view own drafts
- ✅ Authenticated users can create
- ✅ Owners can update/delete own posts

### collab_tags (3 policies)
- ✅ Public can view all tags
- ✅ Owners can add/delete tags

### collab_interests (4 policies)
- ✅ Users can view own interests
- ✅ Owners can view all interests on their posts
- ✅ Users can express interest (not on own posts)
- ✅ Users can remove own interest

### collab_collaborators (5 policies)
- ✅ Public can view collaborators
- ✅ Owners can add/update/remove collaborators

---

## 📡 API Endpoints (14)

### CRUD Operations
```
POST   /api/collab              Create collab
GET    /api/collab              List all collabs
GET    /api/collab/my           My collabs
GET    /api/collab/[id]         Collab details
PATCH  /api/collab/[id]         Update collab
DELETE /api/collab/[id]         Delete collab
```

### Interest Management
```
POST   /api/collab/[id]/interest     Express interest
DELETE /api/collab/[id]/interest     Remove interest
GET    /api/collab/[id]/interests    List interested users
```

### Collaborator Management
```
GET    /api/collab/[id]/collaborators          List collaborators
POST   /api/collab/[id]/collaborators          Add collaborator
DELETE /api/collab/[id]/collaborators/[userId] Remove collaborator
```

### Status & Upload
```
PATCH  /api/collab/[id]/close       Close collab
POST   /api/upload/collab-cover     Upload cover
```

---

## 📋 Quick SQL Commands

### Create all tables
```bash
psql < 01_CREATE_TABLES.sql
```

### Apply RLS policies
```bash
psql < 02_RLS_POLICIES.sql
```

### Create indexes
```bash
psql < 03_INDEXES.sql
```

### Setup storage
```bash
psql < 04_STORAGE_BUCKET.sql
```

### Verify setup
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'collab_%';

-- Check policies
SELECT tablename, COUNT(*) FROM pg_policies 
WHERE tablename LIKE 'collab_%' GROUP BY tablename;

-- Check indexes
SELECT tablename, COUNT(*) FROM pg_indexes 
WHERE tablename LIKE 'collab_%' GROUP BY tablename;
```

---

## 📊 Common Queries

### Get collab with all relations
```sql
SELECT 
  cp.*,
  up.legal_first_name || ' ' || up.legal_surname AS author_name,
  up.profile_photo_url AS author_avatar,
  array_agg(DISTINCT ct.tag_name) AS tags,
  COUNT(DISTINCT ci.id) AS interest_count
FROM collab_posts cp
LEFT JOIN user_profiles up ON cp.user_id = up.user_id
LEFT JOIN collab_tags ct ON cp.id = ct.collab_id
LEFT JOIN collab_interests ci ON cp.id = ci.collab_id
WHERE cp.id = 'collab-uuid'
GROUP BY cp.id, up.legal_first_name, up.legal_surname, up.profile_photo_url;
```

### Get interested user avatars
```sql
SELECT up.profile_photo_url
FROM collab_interests ci
JOIN user_profiles up ON ci.user_id = up.user_id
WHERE ci.collab_id = 'collab-uuid'
ORDER BY ci.created_at DESC
LIMIT 3;
```

### Get user's collab with stats
```sql
SELECT 
  cp.*,
  COUNT(DISTINCT ci.id) AS interests,
  COUNT(DISTINCT cc.id) AS collaborators
FROM collab_posts cp
LEFT JOIN collab_interests ci ON cp.id = ci.collab_id
LEFT JOIN collab_collaborators cc ON cp.id = cc.collab_id
WHERE cp.user_id = 'user-uuid'
GROUP BY cp.id
ORDER BY cp.created_at DESC;
```

### Search collabs by tag
```sql
SELECT DISTINCT cp.*
FROM collab_posts cp
JOIN collab_tags ct ON cp.id = ct.collab_id
WHERE ct.tag_name ILIKE '%screenplay%'
AND cp.status = 'open'
ORDER BY cp.created_at DESC;
```

---

## 🛠️ Storage Configuration

### Bucket Details
```
Name: collab-covers
Public: Yes
Max Size: 5 MB
Allowed: image/jpeg, image/jpg, image/png
Path: {user_id}/{collab_id}/{filename}
```

### Generate Storage URL
```javascript
const url = `${SUPABASE_URL}/storage/v1/object/public/collab-covers/${path}`;
```

---

## ⚡ Performance Tips

1. **Use pagination** for list queries
   ```sql
   LIMIT 20 OFFSET 0
   ```

2. **Index usage** - Queries automatically use indexes for:
   - user_id lookups
   - status filtering
   - tag searches
   - created_at sorting

3. **Aggregate efficiently**
   ```sql
   -- Good: Single query with aggregation
   SELECT cp.*, COUNT(ci.id) AS interests
   FROM collab_posts cp
   LEFT JOIN collab_interests ci ON cp.id = ci.collab_id
   GROUP BY cp.id;
   
   -- Avoid: Separate query per collab
   ```

4. **Use full-text search** for tags
   ```sql
   WHERE to_tsvector('english', tag_name) @@ to_tsquery('screenplay & horror');
   ```

---

## 🚨 Common Errors & Solutions

### Error: RLS policy blocks query
```
Solution: Ensure user is authenticated and has proper permissions
```

### Error: Foreign key violation
```
Solution: Ensure referenced user exists in auth.users
```

### Error: Unique constraint violation
```
Solution: User already expressed interest or slug already exists
```

### Error: Storage upload fails
```
Solution: Check file size (<5MB) and type (JPEG/PNG)
```

---

## 📋 Checklists

### Initial Setup
- [ ] Run 01_CREATE_TABLES.sql
- [ ] Run 02_RLS_POLICIES.sql
- [ ] Run 03_INDEXES.sql
- [ ] Run 04_STORAGE_BUCKET.sql
- [ ] Verify all tables created
- [ ] Verify all policies applied
- [ ] Test storage bucket access

### API Implementation
- [ ] POST /api/collab (create)
- [ ] GET /api/collab (list)
- [ ] GET /api/collab/my (my posts)
- [ ] GET /api/collab/[id] (details)
- [ ] PATCH /api/collab/[id] (update)
- [ ] DELETE /api/collab/[id] (delete)
- [ ] POST /api/collab/[id]/interest
- [ ] DELETE /api/collab/[id]/interest
- [ ] GET /api/collab/[id]/interests
- [ ] GET /api/collab/[id]/collaborators
- [ ] POST /api/collab/[id]/collaborators
- [ ] DELETE /api/collab/[id]/collaborators/[userId]
- [ ] PATCH /api/collab/[id]/close
- [ ] POST /api/upload/collab-cover

### Testing
- [ ] Create collab post
- [ ] List collabs with pagination
- [ ] Filter by status and tags
- [ ] Express/remove interest
- [ ] Add/remove collaborators
- [ ] Update collab post
- [ ] Close collab
- [ ] Upload cover image
- [ ] Test RLS policies
- [ ] Test with unauthenticated user

---

## 📚 Additional Resources

- **Full Documentation:** See other files in `/backend-command/collab/`
- **Main Architecture:** `/backend-command/UPDATED_BACKEND_ARCHITECTURE.md`
- **API Reference:** `06_API_ENDPOINTS.md`
- **Implementation Guide:** `05_IMPLEMENTATION_PLAN.md`

---

**Quick Reference Version:** 1.0
**Last Updated:** January 2025
**Status:** ✅ Complete
