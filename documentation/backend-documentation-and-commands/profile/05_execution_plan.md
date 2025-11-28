# SQL Execution Plan for Profile Schema Updates

## Overview
This document provides a step-by-step execution plan for updating the Supabase database schema to support the profile UI in `app/(app)/profile`.

---

## Prerequisites

✅ **Before executing SQL commands:**

1. **Backup your database** (recommended)
   - Go to Supabase Dashboard → Database → Backups
   - Create a manual backup point

2. **Access to Supabase SQL Editor**
   - Go to your Supabase project
   - Navigate to SQL Editor

3. **Verify current schema**
   - Ensure `user_profiles` table exists
   - Ensure `applicant_skills` table exists

---

## Execution Order (IMPORTANT)

### Step 1: ALTER Existing Tables
**File:** `02_alter_commands.sql`

**Commands:**
- Modify `user_profiles` table (add 4 new columns)
- Modify `applicant_skills` table (add 4 new columns)

**Estimated Time:** 1-2 minutes

**Expected Result:**
```
ALTER TABLE
ALTER TABLE
```

**Verification:**
```sql
-- Check user_profiles structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Check applicant_skills structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'applicant_skills';
```

---

### Step 2: CREATE New Tables
**File:** `03_create_tables.sql`

**Commands:**
- Create 8 new tables:
  1. `user_links`
  2. `user_roles`
  3. `user_languages`
  4. `user_visa_info`
  5. `user_travel_countries`
  6. `user_credits`
  7. `user_highlights`
  8. `user_recommendations`
- Create indexes for performance
- Create triggers for `updated_at` columns

**Estimated Time:** 2-3 minutes

**Expected Result:**
```
CREATE TABLE (x8)
CREATE INDEX (x15)
CREATE FUNCTION
CREATE TRIGGER (x7)
```

**Verification:**
```sql
-- List all new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'user_%';
```

---

### Step 3: Apply Row Level Security Policies
**File:** `04_rls_policies.sql`

**Commands:**
- Enable RLS on all new tables
- Create SELECT, INSERT, UPDATE, DELETE policies
- Set up public/private access rules

**Estimated Time:** 2-3 minutes

**Expected Result:**
```
ALTER TABLE (x8)
CREATE POLICY (x40+)
```

**Verification:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'user_%';

-- List all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'user_%';
```

---

## Post-Execution Testing

### Test 1: Insert Sample Data
```sql
-- Get your user ID (replace with actual authenticated user)
SELECT id FROM auth.users LIMIT 1;

-- Insert sample profile data
INSERT INTO user_profiles (
    user_id, 
    legal_first_name, 
    legal_surname,
    email,
    country_code,
    availability,
    profile_completion_percentage
) VALUES (
    '<your-user-id>',
    'John',
    'Doe',
    'john@example.com',
    'US',
    'Available',
    75
);

-- Insert sample links
INSERT INTO user_links (user_id, label, url, sort_order) VALUES
('<your-user-id>', 'LinkedIn', 'https://linkedin.com/in/johndoe', 0),
('<your-user-id>', 'Portfolio', 'https://johndoe.com', 1);

-- Insert sample roles
INSERT INTO user_roles (user_id, role_name, sort_order) VALUES
('<your-user-id>', 'Director', 0),
('<your-user-id>', 'Cinematographer', 1);

-- Insert sample language
INSERT INTO user_languages (user_id, language_name, can_speak, can_write) VALUES
('<your-user-id>', 'English', true, true),
('<your-user-id>', 'Spanish', true, false);
```

### Test 2: Query Profile Data
```sql
-- Get complete profile with all related data
SELECT 
    p.*,
    json_agg(DISTINCT jsonb_build_object('label', l.label, 'url', l.url)) as links,
    json_agg(DISTINCT r.role_name) as roles,
    json_agg(DISTINCT jsonb_build_object('name', lang.language_name, 'canSpeak', lang.can_speak, 'canWrite', lang.can_write)) as languages
FROM user_profiles p
LEFT JOIN user_links l ON l.user_id = p.user_id
LEFT JOIN user_roles r ON r.user_id = p.user_id
LEFT JOIN user_languages lang ON lang.user_id = p.user_id
WHERE p.user_id = '<your-user-id>'
GROUP BY p.user_id;
```

### Test 3: Update Data
```sql
-- Update profile
UPDATE user_profiles 
SET availability = 'Not Available',
    profile_completion_percentage = 90
WHERE user_id = '<your-user-id>';

-- Verify updated_at was triggered
SELECT user_id, updated_at 
FROM user_profiles 
WHERE user_id = '<your-user-id>';
```

---

## Rollback Plan (If Needed)

### If errors occur during execution:

```sql
-- Drop all new tables
DROP TABLE IF EXISTS user_recommendations CASCADE;
DROP TABLE IF EXISTS user_highlights CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS user_travel_countries CASCADE;
DROP TABLE IF EXISTS user_visa_info CASCADE;
DROP TABLE IF EXISTS user_languages CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_links CASCADE;

-- Revert user_profiles changes (if needed)
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS country_code,
DROP COLUMN IF EXISTS availability,
DROP COLUMN IF EXISTS profile_completion_percentage,
DROP COLUMN IF EXISTS updated_at;

-- Revert applicant_skills changes (if needed)
ALTER TABLE applicant_skills
DROP COLUMN IF EXISTS id,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS sort_order,
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;
```

---

## Common Issues & Solutions

### Issue 1: "Column already exists"
**Solution:** This is normal if you've run the script before. The `IF NOT EXISTS` clause handles this.

### Issue 2: "Constraint violation"
**Solution:** Check for existing data that violates new constraints (e.g., CHECK constraints).

### Issue 3: "Permission denied"
**Solution:** Ensure you're using the service role or have sufficient permissions in Supabase.

### Issue 4: "Foreign key constraint fails"
**Solution:** Ensure `auth.users` table exists and has data.

---

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns have indexes
2. **Cascading Deletes**: All tables use `ON DELETE CASCADE` to maintain data integrity
3. **Updated_at Triggers**: Automatically track when records are modified
4. **Sort Order**: All ordered lists use `sort_order` for efficient querying

---

## Next Steps After Execution

1. ✅ Update API endpoints in `/app/api/profile/` to handle new fields
2. ✅ Update frontend forms to save data to new tables
3. ✅ Test profile editing functionality
4. ✅ Implement data validation on backend
5. ✅ Add appropriate error handling

---

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Review the verification queries above
3. Consult Supabase documentation: https://supabase.com/docs

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Status:** Ready for Execution ✅
