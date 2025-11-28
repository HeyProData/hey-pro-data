# Authentication Flow - TypeScript Implementation Guide
## HeyProData Project

> **AI-Friendly Actionable Checklist**  
> This guide extracts routing logic and flow from AUTH_FLOW_ANALYSIS.md and adapts it for TypeScript implementation in the HeyProData Next.js 15 project.

---

## Core Architecture

**Tech Stack**: Next.js 15 (App Router) + TypeScript + Supabase Auth + Bearer Token API Routes

**Key Files**:
- `/lib/supabase/client.ts` - Client-side Supabase client with adaptive storage
- `/lib/supabase/server.ts` - Server-side utilities for token validation
- `/contexts/AuthContext.tsx` - React Context for auth state management
- `/middleware.ts` - Next.js middleware for route protection

---

## Table of Contents
1. [Routing Logic Flow](#1-routing-logic-flow)
2. [Client-Side Authentication Patterns](#2-client-side-authentication-patterns)
3. [API Integration Patterns](#3-api-integration-patterns)
4. [Middleware Protection Logic](#4-middleware-protection-logic)
5. [Form Validation & Submission Logic](#5-form-validation--submission-logic)

---

## 1. Routing Logic Flow

### Root Page Routing Logic (`/app/page.tsx`)

```typescript
// Import required modules
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Routing flow logic
const checkAuthAndRoute = async () => {
  // Step 1: Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Step 2: No session → redirect to login
  if (!session) {
    router.push('/login');
    return;
  }
  
  // Step 3: Has session → check profile
  const token = session.access_token;
  
  const response = await fetch('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const profileData = await response.json();
  
  // Step 4: Route based on profile existence
  if (profileData.success && profileData.data) {
    router.push('/home');  // Profile exists
  } else {
    router.push('/form');  // No profile
  }
};
```

**Logic Flow**:
1. Check session via `supabase.auth.getSession()`
2. No session → `/login`
3. Has session → Call `GET /api/profile` with Bearer token
4. Profile exists → `/home`
5. No profile → `/form`

---

### Login Page Routing Logic (`/app/(auth)/login/page.tsx`)

#### On Page Load
```typescript
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

useEffect(() => {
  const checkExistingSession = async () => {
    // Get existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;  // Not logged in, show login form
    
    // User already authenticated, check profile
    const token = session.access_token;
    
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    // Route based on profile
    if (data.success && data.data) {
      router.push('/home');
    } else {
      router.push('/form');
    }
  };
  
  checkExistingSession();
}, [router]);
```

#### On Form Submit (Email/Password)
```typescript
import { setStoragePreference } from '@/lib/supabase/client';

const handleLogin = async (formData: LoginFormData) => {
  // Step 1: Set storage preference for "Keep me logged in"
  setStoragePreference(formData.keepLoggedIn);
  
  // Step 2: Normalize email to lowercase
  const email = formData.email.toLowerCase();
  
  // Step 3: Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: formData.password
  });
  
  if (error) {
    // Handle error
    return;
  }
  
  // Step 4: Get access token
  const token = data.session?.access_token;
  
  // Step 5: Check profile via API
  const response = await fetch('/api/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const profileData = await response.json();
  
  // Step 6: Route based on profile
  if (profileData.success && profileData.data) {
    router.push('/home');
  } else {
    router.push('/form');
  }
};
```

#### OAuth Login Logic
```typescript
const handleOAuthLogin = async (provider: 'google' | 'github') => {
  // Always keep OAuth users logged in
  setStoragePreference(true);
  
  // Initiate OAuth flow
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/callback`
    }
  });
  
  // OAuth redirects to callback page
};
```

**Logic Flow**:
- On mount: Check existing session → route to `/home` or `/form` if already logged in
- On submit: Sign in → get token → check profile → route accordingly
- OAuth: Set preference → initiate OAuth → redirect to `/callback`

---

### Sign Up Page Routing Logic (`/app/(auth)/signup/page.tsx`)

#### On Page Load
```typescript
useEffect(() => {
  const checkExistingSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;
    
    // Already logged in, check profile
    const token = session.access_token;
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      router.push('/home');
    } else {
      router.push('/form');
    }
  };
  
  checkExistingSession();
}, [router]);
```

#### On Form Submit
```typescript
const handleSignUp = async (formData: SignUpFormData) => {
  // Step 1: Normalize email
  const email = formData.email.toLowerCase();
  
  // Step 2: Sign up with Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.password
  });
  
  if (error) {
    // Handle error
    return;
  }
  
  // Step 3: Handle two scenarios
  if (data.user && !data.session) {
    // Email confirmation required
    router.push('/otp');
  } else if (data.session) {
    // Auto-confirmed, redirect to profile form
    router.push('/form');
  }
};
```

**Logic Flow**:
1. On mount: Check if already logged in → route to `/home` or `/form`
2. On submit: Sign up → handle OTP or auto-confirm scenario
3. Email confirmation enabled → `/otp`
4. Auto-confirmed → `/form`

---

### Callback Page Routing Logic (`/app/(auth)/callback/page.tsx`)

```typescript
import { supabase, setStoragePreference } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

