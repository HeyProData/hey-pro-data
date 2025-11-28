# Authentication Testing Checklist

This document provides a comprehensive checklist for testing the authentication system after Google OAuth setup.

## ✅ Pre-Testing Setup Verification

### Environment Configuration
- [x] `.env.local` file created with all required variables
- [x] Supabase URL configured: `https://kvidydsfnnrathhpuxye.supabase.co`
- [x] Supabase Anon Key configured
- [x] Application running on `http://localhost:3000`

### Supabase Dashboard Configuration
- [ ] Google Provider enabled in Authentication → Providers
- [ ] Google Client ID added to Supabase Dashboard
- [ ] Google Client Secret added to Supabase Dashboard

### Google Cloud Console Configuration
- [ ] Supabase callback URL added to authorized redirect URIs:
  - `https://kvidydsfnnrathhpuxye.supabase.co/auth/v1/callback`

## 🧪 Testing Scenarios

### Test 1: Google OAuth Sign Up (New User)

**Steps:**
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/login`
3. Click "Sign in with Google" button
4. Select Google account or enter credentials
5. Authorize the application
6. Wait for redirect

**Expected Results:**
- ✅ Redirected to Google OAuth consent screen
- ✅ After authorization, redirected to `http://localhost:3000/callback`
- ✅ Callback page shows "Completing authentication..." loading message
- ✅ Redirected to `/form` (profile creation form) for new users
- ✅ No errors in browser console
- ✅ Session persists (check Application → Local Storage in DevTools)

**Potential Issues:**
- ❌ "redirect_uri_mismatch": Check Google Cloud Console redirect URIs
- ❌ "Authentication failed": Check Supabase Dashboard Google provider setup
- ❌ Stuck on callback page: Check browser console for errors

---

### Test 2: Complete Profile After OAuth

**Prerequisites:** Completed Test 1

**Steps:**
1. Fill in the profile form:
   - First Name
   - Surname
   - Country (select from dropdown)
   - City
   - Optional: Alias names
2. Click "Create your profile"

**Expected Results:**
- ✅ Form validation works (all required fields)
- ✅ Successfully created profile
- ✅ Redirected to `/home` page
- ✅ Profile data stored in `user_profiles` table
- ✅ Session persists

---

### Test 3: Google OAuth Sign In (Returning User)

**Prerequisites:** Completed Test 1 and Test 2

**Steps:**
1. Log out (if logged in)
2. Open browser (can use same session)
3. Navigate to `http://localhost:3000/login`
4. Click "Sign in with Google"
5. Select same Google account
6. Wait for redirect

**Expected Results:**
- ✅ Redirected to Google OAuth (may skip consent if already authorized)
- ✅ After authorization, redirected to `http://localhost:3000/callback`
- ✅ Callback page processes authentication
- ✅ **Directly redirected to `/home`** (not `/form`) because profile exists
- ✅ Home page loads with user data
- ✅ Session active

---

### Test 4: Email/Password Sign Up

**Steps:**
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/signup`
3. Enter email and password
4. Password must meet requirements:
   - At least 8 characters
   - 1 uppercase letter
   - 1 number
   - 1 special character
5. Click "Sign up"

**Expected Results:**
- ✅ Password validation works (real-time feedback)
- ✅ Form validation works
- ✅ "Verification code sent to your email!" message
- ✅ Redirected to `/otp` page
- ✅ Email received with OTP code

---

### Test 5: OTP Verification

**Prerequisites:** Completed Test 4

**Steps:**
1. Check email for OTP code
2. Enter OTP code on `/otp` page
3. Click verify

**Expected Results:**
- ✅ OTP code validates
- ✅ Redirected to `/form` page
- ✅ Session created
- ✅ Can complete profile

---

### Test 6: Email/Password Sign In

**Prerequisites:** Completed Tests 4, 5, and profile creation

**Steps:**
1. Log out (if logged in)
2. Navigate to `http://localhost:3000/login`
3. Enter email and password
4. **Test "Keep me logged in" checkbox:**
   - **Checked**: Session should persist after browser close
   - **Unchecked**: Session should expire when browser closes
5. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/home` (if profile complete)
- ✅ Redirected to `/form` (if no profile)
- ✅ Invalid credentials show error message
- ✅ Session storage works as expected (localStorage vs sessionStorage)

---

### Test 7: Keep Me Logged In - Checked

**Prerequisites:** Completed Test 6 with checkbox CHECKED

**Steps:**
1. Login with "Keep me logged in" checked
2. Close browser completely
3. Open browser again
4. Navigate to `http://localhost:3000`

**Expected Results:**
- ✅ User remains logged in
- ✅ Redirected to `/home` (not `/login`)
- ✅ Session data in localStorage (check DevTools → Application → Local Storage)

---

### Test 8: Keep Me Logged In - Unchecked

**Prerequisites:** Completed Test 6 with checkbox UNCHECKED

**Steps:**
1. Login with "Keep me logged in" unchecked
2. Close browser completely (all tabs and windows)
3. Open browser again
4. Navigate to `http://localhost:3000`

