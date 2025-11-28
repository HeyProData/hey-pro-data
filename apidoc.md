# HeyProData API Documentation

Base URL: `http://localhost:8081`

## Authentication
Most endpoints require JWT authentication via cookie. Login first to get authentication token.

---

## 1. Authentication Controller (`/api/auth`)

### POST `/api/auth/login`
**Description:** User authentication - validates credentials and sets JWT cookie
**Request Body:**
```json
{
  "emailId": "user@example.com",
  "password": "password123"
}
```
**Response:** Login success message with userId

### POST `/api/auth/singup`
**Description:** User registration - creates new user account
**Request Body:**
```json
{
  "emailId": "user@example.com",
  "password": "password123"
}
```
**Response:** Created userId

---

## 2. User Controller (`/api/users`)

### GET `/api/users/getProfile`
**Description:** Get current user's complete profile (authenticated)
**Request Body:** None
**Response:** Complete user profile with private data

### POST `/api/users/profile`
**Description:** Create user profile with skills, credits, etc. (authenticated)
**Request Body:**
```json
{
  "firstName": "John",
  "surName": "Doe",
  "alias": "JohnD",
  "nationality": "US",
  "dob": "1990-01-01",
  "location": "New York",
  "operateNationwide": true,
  "availableToTravel": true,
  "headline": "Film Director",
  "about": "Experienced filmmaker...",
  "whatsappNumber": "+1234567890",
  "countryCode": "+1",
  "agreeTerms": true,
  "readPrivacyPolicy": true,
  "freelancerProfile": {
    "skills": [
      {
        "skillId": 1,
        "levelId": 3
      }
    ]
  },
  "employeeProfile": {
    "skills": [
      {
        "companyName": "ABC Studios",
        "empSkillId": 2,
        "empLevelId": 4
      }
    ]
  },
  "businessProfile": {
    "businessName": "John's Productions",
    "businessType": "Production Company",
    "skillsetDescription": "Full service production"
  },
  "credits": [
    {
      "date": "2023-01-01",
      "projectName": "Sample Movie",
      "productionCompany": "XYZ Films",
      "description": "Director"
    }
  ],
  "languages": [
    {
      "languague": "English"
    }
  ],
  "roles": [
    {
      "skillId": 5
    }
  ],
  "workStatuses": [
    {
      "statusId": 1
    }
  ]
}
```

### GET `/api/users/public/{userId}`
**Description:** Get other user's public profile (verified users only)
**Request Body:** None
**Response:** Public user profile without private data

### GET `/api/users/search?query={searchTerm}`
**Description:** Search users by name/email (verified users only)
**Request Body:** None
**Response:** List of public user profiles

---

## 8. Visa Controller (`/api/visa`)

### POST `/api/visa/request`
**Description:** Request access to view another user's visa (authenticated)
**Request Body:**
```json
{
  "targetUserId": 123
}
```

### PUT `/api/visa/approve`
**Description:** Approve/deny visa access request (authenticated)
**Request Body:**
```json
{
  "requestId": 456,
  "approved": true,
  "notes": "Approved for project collaboration"
}
```

### GET `/api/visa/requests/sent`
**Description:** Get visa requests sent by user (authenticated)
**Request Body:** None

### GET `/api/visa/requests/received`
**Description:** Get visa requests received by user (authenticated)
**Request Body:** None

### GET `/api/visa/check-access/{targetUserId}`
**Description:** Check if user has visa access to target user (authenticated)
**Request Body:** None

### GET `/api/visa/details/{targetUserId}`
**Description:** Get visa details if access granted (authenticated)
**Request Body:** None

---

## 9. Common Controller (`/api/common`)

### GET `/api/common/designations`
**Description:** Get all job designations (public)
**Request Body:** None

### GET `/api/common/roles`
**Description:** Get all film industry roles (public)
**Request Body:** None

### GET `/api/common/proficiency-levels`
**Description:** Get all proficiency levels (public)
**Request Body:** None

### GET `/api/common/profile-types`
**Description:** Get all profile types (public)
**Request Body:** None

### GET `/api/common/skills`
**Description:** Get all technical skills (public)
**Request Body:** None

### GET `/api/common/work-statuses`
**Description:** Get all work statuses (public)
**Request Body:** None

## Notes

1. **Authentication:** Most endpoints require JWT authentication via HTTP-only cookie set during login
2. **File Uploads:** Resume upload uses multipart/form-data, max 3MB per application.properties
3. **Pagination:** Job and project listings support cursor-based pagination
4. **Verification:** Public user endpoints only show verified users
5. **Permissions:** Project owners and delegates have different permission levels
6. **Soft Deletes:** Jobs and projects use soft deletion (marked as deleted, not removed)
7. **CORS:** Configured to allow all origins, methods, and headers