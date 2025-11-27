# Slate Group - Frontend Analysis & Gap Analysis

**Feature:** Social Media-Style Posts Platform ("Slate")

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ⏳ Ready for Implementation

---

## 📍 Frontend Location

**Path:** `/app/app/(app)/(slate-group)/`

**Files:**
- `/slate/page.tsx` - Main slate feed page
- `/template.tsx` - Sidebar layout with profile and suggestions

---

## 🎨 Frontend UI Components Analysis

### 1. Main Slate Feed (`page.tsx`)

#### Slate Post Interface:
```typescript
interface Slate {
    id: string,
    profileAvtar: string,      // Author's avatar URL
    profileName: string,        // Author's name
    role: string,               // Primary role (e.g., "Cinematographer")
    totlerole: string,          // Total roles (e.g., "15 Roles")
    noLike: number,             // Number of likes
    noComment: number,          // Number of comments
    description: string,        // Post text content
    slateSrc?: string          // Optional image/media URL
}
```

#### Hardcoded Sample Data:
```typescript
[
    {
        id: "1",
        profileAvtar: "/Image (1).png",
        profileName: "Jone Dev",
        role: "Cinematographer",
        totlerole: "15 Roles",
        noLike: 10000,
        noComment: 1000,
        slateSrc: "/slate.png",
        description: "Lorem ipsum dolor sit amet..."
    },
    // ... 3 more posts
]
```

#### UI Features:
1. **Post Card Component** (`SlateCard`):
   - Author info (avatar, name, role)
   - Options menu (3-dot menu)
   - Media display (optional image)
   - Engagement buttons (Heart/Like, Comment, Share/Send)
   - Description with "Show More/Less" toggle (truncated at 200 chars)
   - Visual separator

2. **Engagement Interactions**:
   - ❤️ Like button (Heart icon)
   - 💬 Comment button (MessageCircle icon)
   - 📤 Share button (Send icon)

3. **Description Handling**:
   - Truncates at 150 characters
   - "Show More" expands full text
   - "Show Less" collapses text

---

### 2. Profile Sidebar (`template.tsx`)

#### Profile Interface:
```typescript
interface Profile {
    name: string,
    bio: string,
    backgroundImage: string,     // Banner image
    avatarImage: string,
    referencesavatar: string[],  // Array of referral avatars
    totalref: number,            // Total referrals count
    profileurl: string,
    urls: {
        id: string,
        name: string,
        icon: React.ReactNode,
        link: string
    }[]
}
```

#### Hardcoded Sample Data:
```typescript
{
    name: "John Doe",
    bio: "Lorem ipsum dolor sit amet...",
    backgroundImage: "/bg.jpg",
    avatarImage: "/image (1).png",
    referencesavatar: ["/image (1).png", "/image (2).png", "/image (3).png"],
    totalref: 3000,
    profileurl: "/profile/johndoe",
    urls: [
        { id: '1', name: "Profile", icon: <UserRound />, link: "/profile/johndoe" },
        { id: '2', name: "Saved", icon: <BookmarkIcon />, link: "/profile/johndoe/saved" },
        { id: '3', name: "Help", icon: <HelpCircle />, link: "/profile/johndoe/help" },
        { id: '4', name: "setting", icon: <SettingsIcon />, link: "/profile/johndoe/settings" }
    ]
}
```

#### UI Features:
1. **Profile Card**:
   - Banner image (72px height)
   - Circular avatar (-mt-12 overlap)
   - Name and bio
   - Referrals count with avatar thumbnails (overlapping circles)

2. **Quick Links**:
   - Profile view
   - Saved posts
   - Help center
   - Settings
   - "Send Invite" gradient button

---

### 3. Similar Accounts Sidebar (`template.tsx`)

#### SimilarAccount Interface:
```typescript
interface SimilarAccount {
    id: number,
    name: string,
    image: string,
    role: string,
    totlerole: string,
    proifleurl: string
}
```

#### Hardcoded Sample Data:
```typescript
[
    {
        id: 1,
        name: "John Doe",
        image: "/image (1).png",
        role: "Cinematographer",
        totlerole: "15 Roles",
        proifleurl: "/profile/johndoe"
    },
    // ... 5 more accounts
]
```

#### UI Features:
1. **"View Profiles" Section**:
   - List of 6 suggested accounts
   - Avatar + name + role info
   - Link to full profile
   - "View crew directory" link at bottom

---

## 🔍 Gap Analysis - What's Missing in Backend

### Current Backend State:
- ✅ User authentication (Supabase Auth)
- ✅ User profiles (`user_profiles`, `user_roles`, etc.)
- ✅ Storage buckets (profile-photos, portfolios, etc.)
- ❌ NO slate/social posts tables
- ❌ NO likes/comments/shares tracking
- ❌ NO saved posts feature
- ❌ NO media attachments for posts

---

## 📊 Required Database Tables

### 1. **slate_posts** (Main posts table)
**Purpose:** Store user-generated social posts

