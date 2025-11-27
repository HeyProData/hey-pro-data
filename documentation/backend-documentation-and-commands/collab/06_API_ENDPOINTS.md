# Collab Feature - API Endpoints Documentation

## Base URL
```
https://your-domain.com/api
```

## Authentication
All authenticated endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints Overview

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/collab` | Yes | Create new collab post |
| GET | `/collab` | No | List all collab posts |
| GET | `/collab/my` | Yes | Get my collab posts |
| GET | `/collab/[id]` | No | Get collab details |
| PATCH | `/collab/[id]` | Yes (Owner) | Update collab post |
| DELETE | `/collab/[id]` | Yes (Owner) | Delete collab post |
| POST | `/collab/[id]/interest` | Yes | Express interest |
| DELETE | `/collab/[id]/interest` | Yes | Remove interest |
| GET | `/collab/[id]/interests` | Yes (Owner) | List interested users |
| GET | `/collab/[id]/collaborators` | No | List collaborators |
| POST | `/collab/[id]/collaborators` | Yes (Owner) | Add collaborator |
| DELETE | `/collab/[id]/collaborators/[userId]` | Yes (Owner) | Remove collaborator |
| PATCH | `/collab/[id]/close` | Yes (Owner) | Close collab |
| POST | `/upload/collab-cover` | Yes | Upload cover image |

---

## Detailed Endpoint Specifications

### 1. Create Collab Post

**Endpoint:** `POST /api/collab`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Midnight Circus | Horror Launch",
  "summary": "Enter a chilling world of suspense and terror...",
  "tags": ["film writing", "screenplay", "creativity", "collaboration"],
  "cover_image_url": "https://project.supabase.co/storage/v1/object/public/collab-covers/...",
  "status": "open"  // optional: "open" | "closed" | "draft", defaults to "open"
}
```

**Validation:**
- `title` (required, min 3 chars, max 200 chars)
- `summary` (required, min 10 chars, max 5000 chars)
- `tags` (optional, array, max 10 tags)
- `cover_image_url` (optional, valid URL)
- `status` (optional, enum: open/closed/draft)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Collab post created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Midnight Circus | Horror Launch",
    "slug": "midnight-circus-horror-launch",
    "summary": "Enter a chilling world of suspense and terror...",
    "cover_image_url": "https://...",
    "status": "open",
    "tags": ["film writing", "screenplay", "creativity", "collaboration"],
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid request data
- `401` - Unauthorized (no auth token)
- `422` - Validation failed
- `500` - Internal server error

---

### 2. List All Collab Posts

**Endpoint:** `GET /api/collab`

**Authentication:** Not required (public)

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `status` (string, options: "open", "closed", "all", default: "all")
- `tag` (string, filter by tag name)
- `search` (string, search in title and summary)
- `sortBy` (string, options: "created_at", "interests", default: "created_at")
- `sortOrder` (string, options: "asc", "desc", default: "desc")

**Example Requests:**
```
GET /api/collab?page=1&limit=20
GET /api/collab?status=open&tag=screenplay
GET /api/collab?search=horror&sortBy=interests
```

**Success Response (200):**
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
        "interestAvatars": [
          "https://.../avatar1.jpg",
          "https://.../avatar2.jpg",
          "https://.../avatar3.jpg"
        ],
        "author": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Michael Molar",
          "avatar": "https://.../avatar.jpg"
        },
        "created_at": "2025-10-15T10:00:00.000Z",
        "updated_at": "2025-10-15T10:00:00.000Z"
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

---

### 3. Get My Collab Posts

**Endpoint:** `GET /api/collab/my`