useEffect(() => {
  const handleCallback = async () => {
    // Step 1: Get session from URL (OAuth callback)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Auth failed, redirect to login
      router.push('/login');
      return;
    }
    
    // Step 2: OAuth users stay logged in
    setStoragePreference(true);
    
    // Step 3: Check profile and redirect
    await checkProfileAndRedirect(session.access_token);
  };
  
  const checkProfileAndRedirect = async (token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      // Non-blocking error handling
      if (!data.success || !data.data) {
        // No profile, redirect to form
        router.push('/form');
      } else {
        // Profile exists, redirect to home
        router.push('/home');
      }
    } catch (error) {
      // Profile check errors treated as "no profile"
      router.push('/form');
    }
  };
  
  handleCallback();
}, [router]);
```

**Logic Flow**:
1. Extract session from OAuth callback
2. Set storage preference to `true` (keep logged in)
3. Call `GET /api/profile` with Bearer token
4. No profile → `/form`
5. Profile exists → `/home`
6. Errors → default to `/form`

---

### Form Page Routing Logic (`/app/(auth)/form/page.tsx`)

#### On Mount
```typescript
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

useEffect(() => {
  const checkAuthAndProfile = async () => {
    // Step 1: Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }
    
    // Step 2: Check if profile already exists
    const token = session.access_token;
    
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // Profile already exists, redirect to home
      router.push('/home');
    }
    // Otherwise, show form
  };
  
  checkAuthAndProfile();
}, [router]);
```

**Logic Flow**:
1. Check session via `supabase.auth.getSession()`
2. No session → `/login`
3. Has session → Call `GET /api/profile`
4. Profile exists → `/home`
5. No profile → Show form

---

### Home Page Routing Logic (`/app/(app)/page.tsx`)

```typescript
useEffect(() => {
  const protectRoute = async () => {
    // Step 1: Check session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Not authenticated
      router.push('/login');
      return;
    }
    
    // Step 2: Verify profile exists
    const token = session.access_token;
    
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      // No profile, redirect to form
      router.push('/form');
      return;
    }
    
    // All checks passed, show home page
  };
  
  protectRoute();
}, [router]);
```

**Logic Flow**:
1. Check session
2. No session → `/login`
3. Has session → Check profile via API
4. No profile → `/form`
5. Has profile → Show home page

---

## 2. Client-Side Authentication Patterns

### Session Check Pattern
**Use in**: All protected pages

```typescript
import { supabase } from '@/lib/supabase/client';

// Pattern for checking if user is authenticated
const checkSession = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};
```

### Get Access Token Pattern
```typescript
import { getAccessToken } from '@/lib/supabase/client';

// Get access token for API calls
const token = await getAccessToken();

if (!token) {
  // Not authenticated, redirect to login
  router.push('/login');
  return;
}

// Use token in API call
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Storage Preference Pattern
```typescript
import { setStoragePreference } from '@/lib/supabase/client';

// Keep me logged in checkbox
const handleKeepLoggedInChange = (keepLoggedIn: boolean) => {
  setStoragePreference(keepLoggedIn);
};

// Usage in login form
setStoragePreference(formData.keepLoggedIn);  // true = localStorage, false = sessionStorage

// Usage in OAuth (always persistent)
setStoragePreference(true);
```

### Email Normalization Pattern
```typescript
// Always normalize email to lowercase before auth operations
const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Usage
const { data, error } = await supabase.auth.signInWithPassword({
  email: normalizeEmail(formData.email),
  password: formData.password
});
```

---

## 3. API Integration Patterns

### Profile Check API Call Pattern
**Endpoint**: `GET /api/profile`

