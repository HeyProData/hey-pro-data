# API Implementation Guide for Placeholder Routes

> **Purpose:** AI-friendly guide to implement all pending placeholder API routes  
> **Pattern:** Follow existing implemented routes as reference  
> **Tech Stack:** Next.js 15 App Router + TypeScript + Supabase

---

## 🎯 Implementation Pattern

All placeholder routes follow this consistent pattern:

```typescript
// 1. Import dependencies
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

// 2. Export async function for HTTP method
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // 3. Parse query parameters (if needed)
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');
    
    // 4. Query database
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('field', value);
    
    // 5. Handle errors
    if (error) {
      return NextResponse.json(
        errorResponse('Operation failed', error.message),
        { status: 500 }
      );
    }
    
    // 6. Return success response
    return NextResponse.json(
      successResponse(data, 'Success message'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
```

---

## 📋 Implementation Priority

### 🔴 Phase 1: High Priority (Core Functionality)

#### 1. Explore API - `/api/explore/route.ts`

**Current Status:** Placeholder returning empty array  
**Database Table:** `user_profiles`, `user_roles`  
**Complexity:** Medium

**Implementation Steps:**
```typescript
// Query user_profiles where visible_in_explore = true
// Apply filters: keyword, role, category, location, experienceLevel, rate range
// Join with user_roles for role filtering
// Implement pagination
// Order by sortBy and sortOrder
```

**Action:** See `action-files/explore-route-implementation.ts`

---

#### 2. Notifications API - `/api/notifications/route.ts`

**Current Status:** Placeholder returning empty array  
**Database Table:** `notifications`  
**Complexity:** Low

**Implementation Steps:**
```typescript
// Fetch notifications where user_id = current user
// Order by created_at DESC
// Include pagination
// Filter by unread_only if provided
```

**Action:** See `action-files/notifications-route-implementation.ts`

---

#### 3. Mark Notification Read - `/api/notifications/[id]/read/route.ts`

**Current Status:** Placeholder  
**Database Table:** `notifications`  
**Complexity:** Low

**Implementation Steps:**
```typescript
// Update notifications set is_read = true
// Where id = notificationId AND user_id = user.id
// Return updated notification
```

---

#### 4. Mark All Read - `/api/notifications/mark-all-read/route.ts`

**Current Status:** Placeholder  
**Database Table:** `notifications`  
**Complexity:** Low

**Implementation Steps:**
```typescript
// Update all notifications set is_read = true
// Where user_id = user.id
// Return count of updated notifications
```

---

#### 5. Explore User Profile - `/api/explore/[userId]/route.ts`

**Current Status:** Placeholder  
**Database Table:** `user_profiles`, `user_roles`, `user_skills`, etc.  
**Complexity:** Medium

**Implementation Steps:**
```typescript
// Fetch complete profile from user_profiles where id = userId
// Include related data: roles, skills, experience, highlights
// Format and return comprehensive profile
```

---

#### 6. Explore Categories - `/api/explore/categories/route.ts`

**Current Status:** Placeholder  
**Database Table:** `user_roles`  
**Complexity:** Low

**Implementation Steps:**
```typescript
// SELECT DISTINCT role_name FROM user_roles
// ORDER BY role_name ASC
// Return as simple array of strings
```

---

### 🟡 Phase 2: Medium Priority (User Profile Features)

#### 7. Skills API - `/api/skills/route.ts`

**Current Status:** Placeholder  
**Database Table:** `applicant_skills` or `user_skills`  
**Complexity:** Low

**GET Implementation:**
```typescript
// Fetch from applicant_skills where user_id = current user
// Order by sort_order
// Return array of skills
```

**POST Implementation:**
```typescript
// Insert into applicant_skills
// Fields: user_id, skill_name, proficiency_level, sort_order
// Handle UNIQUE constraint (user_id, skill_name)
// Return created skill
```

**Action:** See `action-files/skills-route-implementation.ts`

---

#### 8. Skills PATCH/DELETE - `/api/skills/[id]/route.ts`

**Current Status:** Placeholder  
**Database Table:** `applicant_skills` or `user_skills`  
**Complexity:** Low

**PATCH Implementation:**
```typescript
// Update applicant_skills
// Where id = skillId AND user_id = current user
// Allow updating: proficiency_level, sort_order
```

