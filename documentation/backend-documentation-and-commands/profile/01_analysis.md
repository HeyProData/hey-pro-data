# Profile UI vs Supabase Backend - Gap Analysis

## Executive Summary
This document analyzes the gap between the current Supabase backend architecture and the profile UI requirements in `app/(app)/profile`.

---

## Current Backend Schema (user_profiles table)

```sql
user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  legal_first_name TEXT,
  legal_surname TEXT,
  alias_first_name TEXT,
  alias_surname TEXT,
  phone TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  banner_url TEXT,
  country TEXT,
  city TEXT,
  is_profile_complete BOOLEAN
)
```

---

## UI Data Requirements Analysis

### ✅ ALREADY SUPPORTED (No changes needed)
1. **user_id** - Maps to auth.users
2. **profile_photo_url** - Maps to `avtar` in UI
3. **banner_url** - Maps to `backgroundAvtar` in UI
4. **legal_first_name, legal_surname** - Maps to `name` in UI
5. **alias_first_name** - Maps to `aliasName` in UI
6. **country, city** - Maps to `location` in UI
7. **bio** - Maps to `shortAbout` in UI
8. **phone** - Already exists
9. **is_profile_complete** - Maps to `profileCompletion` (needs type conversion)

---

### ❌ MISSING FIELDS (Require ALTER TABLE or NEW TABLES)

#### 1. **Email Address** (Missing)
- **UI Field**: `email`
- **Usage**: Contact details section (WhatAppNumber.tsx)
- **Required Action**: Add column to `user_profiles`

#### 2. **Country Code** (Missing)
- **UI Field**: `countryCode`
- **Usage**: Phone number with country dial code
- **Required Action**: Add column to `user_profiles`

#### 3. **Availability/Work Status** (Missing)
- **UI Field**: `availability` ("Available", "Not Available")
- **Usage**: Work status section
- **Required Action**: Add column to `user_profiles`

#### 4. **Profile Completion Percentage** (Partial)
- **UI Field**: `profileCompletion` (number 0-100)
- **Current**: `is_profile_complete` (boolean)
- **Required Action**: Change to INTEGER or add new column

#### 5. **Social/Portfolio Links** (Missing)
- **UI Field**: `links` (array of {label, url})
- **Usage**: Profile links section
- **Required Action**: Create new table `user_links`

#### 6. **Roles** (Missing)
- **UI Field**: `roles` (array of strings)
- **Usage**: Displayed as badges (Director, Cinematographer, etc.)
- **Required Action**: Create new table `user_roles`

#### 7. **Languages** (Missing entirely)
- **UI Field**: `language` array with `{name, canSpeak, canWrite}`
- **Usage**: Language section with speak/write capabilities
- **Required Action**: Create new table `user_languages`

#### 8. **Visa Information** (Missing)
- **UI Fields**: 
  - `visaType` (H1B, L1, O1, etc.)
  - `visaIssueBy` (country)
  - `visaExpData` (expiration date)
- **Usage**: Visa section
- **Required Action**: Create new table `user_visa_info`

#### 9. **Available Countries for Travel** (Missing)
- **UI Field**: `AvailableCountriesForTravel` (array of country objects)
- **Usage**: Travel availability section
- **Required Action**: Create new table `user_travel_countries`

#### 10. **Skills with Descriptions** (Partial)
- **Current Table**: `applicant_skills` (user_id, skill_name)
- **UI Requirement**: `skills` (id, skillName, description)
- **Required Action**: ALTER `applicant_skills` to add `id`, `description`, and `sort_order`

#### 11. **Credits/Work History** (Missing)
- **UI Field**: `credits` array with {id, creditTitle, startDate, endDate, description, imgUrl}
- **Usage**: Credits section showing work history
- **Required Action**: Create new table `user_credits`

#### 12. **Highlights** (Missing)
- **UI Field**: `highlights` array with {id, title, description, images}
- **Usage**: Highlights sidebar section
- **Required Action**: Create new table `user_highlights`

#### 13. **Recommended Peoples** (Missing)
- **UI Field**: `recomendPeoples` array with {imgUrl}
- **Usage**: "People also viewed" section
- **Required Action**: Create new table `user_recommendations`

---

## Summary of Required Changes

### ALTER TABLE Operations: 1
1. Modify `user_profiles` table (add 3 columns)

### CREATE TABLE Operations: 9
1. `user_links` - Social/portfolio links
2. `user_roles` - User roles/titles
3. `user_languages` - Languages with skills
4. `user_visa_info` - Visa information
5. `user_travel_countries` - Available travel countries
6. `user_credits` - Work history/credits
7. `user_highlights` - Profile highlights
8. `user_recommendations` - Profile recommendations
9. Modify `applicant_skills` - Add description and ordering

### Total SQL Commands: 10

---

## Next Steps
1. Review `02_alter_commands.sql` for ALTER TABLE statements
2. Review `03_create_tables.sql` for CREATE TABLE statements
3. Review `04_rls_policies.sql` for Row Level Security policies
4. Execute commands in Supabase SQL editor in order
5. Test data insertion with sample profile data