**Authentication:** Required

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `status` (string, options: "open", "closed", "draft", "all", default: "all")

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "collabs": [
      // Same structure as list endpoint
    ],
    "pagination": {
      // Same structure as list endpoint
    }
  }
}
```

---

### 4. Get Collab Details

**Endpoint:** `GET /api/collab/[id]`

**Authentication:** Not required (public for open/closed posts)

**Path Parameters:**
- `id` (UUID, required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Midnight Circus | Horror Launch",
    "slug": "midnight-circus-horror-launch",
    "summary": "Enter a chilling world of suspense and terror...",
    "tags": ["film writing", "screenplay", "creativity"],
    "cover_image_url": "https://...",
    "status": "open",
    "interests": 18,
    "author": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Michael Molar",
      "avatar": "https://.../avatar.jpg",
      "bio": "Filmmaker and storyteller"
    },
    "collaborators": [
      // Only included if requester is the owner
      {
        "id": "user-uuid",
        "name": "Alice Johnson",
        "avatar": "https://.../avatar.jpg",
        "role": "Designer",
        "department": "Creative",
        "added_at": "2025-10-16T10:00:00.000Z"
      }
    ],
    "userHasInterest": true,  // Only if authenticated
    "isOwner": false,  // Only if authenticated
    "created_at": "2025-10-15T10:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Collab not found
- `500` - Internal server error

---

### 5. Update Collab Post

**Endpoint:** `PATCH /api/collab/[id]`

**Authentication:** Required (must be owner)

**Path Parameters:**
- `id` (UUID, required)

**Request Body:**
```json
{
  "title": "Updated Title",  // optional
  "summary": "Updated summary",  // optional
  "tags": ["new tag 1", "new tag 2"],  // optional, replaces all tags
  "cover_image_url": "https://...",  // optional
  "status": "closed"  // optional
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Collab post updated successfully",
  "data": {
    // Updated collab object
  }
}
```

**Error Responses:**
- `400` - Invalid request data
- `401` - Unauthorized
- `403` - Forbidden (not the owner)
- `404` - Collab not found
- `500` - Internal server error

---

### 6. Delete Collab Post

**Endpoint:** `DELETE /api/collab/[id]`

**Authentication:** Required (must be owner)

**Path Parameters:**
- `id` (UUID, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Collab post deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not the owner)
- `404` - Collab not found
- `500` - Internal server error

---

### 7. Express Interest

**Endpoint:** `POST /api/collab/[id]/interest`

**Authentication:** Required

**Path Parameters:**
- `id` (UUID, collab post ID)

**Request Body:** Empty (no body required)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Interest expressed successfully",
  "data": {
    "collab_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2025-01-15T10:00:00.000Z",
    "totalInterests": 19
  }
}
```

**Error Responses:**
- `400` - Cannot express interest in own collab
- `401` - Unauthorized
- `404` - Collab not found
- `409` - Already expressed interest
- `500` - Internal server error

---

### 8. Remove Interest

**Endpoint:** `DELETE /api/collab/[id]/interest`

**Authentication:** Required

**Path Parameters:**
- `id` (UUID, collab post ID)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Interest removed successfully",
  "data": {
    "totalInterests": 17
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Interest not found
- `500` - Internal server error

---

### 9. List Interested Users

**Endpoint:** `GET /api/collab/[id]/interests`

**Authentication:** Required (must be owner)

**Path Parameters:**
- `id` (UUID, collab post ID)

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "interests": [
      {
        "id": "interest-uuid",
        "user": {
          "id": "user-uuid",
          "name": "Alice Johnson",
          "avatar": "https://.../avatar.jpg",
          "bio": "Designer and creative director"
        },
        "created_at": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalInterests": 18,
      "limit": 50
    }
  }
}
```

---

### 10. List Collaborators

**Endpoint:** `GET /api/collab/[id]/collaborators`

**Authentication:** Not required (public)

**Path Parameters:**
- `id` (UUID, collab post ID)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "id": "collaborator-uuid",
        "user": {
          "id": "user-uuid",
          "name": "Alice Johnson",
          "avatar": "https://.../avatar.jpg"
        },
        "role": "Designer",
        "department": "Creative",
        "added_at": "2025-01-15T10:00:00.000Z",
        "added_by": {
          "id": "owner-uuid",
          "name": "Michael Molar"
        }
      }
    ]
  }
}
```

