# Quick Reference Guide - Profile Schema Updates

## 🚀 TL;DR - Quick Start

```bash
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Execute files in this order:
#    → 02_alter_commands.sql
#    → 03_create_tables.sql
#    → 04_rls_policies.sql
# 3. Done! ✨
```

---

## 📊 What's Being Changed?

### Existing Tables: 2 Modified
1. **user_profiles** - Add 5 new columns
2. **applicant_skills** - Add 5 new columns

### New Tables: 8 Created
1. **user_links** - Social/portfolio links
2. **user_roles** - Professional roles
3. **user_languages** - Language skills
4. **user_visa_info** - Visa information
5. **user_travel_countries** - Travel availability
6. **user_credits** - Work history
7. **user_highlights** - Profile highlights
8. **user_recommendations** - Profile recommendations

---

## 📝 Cheat Sheet - SQL Commands

### Check Current Schema
```sql
-- List all profile tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'user_%';

-- View table structure
\d user_profiles
```

### After Execution - Verify
```sql
-- Count tables (should be 10+)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'user_%';

-- Check RLS enabled (should show 't' for all)
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'user_%';

-- Count policies (should be 40+)
SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE 'user_%';
```

### Insert Test Data
```sql
-- Replace <user-id> with your actual user_id
SET my.user_id = '<user-id>';

-- Basic profile
INSERT INTO user_profiles (user_id, legal_first_name, email, availability) 
VALUES (current_setting('my.user_id')::uuid, 'John', 'john@test.com', 'Available');

-- Add a link
INSERT INTO user_links (user_id, label, url) 
VALUES (current_setting('my.user_id')::uuid, 'LinkedIn', 'https://linkedin.com');

-- Add a role
INSERT INTO user_roles (user_id, role_name) 
VALUES (current_setting('my.user_id')::uuid, 'Director');

-- Add a language
INSERT INTO user_languages (user_id, language_name, can_speak, can_write) 
VALUES (current_setting('my.user_id')::uuid, 'English', true, true);
```

### Query Complete Profile
```sql
-- Get all profile data with relations
WITH profile_data AS (
  SELECT * FROM user_profiles WHERE user_id = '<user-id>'
),
links_data AS (
  SELECT json_agg(json_build_object('label', label, 'url', url) ORDER BY sort_order) as links
  FROM user_links WHERE user_id = '<user-id>'
),
roles_data AS (
  SELECT json_agg(role_name ORDER BY sort_order) as roles
  FROM user_roles WHERE user_id = '<user-id>'
),
languages_data AS (
  SELECT json_agg(json_build_object('name', language_name, 'canSpeak', can_speak, 'canWrite', can_write)) as languages
  FROM user_languages WHERE user_id = '<user-id>'
)
SELECT 
  p.*,
  l.links,
  r.roles,
  lang.languages
FROM profile_data p
CROSS JOIN links_data l
CROSS JOIN roles_data r
CROSS JOIN languages_data lang;
```

---

## 🔑 Key Column Additions

### user_profiles (5 new columns)
| Column | Type | Default | Purpose |
|--------|------|---------|----------|
| email | TEXT | NULL | Contact email |
| country_code | TEXT | 'US' | Phone country code |
| availability | TEXT | 'Available' | Work status |
| profile_completion_percentage | INTEGER | 0 | Profile completion (0-100) |
| updated_at | TIMESTAMP | NOW() | Last update time |

### applicant_skills (5 new columns)
| Column | Type | Default | Purpose |
|--------|------|---------|----------|
| id | UUID | gen_random_uuid() | Primary key |
| description | TEXT | NULL | Skill description |
| sort_order | INTEGER | 0 | Display order |
| created_at | TIMESTAMP | NOW() | Creation time |
| updated_at | TIMESTAMP | NOW() | Last update time |

---

## ⚡ Performance Tips

### Best Practices
1. **Always use indexes** - Already created for you
2. **Use sort_order** - For ordered lists (links, roles, skills, etc.)
3. **Batch inserts** - Insert multiple rows in one query when possible
4. **Use transactions** - Wrap related inserts in BEGIN/COMMIT blocks

### Example: Batch Insert
```sql
BEGIN;

INSERT INTO user_links (user_id, label, url, sort_order) VALUES
  ('<user-id>', 'LinkedIn', 'https://linkedin.com/in/user', 0),
  ('<user-id>', 'GitHub', 'https://github.com/user', 1),
  ('<user-id>', 'Portfolio', 'https://user.com', 2);

COMMIT;
```

