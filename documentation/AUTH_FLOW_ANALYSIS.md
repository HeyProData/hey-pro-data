# Authentication Flow Analysis - HeyProData

> **Architecture Note**: This authentication system uses **Supabase Auth SDK** for authentication operations combined with **Next.js API Routes** for data access and profile management. Authentication is handled client-side via Supabase, while data operations go through custom API endpoints with Bearer token validation.

## Table of Contents
1. [Routing Logic](#routing-logic)
2. [Unauthorized Access Prevention](#unauthorized-access-prevention)
3. [Form Page Logic](#form-page-logic)
4. [API Routes Used in Authentication Flow](#api-routes-used-in-authentication-flow)
5. [Actionable Implementation Plan](#actionable-implementation-plan)

---

## 1. Routing Logic

### Root Page (`/app/page.js`)
**Purpose**: Entry point that routes users based on authentication status

```javascript
// Flow:
1. Check session: supabase.auth.getSession()
2. If session exists:
   - Call /api/profile to check for profile
   - Profile exists → redirect to /home
   - No profile → redirect to /auth/form
3. If no session:
   - Redirect to /auth/login
```

**Key Implementation Details**:
- Uses Supabase client for session check
- Calls `/api/profile` endpoint to verify profile existence
- Shows loading spinner during check
- Catches errors and defaults to login redirect

---

### Login Page (`/app/(auth)/login/page.tsx`)
**Purpose**: Authenticate users with email/password or OAuth

```javascript
// On Page Load:
1. Check if user already has active session via supabase.auth.getSession()
2. If session exists:
   - Get access token from session
   - Call GET /api/profile with Bearer token
   - Profile exists → redirect to /home
   - No profile → redirect to /form

// On Form Submit:
1. Set storage preference (localStorage vs sessionStorage)
2. Normalize email to lowercase
3. Call supabase.auth.signInWithPassword()
4. On success:
   - Get access token
   - Call GET /api/profile with Bearer token
   - Redirect based on profile existence

// OAuth Flow:
1. Set storage preference to true (keep logged in)
2. Call supabase.auth.signInWithOAuth()
3. Redirect to /callback for processing
```

**API Endpoints Used**:
- `GET /api/profile` - Check if user profile exists

**Key Features**:
- "Keep me logged in" checkbox controls storage type
- Email normalization prevents case-sensitive issues
- User-friendly error messages for common failures
- Auto-redirects authenticated users

---

### Sign Up Page (`/app/(auth)/signup/page.tsx`)
**Purpose**: Create new user accounts

```javascript
// On Page Load:
1. Check if user already logged in via supabase.auth.getSession()
2. If session exists:
   - Get access token
   - Call GET /api/profile to check profile
   - Redirect to home or form

// On Form Submit:
1. Validate password requirements
2. Normalize email to lowercase
3. Call supabase.auth.signUp()
4. Handle two scenarios:
   - Email confirmation required → redirect to /auth/otp
   - Auto-confirmed → redirect to /auth/form

// OAuth Sign Up:
- Same as OAuth login
- Uses /callback
```

**API Endpoints Used**:
- `GET /api/profile` - Check if user profile exists

**Key Features**:
- Real-time password validation (8+ chars, uppercase, number, special char)
- Duplicate email detection
- Handles both OTP and auto-confirm configurations

---

### Callback Page (`/app/(auth)/callback/page.tsx`)
**Purpose**: Process OAuth authentication redirects

```javascript
// Main Flow:
1. Extract session via supabase.auth.getSession()
2. Get access token from session
3. Call checkProfileAndRedirect function

// checkProfileAndRedirect function:
1. Call GET /api/profile with Bearer token
2. Handle errors gracefully (non-blocking)
3. No profile → redirect to /form
4. Profile exists → redirect to /home

// Error Handling:
- Auth errors → redirect to /login
- Profile check errors treated as "no profile"
```

**API Endpoints Used**:
- `GET /api/profile` - Check if user profile exists

**Key Features**:
- Handles PKCE OAuth flow
- Isolated error handling for profile checks
- Profile errors don't block authentication flow
- Shows loading state during processing

---

### Form Page (`/app/(auth)/form/page.tsx`)
**Purpose**: Collect required user profile information

```javascript
// On Mount:
1. Check authentication via supabase.auth.getSession()
2. If no session → redirect to /login
3. Get access token
4. Call GET /api/profile to check if profile exists
5. If profile exists → redirect to /home
6. Otherwise → show form

// On Submit:
1. Validate all required fields (firstName, surname, country, city)
2. Get access token from session
3. Call PATCH /api/profile with Bearer token and profile data:
   - legal_first_name
   - legal_surname
   - alias_first_name (optional)
   - alias_surname (optional)
   - country
   - city
4. On success → redirect to /home
```

**API Endpoints Used**:
- `GET /api/profile` - Check if profile exists (on mount)
- `PATCH /api/profile` - Create or update user profile

**Database Schema Mapping**:
```
Form Field          →  Database Column
-----------------------------------------
firstName           →  legal_first_name
surname             →  legal_surname
aliasFirstName      →  alias_first_name
aliasSurname        →  alias_surname
country             →  country
city                →  city
currentUser.id      →  user_id (foreign key to auth.users)
```

**Key Features**:
- Only accessible to authenticated users
- Prevents duplicate profile creation
- Uses correct database field names
- Real-time form validation

---

### Home Page (`/app/(app)/page.tsx`)
**Purpose**: Main application dashboard (protected route)

```javascript
// Authentication Check:
1. Check session via supabase.auth.getSession()
2. If no session → redirect to /login
3. Get access token
4. Call GET /api/profile to check profile existence
5. If no profile → redirect to /form
6. Show home page
```

**API Endpoints Used**:
- `GET /api/profile` - Verify profile exists and is complete

**Key Features**:
- Requires both authentication AND profile completion
- Falls back to login on any error

---

## 2. Unauthorized Access Prevention

### Session-Based Protection
All protected pages implement this pattern:

```javascript
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')  // Redirect unauthorized users
      return
    }

    // Get token and call API for additional checks
    const token = session?.access_token
    
    // Call /api/profile or other endpoints as needed
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  }

  checkAuth()
}, [router])
```

### Multi-Layer Protection

**Layer 1: Client-Side Route Guards**
- Every protected page checks session on mount via Supabase client
- Immediate redirect if unauthorized
- Prevents UI flash of protected content

**Layer 2: Profile Completion Check**
- Session exists but no profile → redirect to /form
- Uses `GET /api/profile` endpoint to verify
- Ensures data integrity
- Guides user through onboarding

**Layer 3: API Route Authentication**
- All API routes validate Bearer token
- Uses `validateAuthToken()` helper from `/lib/supabase/server.ts`
- Returns 401 if token invalid
- Enforces server-side security

**Layer 4: Database RLS (Row-Level Security)**
- Supabase enforces RLS policies at database level
- Users can only access their own data
- Automatic security through authenticated user context

### Session Persistence Strategy

**AdaptiveStorage Class** (`/lib/supabase/client.ts`):
```javascript
// Determines storage type based on user preference
getStorage() {
  const keepLoggedIn = localStorage.getItem('supabase-storage-preference')
  return keepLoggedIn === 'true' ? localStorage : sessionStorage
}

// PKCE keys always use localStorage
setItem(key, value) {
  if (key.includes('code-verifier')) {
    localStorage.setItem(key, value)  // Required for OAuth
  } else {
    this.getStorage().setItem(key, value)
  }
}
```

**Storage Behavior**:
- `localStorage`: Session persists after browser close (keep me logged in = true)
- `sessionStorage`: Session expires when browser closes (keep me logged in = false)
- PKCE/OAuth keys: Always in localStorage (technical requirement)

### Protected Route Checklist
Every protected page MUST implement:
- ✅ Session check on mount using `supabase.auth.getSession()`
- ✅ Redirect to login if no session
- ✅ Bearer token extraction from session
- ✅ API call to `/api/profile` or other endpoints with Authorization header
- ✅ Error handling with fallback redirect
- ✅ Loading state during verification

---

## 3. Form Page Logic

### Complete Form Page Flow

#### Step 1: Initial Load & Authentication Check
```javascript
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    // GUARD 1: No session
    if (!session) {
      router.push('/login')
      return
    }

    setCurrentUser(session.user)

    // GUARD 2: Profile already exists
    const token = session?.access_token
    const profileResponse = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const profileData = await profileResponse.json()

    if (profileData.success && profileData.data) {
      router.push('/home')  // Already completed, go to home
    }
  }

  checkAuth()
}, [router])
```

**Guards**:
1. **No Session**: Redirect to login (user must be authenticated first)
2. **Profile Exists**: Redirect to home (prevent duplicate profile creation)

**API Endpoint Used**: `GET /api/profile`

#### Step 2: Form Validation
```javascript
// Real-time validation
const isFormValid =
  formData.firstName.trim() !== '' &&
  formData.surname.trim() !== '' &&
  formData.country !== '' &&
  formData.city.trim() !== ''

// Button state
<button disabled={!isFormValid || loading}>
  {loading ? 'Creating profile...' : 'Create your profile'}
</button>
```

**Required Fields**:
- First Name (legal name)
- Surname (legal name)
- Country (dropdown selection)
- City (text input)

**Optional Fields**:
- Alias First Name
- Alias Surname

#### Step 3: Form Submission & API Call
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  // Create/update profile via API
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      legal_first_name: formData.firstName.trim(),
      legal_surname: formData.surname.trim(),
      alias_first_name: formData.aliasFirstName.trim() || null,
      alias_surname: formData.aliasSurname.trim() || null,
      country: formData.country,
      city: formData.city.trim()
    })
  })

  const data = await response.json()

  if (data.success) {
    router.push('/home')
  }
}
```

**API Endpoint Used**: `PATCH /api/profile`

**Database Schema Mapping**:
```
Form Field          →  API Payload Key      →  Database Column
-----------------------------------------------------------------
firstName           →  legal_first_name     →  legal_first_name
surname             →  legal_surname        →  legal_surname
aliasFirstName      →  alias_first_name     →  alias_first_name
aliasSurname        →  alias_surname        →  alias_surname
country             →  country              →  country
city                →  city                 →  city
currentUser.id      →  (added by API)       →  user_id
```

#### Step 4: Post-Submission
```javascript
// On success:
1. API returns success response
2. Redirect to /home
3. Home page will verify session and profile