---

### 11. Add Collaborator

**Endpoint:** `POST /api/collab/[id]/collaborators`

**Authentication:** Required (must be owner)

**Path Parameters:**
- `id` (UUID, collab post ID)

**Request Body:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "role": "Designer",  // optional
  "department": "Creative"  // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Collaborator added successfully",
  "data": {
    "id": "collaborator-uuid",
    "collab_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "role": "Designer",
    "department": "Creative",
    "added_at": "2025-01-15T10:00:00.000Z",
    "added_by": "owner-uuid"
  }
}
```

**Error Responses:**
- `400` - Invalid user_id
- `401` - Unauthorized
- `403` - Forbidden (not the owner)
- `404` - Collab or user not found
- `409` - User already a collaborator
- `500` - Internal server error

---

### 12. Remove Collaborator

**Endpoint:** `DELETE /api/collab/[id]/collaborators/[userId]`

**Authentication:** Required (must be owner)

**Path Parameters:**
- `id` (UUID, collab post ID)
- `userId` (UUID, user to remove)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Collaborator removed successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not the owner)
- `404` - Collaborator not found
- `500` - Internal server error

---

### 13. Close Collab

**Endpoint:** `PATCH /api/collab/[id]/close`

**Authentication:** Required (must be owner)

**Path Parameters:**
- `id` (UUID, collab post ID)

**Request Body:** Empty (no body required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Collab closed successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "closed",
    "updated_at": "2025-01-15T11:00:00.000Z"
  }
}
```

---

### 14. Upload Cover Image

**Endpoint:** `POST /api/upload/collab-cover`

**Authentication:** Required

**Request:** multipart/form-data

**Form Data:**
- `file` (File, required) - Image file (PNG, JPG, JPEG)
- `collab_id` (UUID, optional) - Associate with specific collab

**Validation:**
- File size: Max 5 MB
- File types: image/jpeg, image/jpg, image/png
- Dimensions: Recommended 16:9 aspect ratio

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cover image uploaded successfully",
  "data": {
    "url": "https://project.supabase.co/storage/v1/object/public/collab-covers/user-uuid/collab-uuid/filename.jpg",
    "path": "user-uuid/collab-uuid/filename.jpg",
    "size": 1024567,
    "mimeType": "image/jpeg"
  }
}
```

**Error Responses:**
- `400` - No file provided or invalid file
- `401` - Unauthorized
- `413` - File too large (max 5MB)
- `415` - Unsupported file type
- `500` - Internal server error

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `DUPLICATE_ENTRY` - Resource already exists
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

**Public Endpoints:**
- 100 requests per 15 minutes per IP

**Authenticated Endpoints:**
- 1000 requests per 15 minutes per user

**Upload Endpoints:**
- 50 uploads per hour per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1610000000
```

---

## Webhooks (Future Enhancement)

**Events:**
- `collab.created` - New collab post created
- `collab.updated` - Collab post updated
- `collab.deleted` - Collab post deleted
- `collab.interest.added` - User expressed interest
- `collab.collaborator.added` - Collaborator added
- `collab.closed` - Collab closed

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create collab
const { data, error } = await supabase
  .from('collab_posts')
  .insert({
    title: 'My Collab',
    summary: 'Description',
    tags: ['tag1', 'tag2']
  });

// List collabs with filters
const { data, error } = await supabase
  .from('collab_posts')
  .select(`
    *,
    author:user_profiles(*),
    tags:collab_tags(*),
    interests:collab_interests(count)
  `)
  .eq('status', 'open')
  .order('created_at', { ascending: false })
  .range(0, 19);

// Express interest
const { data, error } = await supabase
  .from('collab_interests')
  .insert({
    collab_id: 'uuid',
    user_id: 'uuid'
  });
```

---

**API Version:** 1.0
**Last Updated:** January 2025
**Status:** ✅ Ready for Implementation