**Required Fields:**
- `id` (UUID, PK) - Unique post identifier
- `user_id` (UUID, FK → auth.users) - Post author
- `content` (TEXT, NOT NULL) - Post text/description
- `slug` (TEXT, UNIQUE) - URL-friendly identifier (optional)
- `status` (TEXT) - 'published' | 'draft' | 'archived'
- `likes_count` (INTEGER, DEFAULT 0) - Cached like count
- `comments_count` (INTEGER, DEFAULT 0) - Cached comment count
- `shares_count` (INTEGER, DEFAULT 0) - Cached share count
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_slate_posts_user_id` ON `user_id`
- `idx_slate_posts_status` ON `status`
- `idx_slate_posts_created_at` ON `created_at DESC`
- Full-text search on `content`

---

### 2. **slate_media** (Post attachments)
**Purpose:** Store images/videos attached to posts

**Required Fields:**
- `id` (UUID, PK)
- `post_id` (UUID, FK → slate_posts, ON DELETE CASCADE)
- `media_url` (TEXT, NOT NULL) - Supabase Storage URL
- `media_type` (TEXT) - 'image' | 'video'
- `sort_order` (INTEGER, DEFAULT 0) - Display order
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- CHECK(media_type IN ('image', 'video'))

**Indexes:**
- `idx_slate_media_post_id` ON `post_id`
- `idx_slate_media_post_sort` ON `(post_id, sort_order)`

---

### 3. **slate_likes** (Likes tracking)
**Purpose:** Track which users liked which posts

**Required Fields:**
- `id` (UUID, PK)
- `post_id` (UUID, FK → slate_posts, ON DELETE CASCADE)
- `user_id` (UUID, FK → auth.users, ON DELETE CASCADE)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(post_id, user_id) - One like per user per post

**Indexes:**
- `idx_slate_likes_post_id` ON `post_id`
- `idx_slate_likes_user_id` ON `user_id`

---

### 4. **slate_comments** (Comments system)
**Purpose:** Comments on posts with nested replies support

**Required Fields:**
- `id` (UUID, PK)
- `post_id` (UUID, FK → slate_posts, ON DELETE CASCADE)
- `user_id` (UUID, FK → auth.users)
- `parent_comment_id` (UUID, FK → slate_comments, NULL for top-level)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_slate_comments_post_id` ON `post_id`
- `idx_slate_comments_user_id` ON `user_id`
- `idx_slate_comments_parent_id` ON `parent_comment_id`
- `idx_slate_comments_post_created` ON `(post_id, created_at DESC)`

---

### 5. **slate_shares** (Shares tracking)
**Purpose:** Track post shares/reposts

**Required Fields:**
- `id` (UUID, PK)
- `post_id` (UUID, FK → slate_posts, ON DELETE CASCADE)
- `user_id` (UUID, FK → auth.users)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(post_id, user_id) - One share per user per post

**Indexes:**
- `idx_slate_shares_post_id` ON `post_id`
- `idx_slate_shares_user_id` ON `user_id`

---

### 6. **slate_saved** (Saved/Bookmarked posts)
**Purpose:** User's saved posts for later viewing

**Required Fields:**
- `id` (UUID, PK)
- `post_id` (UUID, FK → slate_posts, ON DELETE CASCADE)
- `user_id` (UUID, FK → auth.users, ON DELETE CASCADE)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(post_id, user_id) - One save per user per post

**Indexes:**
- `idx_slate_saved_user_id` ON `user_id`
- `idx_slate_saved_post_id` ON `post_id`
- `idx_slate_saved_user_created` ON `(user_id, created_at DESC)`

---

## 📦 Storage Buckets

### **slate-media/** (Public)
**Purpose:** Images and videos for slate posts

**Specifications:**
- **Max Size:** 10 MB per file
- **Allowed Types:** PNG, JPG, JPEG, WebP, MP4, MOV
- **Path Structure:** `{user_id}/{post_id}/{filename}`
- **Access Control:**
  - Public read (anyone can view published posts)
  - Authenticated write (own posts only)

---

## 🔐 Row Level Security (RLS) Policies Needed

### **slate_posts** - 7 Policies
1. ✅ Public can view published posts
2. ✅ Users can view own drafts
3. ✅ Authenticated users can create posts
4. ✅ Only owners can update their posts
5. ✅ Only owners can delete their posts
6. ✅ Users can view archived posts (optional)

### **slate_media** - 5 Policies
1. ✅ Public can view media for published posts
2. ✅ Users can view own post media
3. ✅ Only post owner can add media
4. ✅ Only post owner can delete media

### **slate_likes** - 4 Policies
1. ✅ Users can like posts
2. ✅ Users can unlike own likes
3. ✅ Users can view like counts (public)
4. ✅ Post owners can view who liked

### **slate_comments** - 6 Policies
1. ✅ Public can view comments on published posts
2. ✅ Authenticated users can comment
3. ✅ Only comment author can edit
4. ✅ Only comment author can delete
5. ✅ Users can view own comments

### **slate_shares** - 3 Policies
1. ✅ Users can share posts
2. ✅ Users can remove own shares
3. ✅ Public can view share counts

### **slate_saved** - 3 Policies
1. ✅ Users can save posts
2. ✅ Users can unsave posts
3. ✅ Users can only view own saved posts