// On error:
1. Display error message in UI from API response
2. Keep user on form page
3. Allow retry
```

### Form Page State Management
```javascript
// Form State
const [formData, setFormData] = useState({
  firstName: '',
  surname: '',
  aliasFirstName: '',
  aliasSurname: '',
  country: '',
  city: ''
})

// UI State
const [loading, setLoading] = useState(false)      // Submit in progress
const [error, setError] = useState('')             // Error message
const [currentUser, setCurrentUser] = useState(null)  // Authenticated user object
```

### How Form is Checked
1. **Client-Side Validation**: Real-time check of required fields
2. **API Validation**: Server-side validation via `/api/profile` endpoint
3. **Database Constraint**: user_id is unique (prevents duplicates)
4. **RLS Policy**: Only authenticated user can insert their own profile
5. **API Response**: Returns inserted data or error
6. **Error Handling**: Shows user-friendly messages from API

### Edge Cases Handled
✅ User navigates back to form after profile created → Redirect to home
✅ User loses session during form → Redirect to login
✅ API call fails → Show error, allow retry
✅ User refreshes page → Re-check auth and profile status
✅ User closes browser during form → Data not saved (expected behavior)

---

## 4. API Routes Used in Authentication Flow

### Profile Management API

#### GET /api/profile
**Purpose**: Get current user's profile data

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user_id": "uuid",
    "legal_first_name": "John",
    "legal_surname": "Doe",
    "alias_first_name": null,
    "alias_surname": null,
    "country": "United Arab Emirates",
    "city": "Dubai",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Response No Profile** (200):
```json
{
  "success": true,
  "message": "No profile found",
  "data": null
}
```

**Response Unauthorized** (401):
```json
{
  "success": false,
  "error": "Authentication required",
  "details": null
}
```

**Usage in Auth Flow**:
- Login page: Check if profile exists after authentication
- Signup page: Check if profile exists after registration
- Callback page: Determine redirect destination after OAuth
- Form page: Prevent duplicate profile creation
- Home page: Verify profile completion

---

#### PATCH /api/profile
**Purpose**: Create or update user profile

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "legal_first_name": "John",
  "legal_surname": "Doe",
  "alias_first_name": "Johnny",
  "alias_surname": "D",
  "country": "United Arab Emirates",
  "city": "Dubai"
}
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "data": {
    "user_id": "uuid",
    "legal_first_name": "John",
    "legal_surname": "Doe",
    "alias_first_name": "Johnny",
    "alias_surname": "D",
    "country": "United Arab Emirates",
    "city": "Dubai",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Response Unauthorized** (401):
```json
{
  "success": false,
  "error": "Authentication required",
  "details": null
}
```

**Response Error** (500):
```json
{
  "success": false,
  "error": "Failed to create profile",
  "details": "Error message"
}
```

**Usage in Auth Flow**:
- Form page: Create user profile after registration/OAuth

**Behavior**:
- If profile exists: Updates existing profile
- If profile doesn't exist: Creates new profile
- Automatically sets `user_id` from authenticated user
- Automatically updates `updated_at` timestamp

---

### Health Check API

#### GET /api/health
**Purpose**: Check API availability

**Authentication**: Not required

**Response Success** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Usage**: System monitoring and availability checks

---

### Authentication Flow API Summary

| Endpoint | Method | Auth Required | Used In Auth Flow | Purpose |
|----------|--------|---------------|-------------------|---------|
| `/api/profile` | GET | ✅ Yes | Login, Signup, Callback, Form, Home | Check if profile exists |
| `/api/profile` | PATCH | ✅ Yes | Form | Create/update profile |
| `/api/health` | GET | ❌ No | - | Health check |

---

## 5. Actionable Implementation Plan

### Goal
Implement robust authentication flow with proper routing, unauthorized access prevention, and profile completion requirements using Supabase Auth SDK and Next.js API Routes.

---

### Step 1: Set Up Supabase Client with Adaptive Storage
**File**: `/lib/supabase/client.ts`

```javascript
// Create AdaptiveStorage class that:
1. Switches between localStorage/sessionStorage based on user preference
2. Always uses localStorage for PKCE/OAuth keys
3. Provides getItem, setItem, removeItem methods

