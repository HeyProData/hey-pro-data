# Collab Feature - Backend Analysis

## Overview
This document analyzes the frontend collab feature and identifies backend requirements.

## Frontend Location
**Path:** `/app/(app)/(collab)/`

**Pages:**
- `/collab` - Main collab feed and create new collab
- `/collab/manage-collab` - List of user's collab posts
- `/collab/manage-collab/[id]` - Edit specific collab post

## Current Data Structure (Hardcoded)

### CollabPost Type
```typescript
type CollabPost = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  status: "waitlisted" | "interested";
  interests: number;
  interestAvatars: string[];
  postedOn: string;
  author: string;
  avatar: string;
  cover: string;
};
```

### Collaborators Type
```typescript
type Collaborator = {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar: string;
};
```

## Frontend Features

### 1. Create Collab Post
- Upload cover image (16:9 recommended, PNG/JPG up to 5MB)
- Enter title
- Enter summary/idea description
- Add multiple tags
- Submit to create post

### 2. Browse Collab Feed
- View all collab posts
- See post details: cover, title, summary, tags
- See interest count and avatars of interested users
- Author information (name, avatar, posted date)
- Action buttons:
  - Heart (like/favorite)
  - Share
  - Message
  - Status button ("I'm interested" or "Waitlisted")

### 3. Manage Own Collabs
- View all collab posts created by logged-in user
- Click to edit individual posts
- View applicants/interested users

### 4. Edit Collab Post
- Update cover image
- Edit title
- Edit summary
- Add/remove tags
- View status (posted date, author)
- View list of collaborators
- Collaborator management:
  - Chat with collaborators
  - Add to group
- Close collab functionality

## Backend Requirements

### Database Tables Needed

#### 1. `collab_posts`
Main table for collab posts.

**Fields:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users) - Post creator
- `title` (TEXT, NOT NULL)
- `slug` (TEXT, NOT NULL, UNIQUE)
- `summary` (TEXT, NOT NULL)
- `cover_image_url` (TEXT) - Supabase Storage URL
- `status` (TEXT) - "open", "closed", "draft"
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. `collab_tags`
Tags associated with collab posts (many-to-many).

**Fields:**
- `id` (UUID, PK)
- `collab_id` (UUID, FK → collab_posts)
- `tag_name` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(collab_id, tag_name)

#### 3. `collab_interests`
Users who expressed interest in collabs.