**Total RLS Policies:** 28 policies

---

## 📡 Required API Endpoints

### **POST Management** (6 endpoints)
1. `POST /api/slate` - Create new post
2. `GET /api/slate` - List all published posts (feed)
3. `GET /api/slate/my` - Get user's own posts
4. `GET /api/slate/[id]` - Get specific post details
5. `PATCH /api/slate/[id]` - Update post
6. `DELETE /api/slate/[id]` - Delete post

### **Engagement** (9 endpoints)
7. `POST /api/slate/[id]/like` - Like a post
8. `DELETE /api/slate/[id]/like` - Unlike a post
9. `GET /api/slate/[id]/likes` - Get post likes
10. `POST /api/slate/[id]/comment` - Add comment
11. `GET /api/slate/[id]/comments` - Get post comments
12. `PATCH /api/slate/comment/[commentId]` - Edit comment
13. `DELETE /api/slate/comment/[commentId]` - Delete comment
14. `POST /api/slate/[id]/share` - Share post
15. `DELETE /api/slate/[id]/share` - Remove share

### **Saved Posts** (3 endpoints)
16. `POST /api/slate/[id]/save` - Save post
17. `DELETE /api/slate/[id]/save` - Unsave post
18. `GET /api/slate/saved` - Get user's saved posts

### **Media Upload** (1 endpoint)
19. `POST /api/upload/slate-media` - Upload post media

**Total API Endpoints:** 19 endpoints

---

## 🎯 Frontend Data Mapping

### Current Hardcoded → Backend Mapping:

| Frontend Field | Backend Source |
|---------------|----------------|
| `id` | `slate_posts.id` |
| `profileAvtar` | `user_profiles.profile_photo_url` (JOIN) |
| `profileName` | `user_profiles.legal_first_name + legal_surname` (JOIN) |
| `role` | `user_roles.role_name` (JOIN, first role) |
| `totlerole` | COUNT of `user_roles` (JOIN) |
| `noLike` | `slate_posts.likes_count` (cached) |
| `noComment` | `slate_posts.comments_count` (cached) |
| `description` | `slate_posts.content` |
| `slateSrc` | `slate_media.media_url` (JOIN, first image) |

---

## 🔄 Data Relationships

```
auth.users (Supabase Auth)
    │
    ├──[1:N]──> slate_posts (User's posts)
    │               │
    │               ├──[1:N]──> slate_media (Post attachments)
    │               ├──[1:N]──> slate_likes (Post likes)
    │               ├──[1:N]──> slate_comments (Post comments)
    │               └──[1:N]──> slate_shares (Post shares)
    │
    ├──[1:N]──> slate_likes (User's liked posts)
    ├──[1:N]──> slate_comments (User's comments)
    ├──[1:N]──> slate_shares (User's shared posts)
    └──[1:N]──> slate_saved (User's saved posts)
```

---

## 📝 Implementation Priority

### Phase 1: Core Post System (High Priority)
- ✅ `slate_posts` table
- ✅ `slate_media` table
- ✅ Storage bucket setup
- ✅ Basic CRUD APIs
- ✅ RLS policies

### Phase 2: Engagement Features (Medium Priority)
- ✅ `slate_likes` table
- ✅ `slate_comments` table
- ✅ Like/Comment APIs
- ✅ RLS policies

### Phase 3: Additional Features (Low Priority)
- ✅ `slate_shares` table
- ✅ `slate_saved` table
- ✅ Share/Save APIs
- ✅ RLS policies

---

## 🎨 UI Components Needed (Frontend Updates)

### Replace Hardcoded Data:
1. **Slate Feed**: 
   - Fetch from `GET /api/slate`
   - Implement infinite scroll/pagination
   - Real-time like/comment counts

2. **Engagement Buttons**:
   - Like: Toggle `POST/DELETE /api/slate/[id]/like`
   - Comment: Open modal → `POST /api/slate/[id]/comment`
   - Share: `POST /api/slate/[id]/share`

3. **Saved Posts**:
   - Bookmark button
   - View saved: `GET /api/slate/saved`

4. **Create Post**:
   - New post modal/page
   - Image upload
   - Text editor

---

## ✅ Summary

**Current State:**
- ✅ Frontend UI complete with hardcoded data
- ❌ NO backend database tables
- ❌ NO API endpoints
- ❌ NO storage bucket for slate media

**What Needs to Be Built:**
- 📊 **6 new database tables**
- 🔐 **28 RLS policies**
- 📡 **19 API endpoints**
- 📦 **1 storage bucket**
- 🔗 **Frontend integration** (replace hardcoded data)

**Estimated Effort:**
- Database setup: 2-3 hours
- API implementation: 8-12 hours
- Frontend integration: 4-6 hours
- Testing: 3-4 hours
- **Total: 17-25 hours**

---

**Next Steps:**
1. Review and approve this analysis
2. Execute SQL scripts (01_CREATE_TABLES.sql → 02_RLS_POLICIES.sql → 03_INDEXES.sql → 04_STORAGE_BUCKET.sql)
3. Implement API endpoints
4. Update frontend to consume APIs
5. Test end-to-end