---

## 🔒 Security Notes

### What's Protected
- ✅ Users can only edit their own data
- ✅ Public can view profiles (except visa info)
- ✅ Visa info is private (only owner can see)
- ✅ All foreign keys have CASCADE delete

### Testing RLS
```sql
-- Test as authenticated user
SET request.jwt.claim.sub = '<user-id>';
SELECT * FROM user_profiles WHERE user_id = '<user-id>'; -- Should work

-- Reset
RESET request.jwt.claim.sub;
```

---

## 🐛 Common Issues

### Issue: "Column already exists"
**Solution:** Safe to ignore - script uses `IF NOT EXISTS`

### Issue: "Relation does not exist"
**Solution:** Execute files in correct order (02 → 03 → 04)

### Issue: "Permission denied"
**Solution:** Use service role key in Supabase SQL Editor

### Issue: "Foreign key violation"
**Solution:** Ensure user exists in `auth.users` table first

### Issue: "Check constraint violation"
**Solution:** 
- `availability` must be 'Available' or 'Not Available'
- `profile_completion_percentage` must be 0-100
- `languages` must have at least one skill (speak OR write)

---

## 🧹 Cleanup Commands

### Delete Test Data
```sql
-- Delete all profile data for a user
DELETE FROM user_profiles WHERE user_id = '<test-user-id>';
-- Related tables will CASCADE delete automatically
```

### Reset Schema (Use with caution!)
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

-- Revert column additions
ALTER TABLE user_profiles DROP COLUMN IF EXISTS email, 
  DROP COLUMN IF EXISTS country_code, 
  DROP COLUMN IF EXISTS availability,
  DROP COLUMN IF EXISTS profile_completion_percentage,
  DROP COLUMN IF EXISTS updated_at;

ALTER TABLE applicant_skills DROP COLUMN IF EXISTS id,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS sort_order,
  DROP COLUMN IF EXISTS created_at,
  DROP COLUMN IF EXISTS updated_at;
```

---

## 💻 Frontend Integration

### Example: Fetch Complete Profile
```typescript
// Supabase client
const { data, error } = await supabase
  .from('user_profiles')
  .select(`
    *,
    user_links(*),
    user_roles(*),
    user_languages(*),
    user_visa_info(*),
    user_travel_countries(*),
    applicant_skills(*),
    user_credits(*),
    user_highlights(*),
    user_recommendations(
      recommended_user_id,
      user_profiles!user_recommendations_recommended_user_id_fkey(
        profile_photo_url
      )
    )
  `)
  .eq('user_id', userId)
  .single();
```

### Example: Update Profile
```typescript
// Update basic info
await supabase
  .from('user_profiles')
  .update({ 
    availability: 'Not Available',
    profile_completion_percentage: 90 
  })
  .eq('user_id', userId);

// Add new link
await supabase
  .from('user_links')
  .insert({ 
    user_id: userId, 
    label: 'Twitter', 
    url: 'https://twitter.com/user',
    sort_order: 3
  });
```

---

## 📦 What's Included

| File | Purpose | Size |
|------|---------|------|
| `01_analysis.md` | Gap analysis | ~3KB |
| `02_alter_commands.sql` | ALTER statements | ~2KB |
| `03_create_tables.sql` | CREATE statements | ~8KB |
| `04_rls_policies.sql` | Security policies | ~6KB |
| `05_execution_plan.md` | Detailed guide | ~5KB |
| `06_schema_diagram.md` | Visual schema | ~4KB |
| `07_quick_reference.md` | This file | ~3KB |
| `README.md` | Overview | ~2KB |

**Total:** ~33KB of documentation and SQL

---

## ✅ Execution Checklist

- [ ] Read `README.md`
- [ ] Review `01_analysis.md`
- [ ] Backup database
- [ ] Open Supabase SQL Editor
- [ ] Execute `02_alter_commands.sql`
- [ ] Verify ALTER success
- [ ] Execute `03_create_tables.sql`
- [ ] Verify CREATE success
- [ ] Execute `04_rls_policies.sql`
- [ ] Verify RLS policies
- [ ] Run test queries
- [ ] Insert sample data
- [ ] Test RLS with auth
- [ ] Update API endpoints
- [ ] Test frontend integration

---

## 📞 Need Help?

1. Check `05_execution_plan.md` for detailed troubleshooting
2. Review Supabase logs: Dashboard → Logs
3. Consult official docs: https://supabase.com/docs

---

**Quick Reference Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready to Use ✅
