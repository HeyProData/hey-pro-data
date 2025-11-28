# Slate Group - Social Media Posts Feature

**Feature:** Social media-style posts platform ("Slate")  
**Version:** 1.0  
**Status:** ⏳ Ready for Implementation  
**Last Updated:** January 2025

---

## 📚 Quick Links

| Document | Purpose |
|----------|----------|
| **00_FRONTEND_ANALYSIS.md** | Detailed frontend analysis & gap identification |
| **01_CREATE_TABLES.sql** | Create 6 database tables + triggers |
| **02_RLS_POLICIES.sql** | Apply 28 Row Level Security policies |
| **03_INDEXES.sql** | Create 20+ performance indexes |
| **04_STORAGE_BUCKET.sql** | Setup slate-media storage bucket |
| **This README** | Overview & quick start guide |

---

## 🎯 Overview

The **Slate** feature is a social media-style posts platform where users can:

- ✍️ Create posts with text and media (images/videos)
- ❤️ Like posts
- 💬 Comment on posts (with nested replies)
- 📤 Share posts
- 🔖 Save/bookmark posts
- 👁️ View personalized feed
- 🔍 Search posts

---

## 📦 What's Included

### Database Tables (6 tables)
1. **slate_posts** - Main posts table
2. **slate_media** - Images/videos attached to posts
3. **slate_likes** - Track likes
4. **slate_comments** - Comments with nested replies
5. **slate_shares** - Track shares
6. **slate_saved** - Saved/bookmarked posts

### Security (28 RLS policies)
- ✅ Public can view published posts
- ✅ Users can only edit/delete own content
- ✅ Authenticated actions required
- ✅ Draft posts are private

### Performance (20+ indexes)
- Fast feed queries (< 50ms)
- Quick like/comment operations (< 10ms)
- Full-text search support
- Optimized for social media patterns