```typescript
// Check if user profile exists
const checkProfile = async (token: string): Promise<{ exists: boolean, data: any }> => {
  const response = await fetch('/api/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  
  return {
    exists: result.success && !!result.data,
    data: result.data
  };
};

// Usage
const token = await getAccessToken();
const { exists, data } = await checkProfile(token);

if (exists) {
  router.push('/home');
} else {
  router.push('/form');
}
```

### Profile Creation/Update API Call Pattern
**Endpoint**: `PATCH /api/profile`

```typescript
interface ProfileFormData {
  firstName: string;
  surname: string;
  aliasFirstName?: string;
  aliasSurname?: string;
  country: string;
  city: string;
}

const createProfile = async (token: string, formData: ProfileFormData) => {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      legal_first_name: formData.firstName.trim(),
      legal_surname: formData.surname.trim(),
      alias_first_name: formData.aliasFirstName?.trim() || null,
      alias_surname: formData.aliasSurname?.trim() || null,
      country: formData.country,
      city: formData.city.trim()
    })
  });
  
  return await response.json();
};

// Usage in form submission
const token = await getAccessToken();
const result = await createProfile(token, formData);

if (result.success) {
  router.push('/home');
} else {
  // Show error
  setError(result.error);
}
```

### API Response Type Definitions
```typescript
// Success response type
interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

// Error response type
interface ApiErrorResponse {
  success: false;
  error: string;
  details: any;
}

// Profile data type
interface ProfileData {
  user_id: string;
  legal_first_name: string;
  legal_surname: string;
  alias_first_name?: string | null;
  alias_surname?: string | null;
  country: string;
  city: string;
  created_at: string;
  updated_at: string;
}

// Combined response type
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Type guard
const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
  return response.success === true;
};
```

---

## 4. Middleware Protection Logic

### Middleware Route Classification

**File**: `/middleware.ts`

```typescript
// Route categories
const publicRoutes = [
  '/login',
  '/signup', 
  '/otp',
  '/callback',
  '/forget-password',
  '/reset-password',
  '/form',
];

const authRoutes = ['/login', '/signup'];  // Redirect authenticated users away

const protectedRoutes = [
  '/home',
  '/profile',
  '/explore',
  '/gigs',
  '/collab',
  '/whatson',
  '/notifications'
];
```

### Middleware Logic Flow
```typescript
// Step 1: Create Supabase client for middleware
const supabase = createServerClient(/* ... */);

// Step 2: Get session (auto-refreshes token)
const { data: { session } } = await supabase.auth.getSession();
const isAuthenticated = !!session;

// Step 3: Check route type
const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

// Step 4: Apply routing logic
if (isAuthenticated && isAuthRoute) {
  // Redirect authenticated users away from login/signup
  return NextResponse.redirect(new URL('/home', request.url));
}

if (!isAuthenticated && isProtectedRoute) {
  // Redirect unauthenticated users to login
  const redirectUrl = new URL('/login', request.url);
  redirectUrl.searchParams.set('redirect', pathname);  // Save redirect target
  return NextResponse.redirect(redirectUrl);
}
```

**Logic Flow**:
1. Get session from middleware
2. Authenticated + auth route (login/signup) → redirect to `/home`
3. Unauthenticated + protected route → redirect to `/login` with redirect parameter
4. All other cases → allow through

---

## 5. Form Validation & Submission Logic

### Form State Management Pattern
```typescript
import { useState } from 'react';

interface FormData {
  firstName: string;
  surname: string;
  aliasFirstName: string;
  aliasSurname: string;
  country: string;
  city: string;
}

const [formData, setFormData] = useState<FormData>({
  firstName: '',
  surname: '',
  aliasFirstName: '',
  aliasSurname: '',
  country: '',
  city: ''
});

const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string>('');
```

### Form Validation Logic
```typescript
// Real-time validation
const isFormValid = (): boolean => {
  return (
    formData.firstName.trim() !== '' &&
    formData.surname.trim() !== '' &&
    formData.country !== '' &&
    formData.city.trim() !== ''
  );
};

// Button state
<button 
  disabled={!isFormValid() || loading}
  onClick={handleSubmit}
>
  {loading ? 'Creating profile...' : 'Create your profile'}
</button>
```

