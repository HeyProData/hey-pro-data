# Profile Database Schema Diagram

## Complete Schema Overview

This diagram shows all tables related to the profile feature and their relationships.

```
┌───────────────────────────────────────────────────────┐
│                   auth.users (Supabase Auth)                │
│  ────────────────────────────────────────────────  │
│  • id (UUID, PK)                                          │
│  • email                                                  │
│  • created_at                                             │
└───────────────────────────────────────────────────────┘
                           │
                           │ (Foreign Key)
                           │
        ┌───────────────┼───────────────────────────┐
        │               │                              │
        │               │                              │
        │               │                              │
        │               │                              │
┌───────┴───────────────────────────────────────────┐  │  │
│            user_profiles (CORE TABLE)              │  │  │
│  ────────────────────────────────────────────  │  │  │
│  • user_id (UUID, PK, FK)                         │  │  │
│  • legal_first_name                               │  │  │
│  • legal_surname                                  │  │  │
│  • alias_first_name                               │  │  │
│  • alias_surname                                  │  │  │
│  • phone                                          │  │  │
│  • email ⭐ NEW                                    │  │  │
│  • country_code ⭐ NEW                             │  │  │
│  • bio                                            │  │  │
│  • profile_photo_url                              │  │  │
│  • banner_url                                     │  │  │
│  • country                                        │  │  │
│  • city                                           │  │  │
│  • availability ⭐ NEW (Available/Not Available)  │  │  │
│  • profile_completion_percentage ⭐ NEW (0-100)   │  │  │
│  • is_profile_complete (Boolean)                  │  │  │
│  • updated_at ⭐ NEW                               │  │  │
└─────────────────────────────────────────────────┘  │  │
                                                     │  │
                                                     │  │
┌──────────────── NEW TABLES ─────────────────┐  │  │
│                                                   │  │  │
│  1️⃣ user_links                                   │  │  │
│  ─────────────────────────────────────────── │  │  │
│  • id (UUID, PK)                                │──┘  │
│  • user_id (FK)                                 │     │
│  • label (LinkedIn, Portfolio, etc.)          │     │
│  • url                                          │     │
│  • sort_order                                   │     │
│                                                   │     │
│  2️⃣ user_roles                                   │     │
│  ─────────────────────────────────────────── │     │
│  • id (UUID, PK)                                │─────┘
│  • user_id (FK)                                 │
│  • role_name (Director, Cinematographer, etc.) │
│  • sort_order                                   │
│                                                   │
│  3️⃣ user_languages                              │
│  ─────────────────────────────────────────── │
│  • id (UUID, PK)                                │
│  • user_id (FK)                                 │
│  • language_name                                │
│  • can_speak (Boolean)                          │
│  • can_write (Boolean)                          │
│                                                   │
│  4️⃣ user_visa_info                              │
│  ─────────────────────────────────────────── │
│  • id (UUID, PK)                                │
│  • user_id (FK, UNIQUE)                         │
│  • visa_type (H1B, L1, O1, etc.)               │
│  • issued_by                                    │
│  • expiry_date                                  │
│                                                   │
│  5️⃣ user_travel_countries                      │
│  ─────────────────────────────────────────── │
│  • id (UUID, PK)                                │
│  • user_id (FK)                                 │
│  • country_code                                 │
│  • country_name                                 │
│                                                   │
│  6️⃣ user_credits                                │
│  ─────────────────────────────────────────── │
│  • id (UUID, PK)                                │
│  • user_id (FK)                                 │
│  • credit_title                                 │
│  • description                                  │
│  • start_date                                   │
│  • end_date                                     │
│  • image_url                                    │
│  • sort_order                                   │
│                                                   │
│  7️⃣ user_highlights                            │
│  ─────────────────────────────────────────── │
│  • id (UUID, PK)                                │
│  • user_id (FK)                                 │
│  • title                                        │
│  • description                                  │
│  • image_url                                    │
│  • sort_order                                   │
│                                                   │
│  8️⃣ user_recommendations                       │
│  ─────────────────────────────────────────── │
│  • id (UUID, PK)                                │
│  • user_id (FK)                                 │
│  • recommended_user_id (FK)                     │
│                                                   │
└───────────────────────────────────────────────────┘


┌──────────── MODIFIED EXISTING TABLE ─────────────┐
│                                                   │
│  applicant_skills (MODIFIED)                    │
│  ─────────────────────────────────────────── │
│  • id ⭐ NEW (UUID, PK)                         │
│  • user_id (FK)                                 │
│  • skill_name                                   │
│  • description ⭐ NEW                           │
│  • sort_order ⭐ NEW                            │
│  • created_at ⭐ NEW                            │
│  • updated_at ⭐ NEW                            │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## Table Relationships

### One-to-One Relationships
- `user_profiles.user_id` ↔ `auth.users.id` (1:1)
- `user_visa_info.user_id` ↔ `auth.users.id` (1:1)

### One-to-Many Relationships
- `auth.users.id` → `user_links` (1:N)
- `auth.users.id` → `user_roles` (1:N)
- `auth.users.id` → `user_languages` (1:N)
- `auth.users.id` → `user_travel_countries` (1:N)
- `auth.users.id` → `user_credits` (1:N)
- `auth.users.id` → `user_highlights` (1:N)
- `auth.users.id` → `applicant_skills` (1:N)

### Many-to-Many Relationships
- `auth.users` ↔ `user_recommendations` ↔ `auth.users` (M:N)

---

## Data Flow Example

### Getting Complete Profile Data

```sql
-- Main profile
SELECT * FROM user_profiles WHERE user_id = ?;