// Initialize Supabase client with:
- autoRefreshToken: true
- persistSession: true
- detectSessionInUrl: true
- storage: adaptiveStorage instance

// Export helper: setStoragePreference(keepLoggedIn)
```

**Why**: Enables "Keep me logged in" functionality while supporting OAuth flows.

---

### Step 2: Set Up Server-Side Utilities
**File**: `/lib/supabase/server.ts`

```javascript
// Create server utilities:
1. validateAuthToken(authHeader) - Validates Bearer token
2. getUserFromRequest(request) - Extracts user from request
3. successResponse(data, message) - Standard success format
4. errorResponse(error, details) - Standard error format
```

**Why**: Provides reusable authentication utilities for API routes.

---

### Step 3: Create Profile API Route
**File**: `/api/profile/route.ts`

```javascript
// GET handler:
1. Validate Bearer token using validateAuthToken()
2. Return 401 if invalid
3. Query user_profiles table for user's profile
4. Return profile data or null if doesn't exist

// PATCH handler:
1. Validate Bearer token
2. Return 401 if invalid
3. Check if profile exists
4. If exists: Update profile
5. If not: Create new profile
6. Return updated/created profile data
```

**Why**: Centralizes profile operations with authentication validation.

---

### Step 4: Implement Login Page with API Integration
**File**: `/app/(auth)/login/page.tsx`

```javascript
// On mount:
1. Check if user already logged in via supabase.auth.getSession()
2. If logged in:
   a. Get access token
   b. Call GET /api/profile with Bearer token
   c. Redirect based on profile existence