**Expected Results:**
- ✅ User is logged out
- ✅ Redirected to `/login`
- ✅ Session expired (no data in sessionStorage)

---

### Test 9: Protected Routes Without Authentication

**Steps:**
1. Ensure logged out (clear cookies and storage)
2. Try to navigate directly to:
   - `http://localhost:3000/home`
   - `http://localhost:3000/profile`
   - `http://localhost:3000/gigs/create`

**Expected Results:**
- ✅ All protected routes redirect to `/login`
- ✅ No access to protected content
- ✅ Session check works on all pages

---

### Test 10: Callback Page Error Handling

**Steps:**
1. Navigate directly to `http://localhost:3000/callback` (without OAuth flow)
2. Observe behavior

**Expected Results:**
- ✅ Shows error message: "Authentication failed"
- ✅ Redirects to `/login` after 2 seconds
- ✅ No crashes or infinite loops

---

### Test 11: Profile Completion Check

**Steps:**
1. Create new account via Google OAuth
2. Reach `/form` page
3. Try to navigate away without completing form
4. Complete form partially and navigate away
5. Return to application

**Expected Results:**
- ✅ Incomplete profile redirects back to `/form`
- ✅ Cannot access `/home` without complete profile
- ✅ Profile check works on all protected routes

---

### Test 12: Multiple Browser Test

**Steps:**
1. Login in Browser A (e.g., Chrome)
2. Login with same account in Browser B (e.g., Firefox)
3. Verify both sessions work

**Expected Results:**
- ✅ Both sessions active simultaneously
- ✅ No conflicts between sessions
- ✅ Each browser maintains its own session

---

### Test 13: Session Expiration

**Steps:**
1. Login with email/password
2. Wait for session to expire (check Supabase Auth settings for expiration time)
3. Try to access protected route

**Expected Results:**
- ✅ Expired session redirects to `/login`
- ✅ Error message shown: "Session expired"
- ✅ Can login again successfully

---

## 🔍 Browser Console Checks

During all tests, monitor the browser console (F12 → Console tab) for:

### Expected Console Output
```
✅ No errors related to authentication
✅ Successful API calls to Supabase
✅ Session management logs (if enabled)
```

### Watch for Errors
```
❌ "redirect_uri_mismatch"
❌ "Invalid authentication"
❌ "Network request failed"
❌ "Session error"
❌ React rendering errors
```

---

## 🗄️ Database Verification

After successful authentication, verify in Supabase Dashboard:

### auth.users Table
- [ ] User record created with correct email
- [ ] OAuth provider data stored (for Google OAuth)
- [ ] User ID generated

### user_profiles Table
- [ ] Profile record created with user_id matching auth.users
- [ ] All required fields populated (first_name, surname, country, city)
- [ ] Optional fields stored if provided
- [ ] Timestamps set correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"
**Cause:** Google Cloud Console redirect URI doesn't match Supabase callback
**Solution:** Add `https://kvidydsfnnrathhpuxye.supabase.co/auth/v1/callback` to Google Cloud Console

### Issue 2: Google OAuth button does nothing
**Cause:** Google provider not enabled in Supabase or wrong credentials
**Solution:** Enable Google provider in Supabase Dashboard and add correct credentials

### Issue 3: Callback page shows error
**Cause:** Session not created or OAuth flow interrupted
**Solution:** Check Supabase logs, verify credentials, clear cache and retry

### Issue 4: Redirects to login after successful OAuth
**Cause:** Session not properly stored
**Solution:** Check browser storage settings, ensure cookies not blocked

### Issue 5: Profile form not showing after first OAuth
**Cause:** Profile check logic issue
**Solution:** Check `/api/profile` endpoint, verify RLS policies

### Issue 6: Keep me logged in not working
**Cause:** Storage preference not set correctly
**Solution:** Check `setStoragePreference()` calls in login/signup flows

---

## ✨ Success Criteria

All tests pass with:
- ✅ No console errors
- ✅ Smooth redirects
- ✅ Data stored correctly
- ✅ Session management works
- ✅ Both OAuth and email/password work
- ✅ Protected routes properly secured
- ✅ Profile completion enforced

---

## 📝 Test Results Log

**Date:** _____________  
**Tester:** _____________  
**Environment:** Development / Production

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Google OAuth Sign Up | ⬜ | |
| 2 | Complete Profile | ⬜ | |
| 3 | Google OAuth Sign In | ⬜ | |
| 4 | Email/Password Sign Up | ⬜ | |
| 5 | OTP Verification | ⬜ | |
| 6 | Email/Password Sign In | ⬜ | |
| 7 | Keep Logged In - Checked | ⬜ | |
| 8 | Keep Logged In - Unchecked | ⬜ | |
| 9 | Protected Routes | ⬜ | |
| 10 | Callback Error Handling | ⬜ | |
| 11 | Profile Completion | ⬜ | |
| 12 | Multiple Browsers | ⬜ | |
| 13 | Session Expiration | ⬜ | |

**Overall Status:** ⬜ Passed / ⬜ Failed / ⬜ Partially Passed

**Additional Notes:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