-- Social links
SELECT * FROM user_links WHERE user_id = ? ORDER BY sort_order;

-- Roles
SELECT * FROM user_roles WHERE user_id = ? ORDER BY sort_order;

-- Languages
SELECT * FROM user_languages WHERE user_id = ?;

-- Visa
SELECT * FROM user_visa_info WHERE user_id = ?;

-- Travel countries
SELECT * FROM user_travel_countries WHERE user_id = ?;

-- Skills
SELECT * FROM applicant_skills WHERE user_id = ? ORDER BY sort_order;

-- Credits
SELECT * FROM user_credits WHERE user_id = ? ORDER BY sort_order;

-- Highlights
SELECT * FROM user_highlights WHERE user_id = ? ORDER BY sort_order;

-- Recommendations
SELECT ur.*, up.profile_photo_url 
FROM user_recommendations ur
JOIN user_profiles up ON up.user_id = ur.recommended_user_id
WHERE ur.user_id = ?;
```

---

## Field Mapping: UI ↔ Database

| UI Field | Database Table | Database Column |
|----------|----------------|----------------|
| `id` | user_profiles | user_id |
| `avtar` | user_profiles | profile_photo_url |
| `backgroundAvtar` | user_profiles | banner_url |
| `persionalDetails.name` | user_profiles | legal_first_name + legal_surname |
| `persionalDetails.aliasName` | user_profiles | alias_first_name |
| `persionalDetails.location` | user_profiles | country + city |
| `persionalDetails.availability` | user_profiles | availability |
| `persionalDetails.shortAbout` | user_profiles | bio |
| `persionalDetails.links` | user_links | label, url |
| `language` | user_languages | language_name, can_speak, can_write |
| `countryCode` | user_profiles | country_code |
| `phoneNumber` | user_profiles | phone |
| `email` | user_profiles | email |
| `AvailableCountriesForTravel` | user_travel_countries | country_code, country_name |
| `profileCompletion` | user_profiles | profile_completion_percentage |
| `about` | user_profiles | bio (extended) |
| `skills` | applicant_skills | skill_name, description |
| `roles` | user_roles | role_name |
| `credits` | user_credits | credit_title, description, start_date, end_date, image_url |
| `highlights` | user_highlights | title, description, image_url |
| `recomendPeoples` | user_recommendations | recommended_user_id |

---

## Key Features

### 🔒 Security
- All tables have Row Level Security (RLS) enabled
- Users can only modify their own data
- Public read access for profile viewing
- Private access for sensitive data (visa)

### ⚡ Performance
- Indexes on all foreign keys
- Indexes on frequently queried columns
- Indexes on sort_order for efficient ordering

### 🔄 Data Integrity
- Foreign key constraints with CASCADE delete
- CHECK constraints for data validation
- UNIQUE constraints to prevent duplicates
- Triggers for automatic timestamp updates

### 📝 Audit Trail
- `created_at` on all tables
- `updated_at` on tables that can be modified
- Automatic timestamp updates via triggers

---

## Storage Buckets (Already Exist)

These buckets are used for file uploads:

1. **profile-photos/** (Public)
   - Used for: `user_profiles.profile_photo_url`, `user_profiles.banner_url`
   - Max size: 2 MB

2. **resumes/** (Private)
   - Used for: Application resumes
   - Max size: 5 MB

3. **portfolios/** (Private)
   - Used for: `user_credits.image_url`, `user_highlights.image_url`
   - Max size: 10 MB

---

## Legend

- ⭐ NEW = Newly added field/table
- PK = Primary Key
- FK = Foreign Key
- (1:1) = One-to-One relationship
- (1:N) = One-to-Many relationship
- (M:N) = Many-to-Many relationship

---

**Visual Guide Version:** 1.0
**Last Updated:** January 2025