// On email/password login:
1. Set storage preference
2. Normalize email
3. Call supabase.auth.signInWithPassword()
4. Get access token from response
5. Call GET /api/profile with Bearer token
6. Redirect based on profile existence

// On OAuth login:
1. Set storage preference to true
2. Call supabase.auth.signInWithOAuth()
3. Redirect to callback page
```

**API Calls**: `GET /api/profile`

**Why**: Determines user flow based on profile completion status.

---

### Step 5: Implement Sign Up Page
**File**: `/app/(auth)/signup/page.tsx`

```javascript
// On mount:
- Check if already logged in via supabase.auth.getSession()
- If yes: Call GET /api/profile and redirect

// Form validation:
1. Password must have:
   - 8+ characters
   - 1 uppercase letter
   - 1 number
   - 1 special character
2. Real-time validation feedback

// On submit:
1. Normalize email
2. Call supabase.auth.signUp()
3. Handle two scenarios:
   - Email confirmation required → /otp
   - Auto-confirmed → /form

// OAuth sign up:
- Same as OAuth login
```

**API Calls**: `GET /api/profile` (on mount only)

**Why**: Creates new users with proper validation.

---

### Step 6: Create OAuth Callback Handler
**File**: `/app/(auth)/callback/page.tsx`

```javascript
// Main flow:
1. Get session via supabase.auth.getSession()
2. Extract access token
3. Set storage preference to true
4. Call checkProfileAndRedirect function