### Storage (1 bucket)
- **slate-media/** - Public bucket for images/videos
- 10 MB max file size
- JPEG, PNG, WebP, MP4, MOV, AVI allowed

---

## 🚀 Quick Start

### Step 1: Execute SQL Scripts (In Order)

```bash
# 1. Create tables and triggers
psql -f backend-command/slate-group/01_CREATE_TABLES.sql

# 2. Apply RLS policies
psql -f backend-command/slate-group/02_RLS_POLICIES.sql

# 3. Create indexes
psql -f backend-command/slate-group/03_INDEXES.sql

# 4. Setup storage bucket
psql -f backend-command/slate-group/04_STORAGE_BUCKET.sql
```

**OR via Supabase Dashboard:**

1. Go to: SQL Editor
2. Copy and paste each file's content
3. Run in order (01 → 02 → 03 → 04)

### Step 2: Verify Setup

```sql
-- Check tables were created (should show 6 tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'slate_%'
ORDER BY table_name;

-- Check RLS is enabled (should show 6 rows with rowsecurity = true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'slate_%'
ORDER BY tablename;

-- Check policies count (should show 28 total)
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'slate_%';

-- Check storage bucket exists
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'slate-media';
```

### Step 3: Implement API Endpoints

Create these 19 endpoints in `/app/api/slate/`:

**Posts Management:**
- `POST /api/slate` - Create post
- `GET /api/slate` - List feed
- `GET /api/slate/my` - User's posts
- `GET /api/slate/[id]` - Post details
- `PATCH /api/slate/[id]` - Update post
- `DELETE /api/slate/[id]` - Delete post

**Engagement:**
- `POST /api/slate/[id]/like` - Like
- `DELETE /api/slate/[id]/like` - Unlike
- `GET /api/slate/[id]/likes` - Get likes
- `POST /api/slate/[id]/comment` - Comment
- `GET /api/slate/[id]/comments` - Get comments
- `PATCH /api/slate/comment/[commentId]` - Edit comment
- `DELETE /api/slate/comment/[commentId]` - Delete comment
- `POST /api/slate/[id]/share` - Share
- `DELETE /api/slate/[id]/share` - Remove share

**Saved Posts:**
- `POST /api/slate/[id]/save` - Save
- `DELETE /api/slate/[id]/save` - Unsave
- `GET /api/slate/saved` - Get saved

**Media Upload:**
- `POST /api/upload/slate-media` - Upload media

### Step 4: Update Frontend

Replace hardcoded data in:
- `/app/(app)/(slate-group)/slate/page.tsx`
- `/app/(app)/(slate-group)/template.tsx`

---

## 📊 Database Schema

```
auth.users (Supabase Auth)
    │
    ├──[1:N]──> slate_posts
    │               ├──[1:N]──> slate_media
    │               ├──[1:N]──> slate_likes
    │               ├──[1:N]──> slate_comments (with nesting)
    │               └──[1:N]──> slate_shares
    │
    ├──[1:N]──> slate_likes (user's likes)
    ├──[1:N]──> slate_comments (user's comments)
    ├──[1:N]──> slate_shares (user's shares)
    └──[1:N]──> slate_saved (user's saved)
```

---

## 📝 Sample API Responses

### GET /api/slate (Feed)

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "content": "Lorem ipsum dolor sit amet...",
        "author": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "https://...",
          "role": "Cinematographer",
          "totalRoles": 15
        },
        "media": [
          {
            "id": "uuid",
            "url": "https://.../slate-media/...",
            "type": "image"
          }
        ],
        "likes_count": 10000,
        "comments_count": 1000,
        "shares_count": 50,
        "user_has_liked": false,
        "user_has_saved": false,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasMore": true
    }
  }
}
```

### POST /api/slate (Create Post)

```json
// Request
{
  "content": "My first slate post!",
  "media_urls": [
    "https://.../slate-media/{user_id}/{post_id}/image1.jpg"
  ],
  "status": "published"
}

// Response
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "uuid",
    "content": "My first slate post!",
    "slug": "my-first-slate-post-abc123",
    "status": "published",
    "likes_count": 0,
    "comments_count": 0,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

## ✅ Implementation Checklist

### Phase 1: Database Setup
- [ ] Execute 01_CREATE_TABLES.sql
- [ ] Execute 02_RLS_POLICIES.sql
- [ ] Execute 03_INDEXES.sql
- [ ] Execute 04_STORAGE_BUCKET.sql
- [ ] Verify all tables created
- [ ] Verify RLS enabled
- [ ] Verify indexes created
- [ ] Verify storage bucket configured

### Phase 2: API Implementation
- [ ] POST /api/slate (create)
- [ ] GET /api/slate (feed)
- [ ] GET /api/slate/my (user posts)
- [ ] GET /api/slate/[id] (details)
- [ ] PATCH /api/slate/[id] (update)
- [ ] DELETE /api/slate/[id] (delete)
- [ ] Like endpoints
- [ ] Comment endpoints
- [ ] Share endpoints
- [ ] Save endpoints
- [ ] Media upload endpoint

### Phase 3: Frontend Integration
- [ ] Replace hardcoded data in page.tsx
- [ ] Implement create post modal
- [ ] Implement like/comment/share buttons
- [ ] Implement infinite scroll
- [ ] Add loading states
- [ ] Add error handling

### Phase 4: Testing
- [ ] Test RLS policies
- [ ] Test all CRUD operations
- [ ] Test engagement features
- [ ] Test file uploads
- [ ] Performance testing
- [ ] Security testing

---

## 🔍 Troubleshooting

### Tables Not Created
```sql
-- Check for errors
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction';

-- Rollback and retry
ROLLBACK;
-- Then re-run 01_CREATE_TABLES.sql
```

### RLS Blocking Queries
```sql
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE slate_posts DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE slate_posts ENABLE ROW LEVEL SECURITY;
```

### Slow Queries
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE 
SELECT * FROM slate_posts 
WHERE status = 'published' 
ORDER BY created_at DESC 
LIMIT 20;

-- Update statistics
ANALYZE slate_posts;
```

---

## 📊 Performance Expectations

| Operation | Expected Time |
|-----------|---------------|
| Feed query (20 posts) | < 50ms |
| Post details | < 20ms |
| Like/Unlike | < 10ms |
| Comment add | < 30ms |
| Search | < 100ms |
| Media upload | < 500ms (depends on file size) |

---

## 📚 Additional Resources

- **Frontend Analysis:** `00_FRONTEND_ANALYSIS.md`
- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **Supabase RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL Indexes:** https://www.postgresql.org/docs/current/indexes.html

---

## 📝 Notes

- All tables use UUID for primary keys
- Timestamps are in UTC (TIMESTAMPTZ)
- Cached counts updated automatically via triggers
- Nested comments supported (unlimited depth)
- Full-text search enabled on post content
- Storage bucket is public (read), authenticated (write)

---

## ❓ FAQ

**Q: Can I change the storage bucket path structure?**  
A: Yes, but update the RLS policies in `04_STORAGE_BUCKET.sql` to match.

**Q: How do I handle video processing?**  
A: Upload raw video to storage, then use a background job to transcode if needed.

**Q: Can I add more media types?**  
A: Yes, update `allowed_mime_types` in the bucket configuration.

**Q: How to implement notifications?**  
A: Create triggers on slate_likes and slate_comments to insert into notifications table.

**Q: Performance with 1M+ posts?**  
A: Indexes should handle it. Consider partitioning slate_posts by created_at if needed.

---

**Need Help?** Check the detailed analysis in `00_FRONTEND_ANALYSIS.md` or review the SQL comments in each file.
