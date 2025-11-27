# Profile Schema Update Commands

## Overview

This directory contains SQL commands to update the Supabase database schema to support the complete profile UI in `app/(app)/profile`.

---

## 📁 Files in This Directory

### 1. `01_analysis.md`
**Purpose:** Gap analysis between current backend and UI requirements

**Contents:**
- Current database schema
- UI data requirements
- Missing fields and tables
- Summary of required changes

**Action Required:** READ FIRST to understand scope

---

### 2. `02_alter_commands.sql`
**Purpose:** Modify existing tables

**Changes:**
- Add columns to `user_profiles` table:
  - `email`
  - `country_code`
  - `availability`
  - `profile_completion_percentage`
  - `updated_at`

- Modify `applicant_skills` table:
  - Add `id` (UUID primary key)
  - Add `description`
  - Add `sort_order`
  - Add timestamps

**Action Required:** EXECUTE FIRST in Supabase SQL Editor

---

### 3. `03_create_tables.sql`
**Purpose:** Create 8 new tables for profile features

**New Tables:**
1. `user_links` - Social/portfolio links
2. `user_roles` - Professional roles
3. `user_languages` - Languages with proficiency
4. `user_visa_info` - Visa information
5. `user_travel_countries` - Travel availability
6. `user_credits` - Work history
7. `user_highlights` - Profile highlights
8. `user_recommendations` - Profile recommendations

**Also Creates:**
- 15+ indexes for performance
- Triggers for `updated_at` columns
- Table comments for documentation

**Action Required:** EXECUTE SECOND in Supabase SQL Editor

---

### 4. `04_rls_policies.sql`
**Purpose:** Enable Row Level Security and create policies

**Security Features:**
- Users can only modify their own data
- Public read access for profile viewing
- Private access for sensitive data (visa info)
- Proper ownership checks

**Policies Created:** 40+ RLS policies

**Action Required:** EXECUTE THIRD in Supabase SQL Editor

---

### 5. `05_execution_plan.md`
**Purpose:** Step-by-step execution guide

**Contents:**
- Prerequisites checklist
- Execution order
- Verification queries
- Test data samples
- Rollback plan
- Troubleshooting guide

**Action Required:** FOLLOW THIS GUIDE when executing SQL

---

### 6. `README.md` (This file)
**Purpose:** Quick reference and navigation

---

## 🚀 Quick Start

### Step 1: Read the Analysis
```bash
Open: 01_analysis.md
```
Understand what changes are needed and why.

### Step 2: Follow the Execution Plan
```bash
Open: 05_execution_plan.md
```
This has the complete step-by-step guide.

### Step 3: Execute SQL Commands IN ORDER

1. **Execute:** `02_alter_commands.sql`
2. **Execute:** `03_create_tables.sql`
3. **Execute:** `04_rls_policies.sql`

---

## ⚠️ Important Notes

### Before Execution

✅ **DO:**
- Backup your database first
- Read the execution plan completely
- Test in development environment first
- Verify current schema matches architecture doc

❌ **DON'T:**
- Execute files out of order
- Skip verification steps
- Run in production without testing
- Modify SQL files without understanding impact

---

## 📊 Schema Changes Summary

| Change Type | Count | Impact |
|------------|-------|--------|
| ALTER TABLE | 2 | Modifies existing tables |
| CREATE TABLE | 8 | New tables for profile features |
| CREATE INDEX | 15+ | Performance optimization |
| CREATE POLICY | 40+ | Row-level security |
| CREATE TRIGGER | 7 | Auto-update timestamps |

**Total Commands:** ~70

**Estimated Execution Time:** 5-10 minutes

---

## 🔍 Verification

After execution, verify schema:

```sql
-- List all profile-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'user_%';

-- Expected result: 10+ tables
```

---

## 🆘 Troubleshooting

### Common Issues

1. **"Column already exists"**
   - Solution: Commands use `IF NOT EXISTS`, safe to ignore

2. **"Permission denied"**
   - Solution: Ensure you have admin/service role access

3. **"Table does not exist"**
   - Solution: Check that base tables exist (`user_profiles`, `applicant_skills`)

### Need Help?

Refer to:
- `05_execution_plan.md` - Troubleshooting section
- Supabase documentation
- Database logs in Supabase Dashboard

---

## 📈 Next Steps After Schema Update

1. ✅ Update API endpoints to handle new tables
2. ✅ Update frontend to save/load from new schema
3. ✅ Test all profile editing functionality
4. ✅ Implement data validation
5. ✅ Add error handling

---

## 📝 File Structure

```
backend-command/profile/
├── README.md                    # This file - Quick reference
├── 01_analysis.md              # Gap analysis and requirements
├── 02_alter_commands.sql       # ALTER TABLE statements
├── 03_create_tables.sql        # CREATE TABLE statements
├── 04_rls_policies.sql         # Row Level Security policies
└── 05_execution_plan.md        # Step-by-step execution guide
```

---

## ✅ Checklist

Before you start:
- [ ] Read `01_analysis.md`
- [ ] Read `05_execution_plan.md`
- [ ] Backup database
- [ ] Verify current schema

During execution:
- [ ] Execute `02_alter_commands.sql`
- [ ] Verify ALTER TABLE success
- [ ] Execute `03_create_tables.sql`
- [ ] Verify CREATE TABLE success
- [ ] Execute `04_rls_policies.sql`
- [ ] Verify RLS policies applied

After execution:
- [ ] Run verification queries
- [ ] Insert test data
- [ ] Query test data successfully
- [ ] Test RLS policies

---

**Status:** ✅ Ready for Execution

**Version:** 1.0

**Last Updated:** January 2025

---

## 💡 Tips

1. **Copy-paste carefully** - SQL syntax is sensitive
2. **Execute in sections** - Don't run entire file at once on first try
3. **Check results** - Look for "CREATE TABLE" success messages
4. **Be patient** - Some commands take time with large databases
5. **Document changes** - Keep notes of any modifications you make

---

Happy coding! 🚀
