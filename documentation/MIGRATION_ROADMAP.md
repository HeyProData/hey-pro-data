# HeyProData Backend Migration Roadmap

**Project:** Migrate from Custom Auth to Supabase Backend Architecture  
**Status:** Phase 1 Complete ✅  
**Last Updated:** January 2025

---

## 🎯 Migration Overview

### Current State (Before Migration)
- **Frontend:** Next.js 15 with custom authentication
- **Auth System:** Axios + Cookies + localStorage
- **API Pattern:** `/api/v1/*` endpoints (mock backend)
- **Session:** Cookie-based (`accessToken`)

### Target State (After Migration)
- **Frontend:** Next.js 15 with Supabase integration
- **Auth System:** Supabase Auth (Email/Password + OTP + Google OAuth)
- **API Pattern:** Next.js API routes (`/api/*`) with Supabase backend
- **Session:** Supabase session with JWT Bearer tokens

---

## 📋 Migration Phases

### ✅ Phase 1: Supabase Setup & Configuration (COMPLETED)
**Duration:** 1 hour  
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Install @supabase/supabase-js
- [x] Create Supabase client configuration
- [x] Create Supabase server utilities
- [x] Set up AuthContext provider
- [x] Configure environment variables
- [x] Integrate AuthProvider into app
- [x] Create comprehensive documentation

**Files Created:**
- `/lib/supabase/client.ts` - Browser-side client
- `/lib/supabase/server.ts` - Server-side utilities
- `/contexts/AuthContext.tsx` - Global auth state
- `.env.local` - Environment configuration
- `/PHASE_1_SUPABASE_SETUP.md` - Phase documentation
- `/docs/SUPABASE_INTEGRATION_GUIDE.md` - Integration guide

**Files Modified:**
- `/components/Providers/index.tsx` - Added AuthProvider

**Documentation:** See `PHASE_1_SUPABASE_SETUP.md`

---

### 🔄 Phase 2: Authentication Replacement (PENDING)
**Estimated Duration:** 3-4 hours  
**Status:** ⏳ Not Started

**Tasks:**
1. Replace login page authentication
   - Remove axios login call
   - Implement Supabase signInWithPassword
   - Update form handling
   - Add error handling

2. Replace signup page authentication
   - Remove axios registration call
   - Implement Supabase signUp
   - Implement OTP verification
   - Update form flow

3. Add Google OAuth
   - Implement signInWithOAuth
   - Create callback handler
   - Test OAuth flow

4. Implement password reset
   - Create forgot password page
   - Implement resetPasswordForEmail
   - Create password reset page
   - Test reset flow

5. Update authentication action files
   - `/app/(auth)/login/action.ts`
   - `/app/(auth)/signup/action.ts`

**Success Criteria:**
- Users can sign up with email/password
- OTP verification works
- Users can log in with email/password
- Google OAuth works
- Password reset works
- "Keep me logged in" functions correctly

---

### 🔄 Phase 3: Middleware Updates (PENDING)
**Estimated Duration:** 1-2 hours  
**Status:** ⏳ Not Started

**Tasks:**
1. Replace cookie-based auth in middleware
   - Remove `accessToken` cookie check
   - Implement Supabase session check
   - Update protected routes logic

2. Update route protection
   - Test protected routes
   - Verify redirects work
   - Handle auth state properly

**Files to Modify:**
- `/middleware.ts`

**Success Criteria:**
- Protected routes redirect unauthenticated users
- Authenticated users can access protected routes
- Auth routes redirect authenticated users
- Middleware performs efficiently

---

### 🔄 Phase 4: API Integration (PENDING)
**Estimated Duration:** 4-6 hours  
**Status:** ⏳ Not Started

**Tasks:**
1. Create API routes matching backend architecture
   - Profile endpoints (4)
   - Skills endpoints (3)
   - Gigs endpoints (5)
   - Applications endpoints (6)
   - Notifications endpoints (3)
   - File upload endpoints (3)
   - Availability endpoints (4)
   - Contacts endpoints (3)
   - Referrals endpoints (2)

2. Implement authentication in API routes
   - Use `getUserFromRequest` helper
   - Return proper error responses
   - Test with valid/invalid tokens