// checkProfileAndRedirect function:
1. Call GET /api/profile with Bearer token
2. Handle errors gracefully (non-blocking)
3. No profile → /form
4. Profile exists → /home

// Show loading during processing
// Show error only for genuine auth failures
```

**API Calls**: `GET /api/profile`

**Why**: Completes OAuth flow and routes based on profile status.

---

### Step 7: Build Profile Form Page
**File**: `/app/(auth)/form/page.tsx`

```javascript
// On mount:
1. Check session via supabase.auth.getSession()
2. Redirect to login if no session
3. Get access token
4. Call GET /api/profile
5. If profile exists → redirect to home

// Form fields:
- Required: firstName, surname, country, city
- Optional: aliasFirstName, aliasSurname

// Real-time validation:
- Button disabled until all required fields filled

// On submit:
1. Get access token from session
2. Call PATCH /api/profile with:
   - legal_first_name
   - legal_surname
   - alias_first_name
   - alias_surname
   - country
   - city
3. On success → redirect to /home

// Error handling:
- Show error message from API
- Allow retry
```

**API Calls**: 
- `GET /api/profile` (on mount)
- `PATCH /api/profile` (on submit)

**Why**: Collects required profile data with API validation.

---

### Step 8: Protect Home Page
**File**: `/app/(app)/page.tsx`

```javascript
// On mount:
1. Check session via supabase.auth.getSession()
2. Redirect to login if no session
3. Get access token
4. Call GET /api/profile
5. If no profile → redirect to form
6. Show home page

// All errors → redirect to login
```

**API Calls**: `GET /api/profile`

**Why**: Protects main app with profile completion verification.

---

### Step 9: Implement Keep Me Logged In
**Files**: All auth pages

```javascript
// Login page:
- Checkbox for "Keep me logged in"
- On submit: setStoragePreference(formData.keepLoggedIn)

