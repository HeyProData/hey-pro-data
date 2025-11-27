# Slate Group - API Implementation Guide

**Version:** 1.0  
**Last Updated:** January 2025

---

## 📡 API Endpoints Overview

Total: **19 endpoints**

### Posts Management (6)
1. `POST /api/slate` - Create post
2. `GET /api/slate` - List feed
3. `GET /api/slate/my` - User's posts
4. `GET /api/slate/[id]` - Post details
5. `PATCH /api/slate/[id]` - Update post
6. `DELETE /api/slate/[id]` - Delete post

### Engagement (9)
7. `POST /api/slate/[id]/like` - Like post
8. `DELETE /api/slate/[id]/like` - Unlike post
9. `GET /api/slate/[id]/likes` - Get likes
10. `POST /api/slate/[id]/comment` - Add comment
11. `GET /api/slate/[id]/comments` - Get comments
12. `PATCH /api/slate/comment/[commentId]` - Edit comment
13. `DELETE /api/slate/comment/[commentId]` - Delete comment
14. `POST /api/slate/[id]/share` - Share post
15. `DELETE /api/slate/[id]/share` - Remove share

### Saved Posts (3)
16. `POST /api/slate/[id]/save` - Save post
17. `DELETE /api/slate/[id]/save` - Unsave post
18. `GET /api/slate/saved` - Get saved posts

### Media Upload (1)
19. `POST /api/upload/slate-media` - Upload media

---

## 📂 File Structure

```
/app/api/
├── slate/
│   ├── route.ts                    # POST (create), GET (feed)
│   ├── my/route.ts                 # GET (user's posts)
│   ├── saved/route.ts              # GET (saved posts)
│   ├── [id]/
│   │   ├── route.ts                # GET (details), PATCH (update), DELETE
│   │   ├── like/route.ts           # POST (like), DELETE (unlike)
│   │   ├── likes/route.ts          # GET (who liked)
│   │   ├── comment/route.ts        # POST (comment), GET (comments)
│   │   ├── share/route.ts          # POST (share), DELETE (unshare)
│   │   └── save/route.ts           # POST (save), DELETE (unsave)
│   └── comment/
│       └── [commentId]/
│           └── route.ts            # PATCH (edit), DELETE (delete)
└── upload/
    └── slate-media/
        └── route.ts                # POST (upload media)
```

---

## 📝 Detailed Endpoint Specifications

### 1. POST /api/slate (Create Post)

**Request:**
```typescript
interface CreatePostRequest {
  content: string;          // Required, 1-5000 chars
  status?: 'published' | 'draft';  // Default: published
  media_urls?: string[];    // Optional array of media URLs
}
```

**Response:**
```typescript
interface CreatePostResponse {
  success: true;
  message: "Post created successfully";
  data: {
    id: string;
    content: string;
    slug?: string;
    status: string;
    likes_count: 0;
    comments_count: 0;
    shares_count: 0;
    created_at: string;
  }
}
```

**Implementation:**
```typescript
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { content, status = 'published', media_urls } = await request.json();
  
  // Validate
  if (!content || content.length < 1 || content.length > 5000) {
    return NextResponse.json({ error: 'Invalid content length' }, { status: 400 });
  }
  
  // Create post
  const { data: post, error } = await supabase
    .from('slate_posts')
    .insert({
      user_id: user.id,
      content,
      status,
      slug: generateSlug(content) // Optional utility function
    })
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Add media if provided
  if (media_urls && media_urls.length > 0) {
    const mediaInserts = media_urls.map((url, index) => ({
      post_id: post.id,
      media_url: url,
      media_type: url.includes('.mp4') || url.includes('.mov') ? 'video' : 'image',
      sort_order: index
    }));
    
    await supabase.from('slate_media').insert(mediaInserts);
  }
  
  return NextResponse.json({ success: true, data: post });
}
```

---

### 2. GET /api/slate (Feed)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)
- `sort` (string): 'latest' | 'popular' (default: 'latest')
- `search` (string): Search in content (optional)

**Response:**
```typescript
interface FeedResponse {
  success: true;
  data: {
    posts: PostWithAuthor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    }
  }
}

interface PostWithAuthor {
  id: string;
  content: string;
  status: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    totalRoles: number;
  };
  media: MediaItem[];
  user_has_liked: boolean;
  user_has_saved: boolean;
}
```

