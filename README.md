# Hey Pro Data

**Hey Pro Data** is a professional networking and marketplace platform designed to connect individuals and teams within the **film, media, and creative industries**. It enables professionals to discover, collaborate, and hire one another for various creative projects.

## 🚀 Project Overview

This project is a **Next.js 15** web application built with **React 19**, **Tailwind CSS**, and **Shadcn UI**. It features a pixel-perfect authentication and onboarding system, user profile management, and a dashboard.

### Key Features

*   **Professional Networking**: Connect with artists, producers, filmmakers, and crew.
*   **User Authentication**:
    *   Login & Sign In pages with real-time validation.
    *   OTP Verification flow.
    *   Mock authentication ready for backend integration.
*   **Onboarding Flow**:
    *   Multi-step process with dynamic progress tracking.
    *   Steps: Name -> Location -> Username (Alias) -> Profile Photo.
    *   Smooth animations and gradient designs.
*   **Dashboard**: User dashboard to manage profile and view status.
*   **Responsive Design**: Optimized for various screen sizes.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
*   **Icons**: [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler.io/)
*   **State Management**: React Hooks & Context
*   **Form Handling**: React Hook Form (implied or custom validation)

## 📂 Project Structure

The project root is `web-ui/` and is organized as follows:

```text
web-ui/
├── app/
│   ├── (app)/
│   │   ├── (collab)/
│   │   │   └── collab/
│   │   │       ├── page.tsx
│   │   │       └── manage-collab/
│   │   ├── (explore)/
│   │   │   ├── template.tsx
│   │   │   └── explore/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/
│   │   ├── (gigs)/
│   │   │   ├── components/
│   │   │   │   ├── applygigs.tsx
│   │   │   │   ├── gig-details.tsx
│   │   │   │   ├── gigs-header.tsx
│   │   │   │   ├── recommend-gigs.tsx
│   │   │   │   └── manage-gigs/
│   │   │   └── gigs/
│   │   │       ├── page.tsx
│   │   │       ├── [slug]/
│   │   │       └── manage-gigs/
│   │   │           └── add-new/
│   │   │               └── page.tsx
│   │   ├── (slate-group)/
│   │   │   ├── template.tsx
│   │   │   └── slate/
│   │   │       └── page.tsx
│   │   ├── (whatson)/
│   │   │   ├── components/
│   │   │   │   ├── EditWhatsOnForm.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── main-content.tsx
│   │   │   │   └── rsvp.tsx
│   │   │   └── whats-on/
│   │   │       └── ... (events pages)
│   │   ├── create/
│   │   │   ├── page.tsx
│   │   │   ├── gig/
│   │   │   └── project/
│   │   ├── jobs/
│   │   │   ├── page.tsx
│   │   │   ├── template.tsx
│   │   │   ├── (jobs)/
│   │   │   ├── [id]/
│   │   │   └── components/
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   ├── page.tsx           # Main app page (Explore)
│   │   └── template.tsx       # App-level template
│   ├── (auth)/
│   │   ├── forget-password/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   ├── action.ts
│   │   │   └── page.tsx
│   │   └── signup/
│   │       ├── action.ts
│   │       └── page.tsx
│   ├── (chat)/
│   │   ├── layout.tsx
│   │   ├── template.tsx
│   │   └── inbox/
│   │       ├── page.tsx            # Chat inbox
│   │       ├── c/
│   │       │   └── [id]/
│   │       │       └── page.tsx    # Direct chats
│   │       └── g/
│   │           └── [id]/
│   │               └── page.tsx    # Group chats
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   ├── manifest.json
│   └── not-found.tsx
├── components/
│   ├── Providers/
│   │   └── index.tsx
│   ├── ScrollHandler.tsx
│   ├── comment/
│   │   └── comment.tsx
│   ├── header/
│   │   └── index.tsx
│   ├── icons.tsx
│   ├── jobs/
│   │   └── JobList.tsx
│   ├── logo.tsx
│   ├── modules/
│   │   ├── common/
│   │   │   └── projectCard.tsx
│   │   └── pages/
│   │       └── explore-page.tsx
│   ├── profile/
│   │   ├── Card.tsx
│   │   └── personalDetails.tsx
│   └── ui/                       # shadcn/ui components
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── navigation-menu.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── data/
│   ├── chatMessage.ts
│   ├── collabPosts.ts
│   ├── exploreProfiles.ts
│   ├── gigs.ts
│   ├── profile.ts
│   ├── recommendUsers.ts
│   └── whatsOnEvents.ts
├── hook/
│   └── use-mobile.ts
├── lib/
│   ├── apiCalling.ts
│   ├── axios.ts
│   ├── countries.ts
│   └── utils.ts
├── public/
│   ├── assets/
│   │   └── icons/
│   ├── logo/
│   ├── bg.jpg
│   ├── credit.png
│   ├── image.png, image (1-4).png
│   ├── slate.png
│   └── whats-on.png
├── tests/
│   └── __init__.py
├── types/
│   └── index.ts
├── env.sample
├── eslint.config.mjs
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── test_result.md
├── tsconfig.json
└── yarn.lock

## 🚦 Getting Started

### Prerequisites

Ensure you have **Node.js** installed. This project uses **Yarn** as the package manager.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install dependencies:
    ```bash
    yarn install
    ```

### Running the App

Run the development server:

```bash
yarn run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To build the application for production:

```bash
yarn run build
```

## 🔐 Authentication & Onboarding Flow

The application implements a secure and user-friendly authentication flow:

1.  **Login/Sign In**: Users enter credentials. Real-time validation ensures password strength.
2.  **OTP Verification**: A 5-digit OTP is required for verification.
3.  **Onboarding**: New users are guided through a 4-step process:
    *   **Name**: Legal first and last name (25% progress).
    *   **Location**: Country, State, and City selection (50% progress).
    *   **Username**: Optional alias selection (75% progress).
    *   **Profile Photo**: Upload a profile picture (100% progress).
4.  **Dashboard**: Access the main platform upon completion.

## 🔌 Backend Integration

The application is configured to connect to a backend server (default: `http://localhost:8081`).

### API Endpoints

*   `POST /api/v1/auth/login` - User login
*   `POST /api/v1/auth/register` - User registration
*   `POST /api/v1/auth/logout` - User logout
*   `GET /api/v1/users/current` - Get current user profile
*   `PUT /api/v1/users/profile` - Update user profile
*   `POST /api/v1/users/profile-photo` - Upload profile photo

*Note: Some authentication features might currently use mock implementations for demonstration purposes.*

## 🎨 Design System

The project follows a specific design system:
*   **Primary Color**: `#FA6E80` (Coral/Pink)
*   **Gradients**: Custom conic and linear gradients for backgrounds and progress bars.
*   **Typography**: Clean, modern sans-serif fonts.

---

For more detailed documentation on the onboarding flow, refer to `ONBOARDING_FLOW.md`.