**DELETE Implementation:**
```typescript
// Delete from applicant_skills
// Where id = skillId AND user_id = current user
```

---

#### 9. Availability API - `/api/availability/route.ts`

**Current Status:** Placeholder  
**Database Table:** `crew_availability`  
**Complexity:** Low

**GET Implementation:**
```typescript
// Fetch from crew_availability where user_id = current user
// Optional filters: month, year
// Return array of availability records
```

**POST Implementation:**
```typescript
// Upsert into crew_availability
// Fields: user_id, availability_date, status
// Validate status: 'available' | 'hold' | 'na'
// Use .upsert() to handle duplicates
```

**Action:** See `action-files/availability-route-implementation.ts`

---

#### 10. Availability PATCH - `/api/availability/[id]/route.ts`

**Current Status:** Placeholder  
**Database Table:** `crew_availability`  
**Complexity:** Low

**Implementation:**
```typescript
// Update crew_availability
// Where id = availabilityId AND user_id = current user
// Allow updating status
```

---

#### 11. Availability Check - `/api/availability/check/route.ts`

**Current Status:** Placeholder  
**Database Table:** `crew_availability`  
**Complexity:** Low

**Implementation:**
```typescript
// Check crew_availability for date range
// Query params: from_date, to_date
// Return dates with status 'hold' or 'na' (conflicts)
```

---

### 🟢 Phase 3: Low Priority (Additional Features)

#### 12. Contacts POST - `/api/contacts/route.ts`

**Current Status:** Placeholder  
**Database Table:** `crew_contacts`  
**Complexity:** Low

**Implementation:**
```typescript
// Insert into crew_contacts
// Verify user is gig creator
// Fields: gig_id, contact_name, contact_email, contact_phone, role
```

---

#### 13. Contacts DELETE - `/api/contacts/[id]/route.ts`

**Current Status:** Placeholder  
**Database Table:** `crew_contacts`  
**Complexity:** Low

**Implementation:**
```typescript
// Delete from crew_contacts where id = contactId
// Verify user is gig creator
```

---

#### 14. Contacts by Gig - `/api/contacts/gig/[gigId]/route.ts`

**Current Status:** Placeholder  
**Database Table:** `crew_contacts`  
**Complexity:** Low

**Implementation:**
```typescript
// Fetch from crew_contacts where gig_id = gigId
// Verify user is gig creator
```

---

#### 15. Referrals GET - `/api/referrals/route.ts`

**Current Status:** Placeholder  
**Database Table:** `referrals`  
**Complexity:** Low

**Implementation:**
```typescript
// Fetch from referrals
// Where referred_user_id = user.id OR referrer_user_id = user.id
// Include user details for both referrer and referred
```

---

#### 16. Referrals POST - `/api/referrals/route.ts`

**Current Status:** Placeholder  
**Database Table:** `referrals`, `notifications`  
**Complexity:** Medium

**Implementation:**
```typescript
// Insert into referrals
// Create notification for referred user
// Fields: referrer_user_id, referred_user_id, context_type, context_id, message
```

---

### 📤 Phase 4: Upload Endpoints