3. Connect to Supabase database
   - Implement database queries
   - Test Row Level Security
   - Handle errors properly

**API Routes to Create:**
```
/app/api/
├── profile/
│   ├── route.ts (GET, PATCH)
│   └── check/route.ts (GET)
├── skills/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (DELETE)
├── gigs/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       ├── route.ts (GET, PATCH, DELETE)
│       ├── apply/route.ts (POST)
│       └── applications/route.ts (GET)
├── applications/
│   ├── my/route.ts (GET)
│   └── [id]/route.ts (GET)
├── notifications/
│   ├── route.ts (GET)
│   ├── [id]/read/route.ts (PATCH)
│   └── mark-all-read/route.ts (PATCH)
├── upload/
│   ├── resume/route.ts (POST)
│   ├── portfolio/route.ts (POST)
│   └── profile-photo/route.ts (POST)
└── ... (additional endpoints)
```

**Success Criteria:**
- All 31 API endpoints created
- Authentication works on protected endpoints
- Database queries return correct data
- File uploads work properly
- Error handling is consistent

---

### 🔄 Phase 5: Onboarding Flow Alignment (PENDING)
**Estimated Duration:** 2-3 hours  
**Status:** ⏳ Not Started

**Tasks:**
1. Update onboarding pages to use Supabase
   - Name page → Update profile API
   - Location page → Update profile API
   - Username page → Update profile API
   - Profile photo page → Upload to Supabase Storage

2. Implement profile completeness checks
   - Use `/api/profile/check` endpoint
   - Redirect based on profile status
   - Show completion progress

3. Update form submissions
   - Replace axios calls with fetch to new API
   - Handle responses properly
   - Update error handling

**Files to Modify:**
- `/app/(auth)/onboarding/name/page.tsx`
- `/app/(auth)/onboarding/location/page.tsx`
- `/app/(auth)/onboarding/username/page.tsx`
- `/app/(auth)/onboarding/profile-photo/page.tsx`

**Success Criteria:**
- Onboarding flow completes successfully
- Profile data saves to Supabase
- Profile completeness checks work
- Users redirect to correct pages
- Photos upload to Supabase Storage

---

### 🔄 Phase 6: Application Pages Migration (PENDING)
**Estimated Duration:** 4-6 hours  
**Status:** ⏳ Not Started

**Tasks:**
1. Update all application pages
   - Home/Explore page
   - Profile page
   - Gigs pages
   - Jobs pages
   - Dashboard/Settings

2. Replace API calls
   - Remove axios instance usage
   - Use fetch with Supabase auth
   - Update data fetching patterns

3. Update components
   - Replace mock data with real API calls
   - Add loading states
   - Add error handling

**Files to Review and Migrate:**
- `/app/(app)/page.tsx`
- `/app/(app)/profile/*`
- `/app/(app)/(gigs)/*`
- `/app/(app)/jobs/*`
- All components in `/components/`

**Success Criteria:**
- All pages fetch data from Supabase
- Authentication works on all pages
- Loading states display correctly
- Errors handled gracefully
- User experience is smooth

---

### 🔄 Phase 7: Cleanup & Testing (PENDING)
**Estimated Duration:** 2-3 hours  
**Status:** ⏳ Not Started

**Tasks:**
1. Remove legacy code
   - Delete `/lib/axios.ts`
   - Delete `/lib/apiCalling.ts`
   - Remove `NEXT_PUBLIC_SERVER_URL` env var
   - Remove mock auth utilities
   - Remove old action files

2. Update all imports
   - Remove axios imports
   - Remove old auth imports
   - Verify no broken imports

3. Comprehensive testing
   - Test all authentication flows
   - Test all API endpoints
   - Test file uploads
   - Test protected routes
   - Test error scenarios
   - Test on different browsers

4. Performance optimization
   - Check bundle size
   - Optimize database queries
   - Add caching where appropriate
   - Test loading times

**Files to Delete:**
- `/lib/axios.ts`
- `/lib/apiCalling.ts`
- Any mock auth files
- Old action files (if replaced)

