# HeyProData : Project Overview

**Hey Pro Data** is a **professional networking and marketplace platform** designed to connect individuals and teams within the **film, media, and creative industries**.
The platform enables **artists, producers, filmmakers, actors, crew members, and production professionals** to discover, collaborate, and hire one another for various creative projects — similar in concept to Upwork, but specialized for the entertainment and production ecosystem.

Users can:

- Build and showcase their professional profiles and portfolios.
- Post and find projects, gigs, and production opportunities.
- Communicate directly with potential collaborators.
- Manage contracts, payments, and reviews securely through the platform.

## User Profile Management

A React-based user profile management application with authentication and onboarding flow.

## Features

- User authentication (login/registration)
- User profile management
- Onboarding flow for new users
- Profile photo upload
- Username management
- Backend integration with JWT authentication

## Backend Integration

The application is configured to connect to a backend server running at `http://localhost:8081`.

### API Endpoints Used

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/users/current` - Get current user profile
- `PUT /api/v1/users/profile` - Update user profile
- `PUT /api/v1/users/username` - Update username
- `POST /api/v1/users/profile-photo` - Upload profile photo

## Authentication Flow

1. **Login/Registration**: Users can login with email/password or register a new account
2. **Profile Completion**: New users go through an onboarding flow:
   - Name entry (first name, last name)
   - Username selection
   - Profile photo upload (optional)
3. **Dashboard**: Authenticated users with complete profiles access the main dashboard

## Authentication Failure Handling

- Authentication failures redirect users to the login page
- Invalid tokens or expired sessions automatically log users out
- Error messages are displayed for failed login attempts

## Available Scripts

### `yarn run dev`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `yarn run build`

Builds the app for production to the `build` folder.

### `yarn test`

Launches the test runner in interactive watch mode.

## Project Structure

```
HeyProData/
├── app/
│   ├── (app)/
│   │   ├── gig/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx    # Dynamic route for gig details
│   │   ├── job/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx    # Dynamic route for job details
│   │   ├── profile/
│   │   │   ├── page.tsx        # User profile page
│   │   ├── page.tsx            # Home page or Explore page
│   │   ├── layout.tsx          # Main layout file
│   │   ├── loading.tsx         # Loading state component
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx        # Login page
│   │   ├── register/
│   │   │   ├── page.tsx        # Registration page
│   │   ├── forgot-password/
│   │   │   ├── page.tsx        # Forgot password page
│   ├── favicon.ico             # Favicon
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── not-found.tsx           # 404 Not Found page
├── components/
│   ├── header/                 # Header component
│   ├── footer/                 # Footer component
│   ├── modules/                # Reusable modules
│   ├── ui/                     # UI components (buttons, inputs, etc.)
├── data/                       # Dummy data for testing
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions and API calls
├── public/                     # Public assets (images, fonts, etc.)


```

## Notes

- OTP verification has been removed from the authentication flow
- Social authentication (Google/Apple) is prepared but not yet implemented
- The application uses JWT cookies for authentication
- All API requests include credentials for cookie-based authentication
- The project is built with Next.js 15 using the App Router and TypeScript