### Form Submission Flow
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isFormValid()) return;
  
  setLoading(true);
  setError('');
  
  try {
    // Step 1: Get access token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Step 2: Submit to API
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
    });
    
    const data = await response.json();
    
    // Step 3: Handle response
    if (data.success) {
      router.push('/home');
    } else {
      setError(data.error || 'Failed to create profile');
    }
  } catch (err) {
    setError('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Field Mapping Reference
```typescript
// Form field to API payload to database column mapping
const fieldMapping = {
  firstName: {
    apiKey: 'legal_first_name',
    dbColumn: 'legal_first_name',
    required: true
  },
  surname: {
    apiKey: 'legal_surname',
    dbColumn: 'legal_surname',
    required: true
  },
  aliasFirstName: {
    apiKey: 'alias_first_name',
    dbColumn: 'alias_first_name',
    required: false
  },
  aliasSurname: {
    apiKey: 'alias_surname',
    dbColumn: 'alias_surname',
    required: false
  },
  country: {
    apiKey: 'country',
    dbColumn: 'country',
    required: true
  },
  city: {
    apiKey: 'city',
    dbColumn: 'city',
    required: true
  }
};
```

---

## Routing Flow Diagram

```
┌─────────────────┐
│   User visits   │
│   any page      │
└────────┬────────┘
         │
         ▼
  ┌──────────────────┐
  │ Has session?     │
  │ supabase.auth    │
  │ .getSession()    │
  └──────┬───────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │         └─────► /login
    │
    ▼
┌────────────────────────┐
│ GET /api/profile       │
│ Authorization: Bearer  │
└──────────┬─────────────┘
           │
    ┌──────┴──────┐
    │             │
  Profile       No Profile
  Exists        (data: null)
    │             │
    │             └─────► /form
    │                     │
    │                     ▼
    │              ┌─────────────────┐
    │              │ Submit form     │
    │              │ PATCH /api/     │
    │              │ profile         │
    │              └──────┬──────────┘
    │                     │
    └─────────────────────┘
                  │
                  ▼
               /home
```

---

## Key Implementation Points

### 1. Session Management
- Use `supabase.auth.getSession()` for session checks
- Use `getAccessToken()` helper for Bearer tokens
- Session storage controlled by `setStoragePreference()`

### 2. API Integration
- All protected API calls require `Authorization: Bearer <token>` header
- Profile operations use `/api/profile` endpoint (GET, PATCH)
- API returns standardized response format

### 3. Routing Decisions
- Based on: Session existence + Profile existence
- Session check → immediate (client-side Supabase)
- Profile check → via API call (server-side validation)

### 4. Storage Strategy
- `localStorage`: Persistent sessions (keepLoggedIn = true)
- `sessionStorage`: Session-only (keepLoggedIn = false)
- PKCE keys: Always `localStorage` (OAuth requirement)

### 5. TypeScript Types
- Import types from `@supabase/supabase-js`
- Define interface for form data
- Use type guards for API responses

### 6. Error Handling
- Profile check errors → treat as "no profile"
- Auth errors → redirect to login
- API errors → display user-friendly messages

---

## Testing Checklist

### Scenario 1: New User Sign Up
- [ ] Visit root → redirect to `/login`
- [ ] Navigate to `/signup`
- [ ] Submit form → Supabase `signUp()`
- [ ] Redirect to `/otp` (email confirmation) or `/form` (auto-confirm)
- [ ] Complete form → `PATCH /api/profile`
- [ ] Redirect to `/home` → `GET /api/profile` confirms profile exists

### Scenario 2: OAuth Sign Up
- [ ] Click OAuth provider on login/signup
- [ ] Authorize on provider site
- [ ] Redirect to `/callback`
- [ ] Callback calls `GET /api/profile` → no profile
- [ ] Redirect to `/form`
- [ ] Complete form → `PATCH /api/profile`
- [ ] Redirect to `/home`

### Scenario 3: Returning User Login
- [ ] Visit `/login`
- [ ] Submit credentials → Supabase `signInWithPassword()`
- [ ] Call `GET /api/profile` → profile exists
- [ ] Redirect to `/home`

### Scenario 4: Protected Route Access
- [ ] Unauthenticated user visits `/home`
- [ ] Middleware catches → redirect to `/login`
- [ ] Login successful → redirect back to `/home`

### Scenario 5: Form Page Guards
- [ ] Authenticated user with profile visits `/form`
- [ ] Page checks `GET /api/profile` → profile exists
- [ ] Redirect to `/home` (prevent duplicate)

---

## End of Guide

This TypeScript implementation guide provides the exact routing logic and flow patterns used in the HeyProData authentication system, adapted for TypeScript syntax and relevant to this specific Next.js 15 project structure.