**Fields:**
- `id` (UUID, PK)
- `collab_id` (UUID, FK → collab_posts)
- `user_id` (UUID, FK → auth.users)
- `created_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(collab_id, user_id) - One interest per user per collab

#### 4. `collab_collaborators`
Approved collaborators for a collab project.

**Fields:**
- `id` (UUID, PK)
- `collab_id` (UUID, FK → collab_posts)
- `user_id` (UUID, FK → auth.users)
- `role` (TEXT) - Collaborator role in project
- `department` (TEXT) - Department/specialty
- `added_at` (TIMESTAMP)
- `added_by` (UUID, FK → auth.users) - Who added them

**Constraints:**
- UNIQUE(collab_id, user_id)

### Storage Bucket

#### `collab-covers/` (Public)
- **Purpose:** Cover images for collab posts
- **Max Size:** 5 MB
- **Allowed Types:** PNG, JPG, JPEG
- **Path Structure:** `{user_id}/{collab_id}/{filename}`
- **Access:** Public read, Owner write

### API Endpoints Needed

#### Collab Posts Management
1. `POST /api/collab` - Create new collab post
2. `GET /api/collab` - Get all collab posts (public feed)
3. `GET /api/collab/my` - Get my collab posts
4. `GET /api/collab/[id]` - Get specific collab details
5. `PATCH /api/collab/[id]` - Update collab post
6. `DELETE /api/collab/[id]` - Delete collab post

#### Interest Management
7. `POST /api/collab/[id]/interest` - Express interest
8. `DELETE /api/collab/[id]/interest` - Remove interest
9. `GET /api/collab/[id]/interests` - Get all interested users

#### Collaborator Management
10. `GET /api/collab/[id]/collaborators` - Get collaborators
11. `POST /api/collab/[id]/collaborators` - Add collaborator
12. `DELETE /api/collab/[id]/collaborators/[userId]` - Remove collaborator

#### Status Management
13. `PATCH /api/collab/[id]/close` - Close collab

#### File Upload
14. `POST /api/upload/collab-cover` - Upload cover image

### Row Level Security (RLS) Policies

#### collab_posts
- **SELECT:** Public can view all open collabs
- **INSERT:** Authenticated users can create collabs
- **UPDATE:** Only post owner can update
- **DELETE:** Only post owner can delete

#### collab_tags
- **SELECT:** Public can view tags
- **INSERT:** Only collab post owner can add tags
- **DELETE:** Only collab post owner can delete tags

#### collab_interests
- **SELECT:** 
  - Collab owner can see all interests
  - Users can see their own interests
- **INSERT:** Authenticated users can express interest (not on own posts)
- **DELETE:** Users can remove their own interest

#### collab_collaborators
- **SELECT:** Public can view collaborators
- **INSERT:** Only collab owner can add collaborators
- **DELETE:** Only collab owner can remove collaborators

### Indexes for Performance

1. `collab_posts`:
   - `idx_collab_posts_user_id` ON `user_id`
   - `idx_collab_posts_status` ON `status`
   - `idx_collab_posts_created_at` ON `created_at DESC`
   - `idx_collab_posts_slug` ON `slug`

2. `collab_tags`:
   - `idx_collab_tags_collab_id` ON `collab_id`
   - `idx_collab_tags_tag_name` ON `tag_name`

3. `collab_interests`:
   - `idx_collab_interests_collab_id` ON `collab_id`
   - `idx_collab_interests_user_id` ON `user_id`

4. `collab_collaborators`:
   - `idx_collab_collaborators_collab_id` ON `collab_id`
   - `idx_collab_collaborators_user_id` ON `user_id`

## Implementation Priority

### Phase 1: Core Tables & Basic CRUD
1. Create database tables
2. Apply RLS policies
3. Create indexes
4. Create storage bucket
5. Implement POST /api/collab (create)
6. Implement GET /api/collab (list)
7. Implement GET /api/collab/my (my posts)
8. Implement GET /api/collab/[id] (details)
9. Implement PATCH /api/collab/[id] (update)
10. Implement DELETE /api/collab/[id] (delete)

### Phase 2: Interest System
11. Implement POST /api/collab/[id]/interest
12. Implement DELETE /api/collab/[id]/interest
13. Implement GET /api/collab/[id]/interests

### Phase 3: Collaborator Management
14. Implement GET /api/collab/[id]/collaborators
15. Implement POST /api/collab/[id]/collaborators
16. Implement DELETE /api/collab/[id]/collaborators/[userId]

### Phase 4: Additional Features
17. Implement PATCH /api/collab/[id]/close
18. Implement POST /api/upload/collab-cover
19. Search and filter functionality
20. Notifications for interests and collaborator additions

## Data Flow Examples

### Creating a Collab Post
```
1. User uploads cover image → POST /api/upload/collab-cover
2. Backend stores in collab-covers/ → Returns URL
3. User submits form → POST /api/collab
4. Backend validates (auth, required fields)
5. Generate slug from title
6. Insert into collab_posts
7. Insert tags into collab_tags
8. Return complete collab object
```

### Expressing Interest
```
1. User clicks "I'm interested" → POST /api/collab/[id]/interest
2. Backend validates (auth, not own post, not duplicate)
3. Insert into collab_interests
4. Create notification for collab owner
5. Return updated interest count
```

### Viewing Collab Details
```
1. Request GET /api/collab/[id]
2. Query collab_posts (with user_profiles join for author)
3. Query collab_tags (array of tags)
4. Query collab_interests (count + avatars of first 3)
5. Query collab_collaborators (if owner)
6. Combine and return complete object
```

## Integration with Existing Schema

The collab feature integrates with:
- `auth.users` - For user authentication and profiles
- `user_profiles` - For user names, avatars
- `notifications` - For interest and collaborator notifications (optional)

## Next Steps

Refer to the following implementation files:
1. **01_CREATE_TABLES.sql** - SQL commands to create tables
2. **02_RLS_POLICIES.sql** - Row Level Security policies
3. **03_INDEXES.sql** - Performance indexes
4. **04_STORAGE_BUCKET.sql** - Storage bucket configuration
5. **05_IMPLEMENTATION_PLAN.md** - Step-by-step execution guide
6. **06_API_ENDPOINTS.md** - API endpoint specifications

---

**Analysis Complete**
**Date:** January 2025
**Status:** ✅ Ready for Implementation