// OAuth flows:
- Always set to true: setStoragePreference(true)

// AdaptiveStorage handles:
- keepLoggedIn = true → localStorage (persists)
- keepLoggedIn = false → sessionStorage (expires)
- PKCE keys → always localStorage
```

**Why**: Gives users control over session duration.

---

### Implementation Checklist

**Authentication Core**:
- ✅ AdaptiveStorage class with localStorage/sessionStorage switching
- ✅ PKCE key handling in localStorage
- ✅ Session persistence based on user preference
- ✅ Supabase client configuration

**API Infrastructure**:
- ✅ Server-side token validation utility
- ✅ Profile API routes (GET, PATCH)
- ✅ Standard response formats
- ✅ Error handling

**Routing & Access Control**:
- ✅ Login page with API integration
- ✅ Sign up page with validation
- ✅ OAuth callback handler with API calls
- ✅ Form page with API profile operations
- ✅ Protected home page with API checks

**User Experience**:
- ✅ Keep me logged in functionality
- ✅ Email normalization
- ✅ User-friendly error messages
- ✅ Loading states
- ✅ API-driven redirects

**Security**:
- ✅ Client-side session checks (Supabase)
- ✅ API route Bearer token validation
- ✅ Server-side authentication
- ✅ Database RLS policies
- ✅ Profile completion verification via API

---

### Testing Scenarios

**Scenario 1: New User Email Sign Up**
1. Visit root → redirected to login
2. Click "Sign up"
3. Enter email/password → redirected to OTP
4. Enter OTP → redirected to form
5. Complete form → calls `PATCH /api/profile`
6. Redirected to home → calls `GET /api/profile` (profile exists)

**Scenario 2: OAuth Sign Up**
1. Visit root → redirected to login
2. Click "Google" → OAuth flow
3. Authorize → redirected to callback
4. Callback → calls `GET /api/profile` (no profile)
5. Redirected to form
6. Complete form → calls `PATCH /api/profile`
7. Redirected to home

**Scenario 3: Returning User Login**
1. Visit login
2. Enter credentials
3. Login successful → calls `GET /api/profile`
4. Profile exists → redirected to home

**Scenario 4: Incomplete Profile**
1. User logged in but no profile
2. Navigate to home
3. Home calls `GET /api/profile` → returns null
4. Redirected to form

---

### Quick Reference: Auth Flow with API Calls

```
┌─────────────────┐
│   User visits   │
│   any page      │
└────────┬────────┘
         │
         ▼
  ┌──────────────────┐
  │ Has session?     │
  │ (Supabase check) │
  └──────┬───────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │         └─────► /login
    │
    ▼
┌──────────────────────┐
│ Call GET /api/profile│
│ with Bearer token    │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
  Profile       No Profile
  Exists        (null)
    │             │
    │             └─────► /form
    │                     │
    │                     ▼
    │              ┌──────────────────────┐
    │              │ Submit form          │
    │              │ PATCH /api/profile   │
    │              └──────────┬───────────┘
    │                         │
    └─────────────────────────┘
                  │
                  ▼
               /home
           (Main App)
```

---

### Key Takeaways

1. **Hybrid Architecture**: Supabase Auth SDK (client-side) + Next.js API Routes (server-side)
2. **API-Driven Flow**: All profile checks and operations go through `/api/profile`
3. **Multi-Layer Security**: 
   - Client session validation (Supabase)
   - API Bearer token validation
   - Database RLS policies
4. **Smart Routing**: Always route based on API profile check results
5. **Storage Strategy**: Adaptive storage supports both persistence modes
6. **Error Isolation**: API errors handled gracefully with user-friendly messages
7. **Field Names**: Use `legal_first_name` and `legal_surname` in API calls
8. **Bearer Token**: All API calls include `Authorization: Bearer <token>` header

---

## End of Analysis
This document provides complete understanding of authentication flow with API integration and actionable steps for implementation or modification.