**Success Criteria:**
- No legacy code remains
- All features work correctly
- No console errors
- Performance is acceptable
- Documentation is complete

---

## 📊 Overall Progress

| Phase | Status | Progress | Duration |
|-------|--------|----------|----------|
| Phase 1: Setup | ✅ Complete | 100% | 1 hour |
| Phase 2: Auth | ⏳ Pending | 0% | 3-4 hours |
| Phase 3: Middleware | ⏳ Pending | 0% | 1-2 hours |
| Phase 4: API | ⏳ Pending | 0% | 4-6 hours |
| Phase 5: Onboarding | ⏳ Pending | 0% | 2-3 hours |
| Phase 6: Pages | ⏳ Pending | 0% | 4-6 hours |
| Phase 7: Cleanup | ⏳ Pending | 0% | 2-3 hours |

**Total Estimated Time:** 17-25 hours  
**Completed:** 1 hour (4-6%)  
**Remaining:** 16-24 hours

---

## 🎯 Key Success Metrics

### Functionality
- [ ] All authentication flows work
- [ ] All 31 API endpoints operational
- [ ] File uploads to Supabase Storage work
- [ ] Profile management works
- [ ] Gig creation/management works
- [ ] Applications system works

### Performance
- [ ] Page load times < 2 seconds
- [ ] API response times < 500ms
- [ ] No memory leaks
- [ ] Efficient database queries

### Security
- [ ] Row Level Security enforced
- [ ] JWT tokens validated properly
- [ ] File upload security in place
- [ ] No exposed sensitive data

### User Experience
- [ ] No broken functionality
- [ ] Smooth transitions
- [ ] Clear error messages
- [ ] Loading states everywhere
- [ ] Responsive design maintained

---

## ⚠️ Known Risks & Mitigation

### Risk 1: Breaking Existing Auth
**Mitigation:** Phases 1-2 don't remove old auth - both systems coexist

### Risk 2: Data Loss During Migration
**Mitigation:** No data migration needed - fresh Supabase backend

### Risk 3: API Endpoint Mismatches
**Mitigation:** Follow backend architecture docs precisely

### Risk 4: Session Management Issues
**Mitigation:** Thorough testing of "Keep me logged in" feature

### Risk 5: OAuth Flow Complexity
**Mitigation:** Follow Supabase docs, test extensively

---

## 📚 Documentation

### Phase-Specific Docs
- ✅ [Phase 1 Documentation](./PHASE_1_SUPABASE_SETUP.md)
- ⏳ Phase 2 Documentation (pending)
- ⏳ Phase 3 Documentation (pending)
- ⏳ Phase 4 Documentation (pending)
- ⏳ Phase 5 Documentation (pending)
- ⏳ Phase 6 Documentation (pending)
- ⏳ Phase 7 Documentation (pending)

### Integration Guides
- ✅ [Supabase Integration Guide](./docs/SUPABASE_INTEGRATION_GUIDE.md)
- ⏳ API Endpoints Guide (pending)
- ⏳ File Upload Guide (pending)
- ⏳ Testing Guide (pending)

### Backend Architecture Docs (Provided)
- ✅ Backend Architecture Overview
- ✅ API Endpoints Reference
- ✅ Authentication Integration Guide

---

## 🔄 Next Steps

### Immediate Next Actions (Phase 2)
1. Review login page implementation
2. Create new login action with Supabase
3. Test login flow thoroughly
4. Repeat for signup page
5. Implement OTP verification
6. Test complete auth flow

### Before Starting Phase 2
- [x] Complete Phase 1
- [x] Review backend architecture docs
- [x] Test Supabase connection
- [ ] Plan authentication flow changes
- [ ] Prepare test accounts
- [ ] Set up error tracking

---

## 🆘 Support & Resources

### Team Contacts
- **Backend Docs:** See `BACKEND_ARCHITECTURE_OVERVIEW.md`
- **API Reference:** See `API_ENDPOINTS_REFERENCE.md`
- **Auth Guide:** See `AUTHENTICATION_INTEGRATION_GUIDE.md`

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Migration Started:** January 2025  
**Expected Completion:** TBD  
**Current Phase:** Phase 1 Complete ✅