**Implementation:**
```typescript
export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const sort = searchParams.get('sort') || 'latest';
  const search = searchParams.get('search');
  
  // Get current user (optional for feed)
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('slate_posts')
    .select(`
      *,
      author:user_id (
        id,
        legal_first_name,
        legal_surname,
        profile_photo_url
      ),
      media:slate_media(*)
    `, { count: 'exact' })
    .eq('status', 'published');
  
  // Search
  if (search) {
    query = query.textSearch('content', search);
  }
  
  // Sort
  if (sort === 'popular') {
    query = query.order('likes_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  // Pagination
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);
  
  const { data: posts, error, count } = await query;
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // If user logged in, check likes and saves
  let userLikes = [];
  let userSaves = [];
  if (user) {
    const postIds = posts.map(p => p.id);
    const { data: likes } = await supabase
      .from('slate_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);
    userLikes = likes?.map(l => l.post_id) || [];
    
    const { data: saves } = await supabase
      .from('slate_saved')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);
    userSaves = saves?.map(s => s.post_id) || [];
  }
  
  // Format response
  const formattedPosts = posts.map(post => ({
    ...post,
    user_has_liked: userLikes.includes(post.id),
    user_has_saved: userSaves.includes(post.id)
  }));
  
  return NextResponse.json({
    success: true,
    data: {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > from + limit
      }
    }
  });
}
```

---

### 7. POST /api/slate/[id]/like (Like Post)

**Request:** Empty body

**Response:**
```typescript
{
  success: true;
  message: "Post liked";
  data: {
    likes_count: number;
  }
}
```

**Implementation:**
```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Insert like (RLS will prevent duplicates via UNIQUE constraint)
  const { error } = await supabase
    .from('slate_likes')
    .insert({
      post_id: params.id,
      user_id: user.id
    });
  
  if (error) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Get updated count
  const { data: post } = await supabase
    .from('slate_posts')
    .select('likes_count')
    .eq('id', params.id)
    .single();
  
  return NextResponse.json({
    success: true,
    message: 'Post liked',
    data: { likes_count: post?.likes_count || 0 }
  });
}
```

---

### 10. POST /api/slate/[id]/comment (Add Comment)

**Request:**
```typescript
interface AddCommentRequest {
  content: string;                  // Required, 1-2000 chars
  parent_comment_id?: string;       // Optional, for nested replies
}
```

**Response:**
```typescript
{
  success: true;
  message: "Comment added";
  data: {
    id: string;
    content: string;
    parent_comment_id?: string;
    created_at: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    }
  }
}
```

**Implementation:**
```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { content, parent_comment_id } = await request.json();
  
  // Validate
  if (!content || content.length < 1 || content.length > 2000) {
    return NextResponse.json({ error: 'Invalid content length' }, { status: 400 });
  }
  
  // Insert comment
  const { data: comment, error } = await supabase
    .from('slate_comments')
    .insert({
      post_id: params.id,
      user_id: user.id,
      content,
      parent_comment_id: parent_comment_id || null
    })
    .select(`
      *,
      author:user_id (
        id,
        legal_first_name,
        legal_surname,
        profile_photo_url
      )
    `)
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({
    success: true,
    message: 'Comment added',
    data: comment
  });
}
```

---

## 🔒 Authentication Middleware

Create a shared utility for auth checks:

```typescript
// lib/auth.ts
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { 
      user: null, 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }
  
  return { user, error: null };
}

// Usage in route:
const { user, error } = await requireAuth(supabase);
if (error) return error;
// user is now available
```

---

## 📦 Media Upload Implementation

### POST /api/upload/slate-media

```typescript
export async function POST(request: Request) {
  const supabase = createClient();
  const { user, error: authError } = await requireAuth(supabase);
  if (authError) return authError;
  
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  
  // Validate file
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }
  
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo'
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/temp/${fileName}`; // Use 'temp' for pending posts
  
  // Upload to Supabase Storage
  const { data, error: uploadError } = await supabase.storage
    .from('slate-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('slate-media')
    .getPublicUrl(filePath);
  
  return NextResponse.json({
    success: true,
    data: {
      url: publicUrl,
      type: file.type.startsWith('image') ? 'image' : 'video',
      path: filePath
    }
  });
}
```

---

## 🧰 Testing

### Test Authenticated Endpoints

```bash
# Get auth token
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Use token in requests
curl -X POST https://your-app.com/api/slate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test post","status":"published"}'
```

---

## 🚨 Error Handling

Standardize error responses:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

// Utility function
function errorResponse(message: string, status: number, details?: string) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}
```

---

## 📊 Performance Tips

1. **Use select() wisely**: Only fetch needed columns
2. **Batch queries**: Fetch likes/saves in one query
3. **Cache counts**: Use cached counts from slate_posts
4. **Pagination**: Always use limit and offset
5. **Indexes**: Ensure all indexes from 03_INDEXES.sql are created

---

## ✅ Implementation Checklist

- [ ] Create /api/slate route structure
- [ ] Implement POST /api/slate (create)
- [ ] Implement GET /api/slate (feed)
- [ ] Implement GET /api/slate/my
- [ ] Implement GET /api/slate/[id]
- [ ] Implement PATCH /api/slate/[id]
- [ ] Implement DELETE /api/slate/[id]
- [ ] Implement like endpoints
- [ ] Implement comment endpoints
- [ ] Implement share endpoints
- [ ] Implement save endpoints
- [ ] Implement media upload
- [ ] Add error handling
- [ ] Add validation
- [ ] Test all endpoints
- [ ] Test RLS policies

---

**Next:** Update frontend to consume these APIs