All upload endpoints follow the same pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);
    
    if (!user) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    // 1. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(errorResponse('No file provided'), { status: 400 });
    }

    // 2. Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(errorResponse('Invalid file type'), { status: 415 });
    }

    // 3. Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(errorResponse('File too large'), { status: 413 });
    }

    const supabase = createServerClient();

    // 4. Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    // 5. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('bucket-name')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(errorResponse('Upload failed', uploadError.message), { status: 500 });
    }

    // 7. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('bucket-name')
      .getPublicUrl(filePath);

    return NextResponse.json(
      successResponse({
        url: publicUrlData.publicUrl,
        path: filePath,
        size: file.size,
        mimeType: file.type
      }, 'Upload successful'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(errorResponse('Internal server error', error.message), { status: 500 });
  }
}
```

#### Upload Endpoints to Implement:

17. **Profile Photo** - `/api/upload/profile-photo/route.ts`
   - Bucket: `profile-photos/`, Max: 2MB, Types: JPEG, PNG, WebP

18. **Portfolio** - `/api/upload/portfolio/route.ts`
   - Bucket: `portfolios/` (private), Max: 10MB, Types: PDF, Images, Videos

19. **Slate Media** - `/api/upload/slate-media/route.ts`
   - Bucket: `slate-media/`, Max: 10MB, Types: Images, Videos

20. **Resume** - `/api/upload/resume/route.ts`
   - Bucket: `resumes/` (private), Max: 5MB, Types: PDF, DOC, DOCX

21. **Project Asset** - `/api/upload/project-asset/route.ts`
   - Bucket: `project-assets/`, Max: 20MB, Types: All media/documents

**Action:** See `action-files/upload-template.ts`

---

## 🛠️ Implementation Checklist

For each placeholder route, follow this checklist:

- [ ] Copy the implementation pattern from above
- [ ] Identify the correct database table(s)
- [ ] Define query parameters and request body schema
- [ ] Implement database queries using Supabase client
- [ ] Add proper error handling
- [ ] Format response using `successResponse()` helper
- [ ] Test with sample data
- [ ] Update status in API_DOC.md from ⏳ to ✅

---

## 📚 Reference Files

**Use these as templates:**
- `/api/gigs/route.ts` - GET with filters and pagination
- `/api/slate/route.ts` - GET feed with auth check
- `/api/profile/route.ts` - GET/PATCH with auth
- `/api/collab/route.ts` - Complex queries with relations
- `/api/upload/collab-cover/route.ts` - File upload example

---

## 🔑 Helper Functions Available

```typescript
// From @/lib/supabase/server
createServerClient()           // Create Supabase client
validateAuthToken(authHeader)  // Validate and get user (optional for auth)
successResponse(data, message) // Format success response
errorResponse(error, details)  // Format error response
```

---

## 🎨 Response Format

**Always use consistent format:**

```typescript
// Success
return NextResponse.json(
  successResponse(data, 'Success message'),
  { status: 200 }
);

// Error
return NextResponse.json(
  errorResponse('Error message', 'Additional details'),
  { status: 400 }
);
```

---

## 🚀 Quick Start Commands

```bash
# 1. Create action-files directory
mkdir -p /app/action-files

# 2. Copy template implementations
# Files will be created in next step

# 3. Implement routes one by one
# Start with high priority (Phase 1)

# 4. Test each route
curl -X GET http://localhost:3000/api/explore

# 5. Update documentation
# Mark routes as ✅ in API_DOC.md
```

---

## 💡 Pro Tips

1. **Follow the Pattern:** All implemented routes follow the same structure
2. **Reuse Code:** Copy from similar existing routes
3. **Test Incrementally:** Implement and test one route at a time
4. **Error First:** Always handle errors before success cases
5. **Validate Input:** Check required fields and data types
6. **Use TypeScript:** Define interfaces for request/response bodies
7. **Check Permissions:** Verify user ownership before updates/deletes
8. **Optimize Queries:** Use `.select()` to fetch only needed fields
9. **Handle Edge Cases:** Empty results, missing data, constraints
10. **Document Changes:** Update API_DOC.md after implementation

---

## 📊 Progress Tracking

**Total Placeholder Routes:** 21

- [ ] Phase 1: High Priority (6 routes)
- [ ] Phase 2: Medium Priority (6 routes)
- [ ] Phase 3: Low Priority (4 routes)
- [ ] Phase 4: Upload Endpoints (5 routes)

**Estimated Time:**
- Phase 1: 4-6 hours
- Phase 2: 3-4 hours
- Phase 3: 2-3 hours
- Phase 4: 2-3 hours
- **Total: 11-16 hours**

---

## 🆘 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Ensure CORS is configured in Next.js config

### Issue 2: Auth Token Invalid
**Solution:** Check token format: `Bearer <token>`

### Issue 3: Database Query Fails
**Solution:** Verify table/column names match schema

### Issue 4: File Upload Fails
**Solution:** Check Supabase storage bucket exists and has correct policies

### Issue 5: Unique Constraint Violation
**Solution:** Use `.upsert()` or handle error gracefully

---

## ✅ Success Criteria

Route is complete when:
1. ✅ Code follows the standard pattern
2. ✅ All error cases handled
3. ✅ Response format is consistent
4. ✅ Database queries optimized
5. ✅ Tested with sample data
6. ✅ Documentation updated

---

**Ready to implement? Start with Phase 1!** 🚀
