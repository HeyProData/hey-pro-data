# Action Files Directory

This directory contains ready-to-use implementation files for all placeholder API routes.

## 📂 Files

1. **explore-route-implementation.ts**
   - Implements `/api/explore/route.ts`
   - Crew directory with advanced filtering
   - Pagination and role enrichment

2. **notifications-route-implementation.ts**
   - Implements `/api/notifications/route.ts`
   - User notifications with actor info
   - Unread count and filtering

3. **skills-route-implementation.ts**
   - Implements `/api/skills/route.ts`
   - GET: Fetch user skills
   - POST: Add new skill with validation

4. **availability-route-implementation.ts**
   - Implements `/api/availability/route.ts`
   - GET: Fetch availability calendar
   - POST: Set/update availability (upsert)

5. **upload-template.ts**
   - Generic template for all upload endpoints
   - Includes validation, storage, and error handling
   - Customization guide included

## 🚀 How to Use

### Step 1: Copy Implementation
```bash
# Copy the content from action file
cat /app/action-files/explore-route-implementation.ts

# Paste into the actual route file
# Replace existing placeholder code
```

### Step 2: Verify Database Schema
- Check table names match your Supabase schema
- Verify column names are correct
- Ensure relationships are properly defined

### Step 3: Test the Route
```bash
# Test with curl
curl -X GET "http://localhost:3000/api/explore?keyword=camera&page=1"

# Or use Postman/Thunder Client
```

### Step 4: Update Documentation
- Mark route as ✅ in `/app/API_DOC.md`
- Remove from placeholder summary

## 🎨 Customization Tips

### For Explore Route:
- Adjust filters based on your use case
- Add more profile fields if needed
- Optimize role filtering for performance

### For Notifications Route:
- Customize notification types
- Add more metadata fields
- Implement notification preferences

### For Skills Route:
- Add skill categories if needed
- Implement skill endorsements
- Add proficiency levels validation

### For Availability Route:
- Add time slots (morning, afternoon, evening)
- Implement recurring availability
- Add booking integration

### For Upload Routes:
- Follow the template customization guide
- Set appropriate bucket policies in Supabase
- Adjust file size limits based on needs

## ⚠️ Important Notes

1. **Database Schema**: Ensure all referenced tables exist in your Supabase instance
2. **Storage Buckets**: Create required buckets in Supabase Storage before using upload endpoints
3. **Authentication**: All routes use `validateAuthToken()` - ensure this helper is available
4. **Error Handling**: All routes follow consistent error response format
5. **Testing**: Test each route thoroughly before deploying to production

## 📊 Implementation Status

Use these action files to implement:
- ✅ Explore API (High Priority)
- ✅ Notifications API (High Priority)
- ✅ Skills API (Medium Priority)
- ✅ Availability API (Medium Priority)
- ✅ All Upload Endpoints (Low Priority)

Remaining routes (not included):
- Contacts API (simple CRUD - follow pattern from gigs)
- Referrals API (simple CRUD - follow pattern from applications)
- Explore sub-routes (follow main explore pattern)

## 🆘 Need Help?

Refer to:
- `/app/API_IMPLEMENTATION_PLACEHOLDER_GUIDE.md` - Complete implementation guide
- `/app/API_DOC.md` - Full API documentation
- Existing implemented routes - Use as reference

## ✨ Best Practices

1. **Follow the Pattern**: All routes use the same structure
2. **Validate Input**: Always validate request data
3. **Handle Errors**: Use try-catch and proper error responses
4. **Optimize Queries**: Fetch only needed fields
5. **Test Edge Cases**: Empty results, invalid input, constraints
6. **Document Changes**: Update API_DOC.md after implementation

---

**Ready to implement? Start with high-priority routes!** 🚀
