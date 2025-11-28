# Google OAuth Setup Guide

This guide explains how to configure Google OAuth authentication for HeyProData.

## Prerequisites

- Supabase project configured
- Google Cloud Console project created
- Google OAuth credentials (Client ID and Client Secret)

## Setup Steps

### 1. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   
   For this project:
   ```
   https://kvidydsfnnrathhpuxye.supabase.co/auth/v1/callback
   ```

6. Click **Save**

### 2. Configure Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle **Enable Google Provider** to ON
6. Enter your Google OAuth credentials:
   - **Client ID**: [Your Google Client ID]
   - **Client Secret**: [Your Google Client Secret]
7. Click **Save**

### 3. Application Redirect URLs

The application is already configured with the correct redirect URLs:

**Local Development:**
- Redirect URL: `http://localhost:3000/callback`
- This is automatically handled by the code: `${window.location.origin}/callback`

**Production:**
- Redirect URL: `https://[your-domain.com]/callback`
- Update in `.env.local` or environment variables

## Authentication Flow

```
User clicks "Sign in with Google"
        ↓
Google OAuth consent screen
        ↓
User authorizes application
        ↓
Google redirects to Supabase callback URL
        ↓
Supabase processes OAuth response
        ↓
Supabase redirects to app callback URL (http://localhost:3000/callback)
        ↓
App checks if user profile exists
        ↓
Redirect to /home (profile exists) OR /form (no profile)
```

## Environment Variables

The following environment variables are configured in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kvidydsfnnrathhpuxye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Anon Key]

# Google OAuth Credentials (for reference)
GOOGLE_CLIENT_ID=[Your Client ID]
GOOGLE_CLIENT_SECRET=[Your Client Secret]

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Note:** The Google OAuth credentials in `.env.local` are for reference only. The actual OAuth flow is managed by Supabase using the credentials configured in the Supabase Dashboard.

## Testing Authentication

### Email/Password Sign Up
1. Navigate to: `http://localhost:3000/signup`
2. Enter email and password
3. Check email for OTP code
4. Enter OTP code
5. Complete profile form
6. Redirected to home page

### Google OAuth Sign Up/Sign In
1. Navigate to: `http://localhost:3000/login`
2. Click "Sign in with Google" button
3. Complete Google OAuth consent
4. Automatically redirected to callback
5. If first time: Complete profile form
6. If returning user: Redirected to home page

### Keep Me Logged In
- **Checked**: Session persists after browser close (localStorage)
- **Unchecked**: Session expires when browser closes (sessionStorage)

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI in Google Cloud Console doesn't match Supabase callback URL
- **Solution**: Add `https://kvidydsfnnrathhpuxye.supabase.co/auth/v1/callback` to authorized redirect URIs

### Error: "Invalid authentication"
- **Cause**: Google OAuth not enabled in Supabase or wrong credentials
- **Solution**: Verify credentials in Supabase Dashboard under Authentication → Providers → Google

### Error: "Authentication failed"
- **Cause**: Network issues or expired session
- **Solution**: Clear browser cache, check console for errors

### Profile Not Created
- **Cause**: User completed OAuth but didn't fill profile form
- **Solution**: Redirect to `/form` to complete profile

## File Locations

- **Supabase Client**: `/lib/supabase/client.ts`
- **Login Page**: `/app/(auth)/login/page.tsx`
- **Signup Page**: `/app/(auth)/signup/page.tsx`
- **Callback Handler**: `/app/(auth)/callback/page.tsx`
- **Profile Form**: `/app/(auth)/form/page.tsx`
- **Environment**: `/.env.local` (not in version control)

## Security Notes

1. **Never commit `.env.local`** to version control
2. Google OAuth credentials are stored in Supabase Dashboard (secure)
3. Client ID and Secret in `.env.local` are for reference only
4. Actual OAuth flow is handled by Supabase Auth
5. RLS policies ensure data security at database level

## Support

For issues with:
- **Google OAuth setup**: Check Google Cloud Console documentation
- **Supabase configuration**: Check Supabase Auth documentation
- **Application errors**: Check browser console and server logs
