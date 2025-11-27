# Collab Feature - Backend Implementation Guide

## 🎯 Overview

This directory contains complete backend implementation documentation for the **Collab Feature** - a collaboration platform where users can post project ideas, find collaborators, and manage teams.

**Status:** ✅ Ready for Implementation
**Created:** January 2025
**Version:** 1.0

---

## 📚 Documentation Files

### 1. **00_ANALYSIS.md**
**Purpose:** Frontend analysis and backend requirements
- Frontend feature breakdown
- Data structure analysis
- Database requirements
- API endpoint planning
- Storage bucket specifications

**When to read:** Start here to understand the feature requirements

---

### 2. **01_CREATE_TABLES.sql**
**Purpose:** SQL commands to create all database tables
- Creates 4 tables: `collab_posts`, `collab_tags`, `collab_interests`, `collab_collaborators`
- Establishes foreign key relationships
- Creates triggers for automatic timestamp updates
- Includes verification queries

**When to run:** First step in database setup

**Execute:**
```bash
psql -d your_database < 01_CREATE_TABLES.sql
```

---

### 3. **02_RLS_POLICIES.sql**
**Purpose:** Row Level Security policies for data protection
- Enables RLS on all tables
- Creates 17 security policies
- Defines access control rules
- Protects against unauthorized access

**When to run:** Second step, after tables are created

**Execute:**
```bash
psql -d your_database < 02_RLS_POLICIES.sql
```

---

### 4. **03_INDEXES.sql**
**Purpose:** Database indexes for query performance
- Creates 15+ indexes
- Optimizes common queries
- Includes full-text search indexes
- Improves sorting and filtering

**When to run:** Third step, after RLS policies

**Execute:**
```bash
psql -d your_database < 03_INDEXES.sql
```

---

### 5. **04_STORAGE_BUCKET.sql**
**Purpose:** Supabase Storage bucket configuration
- Creates `collab-covers` bucket
- Sets up storage policies
- Configures file size limits (5MB)
- Defines allowed file types (JPEG, PNG)
- Includes helper functions

**When to run:** Fourth step, after indexes

**Execute:**
```bash
psql -d your_database < 04_STORAGE_BUCKET.sql
```

Or create via Supabase Dashboard (see file for instructions)

---

### 6. **05_IMPLEMENTATION_PLAN.md**
**Purpose:** Step-by-step implementation guide
- Phase-by-phase breakdown
- Detailed implementation steps
- API endpoint specifications
- Testing checklist
- Troubleshooting guide

**When to read:** During implementation phase

**Covers:**
- Database setup (Steps 1-4)
- API implementation (Steps 5-9)
- Frontend integration (Step 10)
- Testing (Step 11)
- Optimization (Steps 12-13)

---

### 7. **06_API_ENDPOINTS.md**
**Purpose:** Complete API documentation
- All 14 API endpoints
- Request/response formats
- Authentication requirements
- Error handling
- Rate limiting
- SDK examples

**When to read:** During API development

**Includes:**
- CRUD operations (6 endpoints)
- Interest management (3 endpoints)
- Collaborator management (3 endpoints)
- Status & upload (2 endpoints)

---

### 8. **07_QUICK_REFERENCE.md**
**Purpose:** Quick lookup guide
- Database schema summary
- Key relationships
- Common SQL queries
- API endpoint list
- Checklists
- Performance tips

**When to read:** Quick reference during development

---

## 🚀 Quick Start

### Prerequisites
1. Supabase project with PostgreSQL database
2. Supabase Storage enabled
3. `auth.users` table (Supabase Auth)
4. `user_profiles` table (existing)

### Setup in 4 Steps

**Step 1: Create Tables**
```bash
psql -d your_database < 01_CREATE_TABLES.sql
```
Verify: 4 tables created (collab_posts, collab_tags, collab_interests, collab_collaborators)

**Step 2: Apply Security**
```bash
psql -d your_database < 02_RLS_POLICIES.sql
```
Verify: 17 RLS policies created

**Step 3: Add Indexes**
```bash
psql -d your_database < 03_INDEXES.sql
```
Verify: 15+ indexes created

**Step 4: Setup Storage**
```bash
psql -d your_database < 04_STORAGE_BUCKET.sql
```
Or via Supabase Dashboard
Verify: collab-covers bucket exists

---

## 📊 Database Schema

### Tables

```
collab_posts (Main table)
  ├── id (UUID, PK)
  ├── user_id (FK → auth.users)
  ├── title, slug, summary
  ├── cover_image_url
  ├── status (open/closed/draft)
  └── created_at, updated_at

collab_tags (Tags)
  ├── id (UUID, PK)
  ├── collab_id (FK → collab_posts)
  ├── tag_name
  └── created_at

collab_interests (Interested users)
  ├── id (UUID, PK)
  ├── collab_id (FK → collab_posts)
  ├── user_id (FK → auth.users)
  └── created_at

collab_collaborators (Team members)
  ├── id (UUID, PK)
  ├── collab_id (FK → collab_posts)
  ├── user_id (FK → auth.users)
  ├── role, department
  ├── added_by (FK → auth.users)
  └── added_at
```

### Storage

```
collab-covers/ (Public bucket)
  ├── Max size: 5 MB
  ├── Types: JPEG, PNG
  └── Path: {user_id}/{collab_id}/{filename}
```

---

## 🔌 API Endpoints

### CRUD Operations
```
POST   /api/collab              Create new collab
GET    /api/collab              List all collabs
GET    /api/collab/my           Get my collabs
GET    /api/collab/[id]         Get collab details
PATCH  /api/collab/[id]         Update collab
DELETE /api/collab/[id]         Delete collab
```

### Interest & Collaboration
```
POST   /api/collab/[id]/interest             Express interest
DELETE /api/collab/[id]/interest             Remove interest
GET    /api/collab/[id]/interests            List interested users
GET    /api/collab/[id]/collaborators        List collaborators
POST   /api/collab/[id]/collaborators        Add collaborator
DELETE /api/collab/[id]/collaborators/[id]  Remove collaborator
```

### Additional
```
PATCH  /api/collab/[id]/close    Close collab
POST   /api/upload/collab-cover  Upload cover image
```

**Total:** 14 endpoints

---

## 🔒 Security

### Row Level Security (RLS)

**collab_posts:**
- Public can view open/closed posts
- Users can view own drafts
- Authenticated users can create
- Only owners can update/delete

**collab_interests:**
- Users can express interest (not on own posts)
- Users can remove own interest
- Owners can view all interests

**collab_collaborators:**
- Public can view
- Only owners can add/remove

### Storage Security
- Public read access
- Authenticated write to own folder
- File size limit: 5MB
- Type validation: JPEG, PNG only

---

## ✅ Implementation Checklist

### Database Setup
- [ ] Execute 01_CREATE_TABLES.sql
- [ ] Execute 02_RLS_POLICIES.sql
- [ ] Execute 03_INDEXES.sql
- [ ] Execute 04_STORAGE_BUCKET.sql
- [ ] Verify tables exist
- [ ] Verify RLS policies active
- [ ] Verify indexes created
- [ ] Verify storage bucket configured

### API Implementation
- [ ] Create /api/collab route structure
- [ ] Implement POST /api/collab
- [ ] Implement GET /api/collab
- [ ] Implement GET /api/collab/my
- [ ] Implement GET /api/collab/[id]
- [ ] Implement PATCH /api/collab/[id]
- [ ] Implement DELETE /api/collab/[id]
- [ ] Implement interest endpoints (3)
- [ ] Implement collaborator endpoints (3)
- [ ] Implement PATCH /api/collab/[id]/close
- [ ] Implement POST /api/upload/collab-cover

### Frontend Integration
- [ ] Create API utility functions
- [ ] Update /collab page (list & create)
- [ ] Update /collab/manage-collab page
- [ ] Update /collab/manage-collab/[id] page
- [ ] Replace hardcoded data with API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test all user flows

### Testing
- [ ] Test create collab
- [ ] Test list with filters
- [ ] Test update collab
- [ ] Test delete collab
- [ ] Test express/remove interest
- [ ] Test add/remove collaborator
- [ ] Test close collab
- [ ] Test upload cover
- [ ] Test RLS policies
- [ ] Test performance with large dataset

---

## 🛠️ Tech Stack

- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage (S3-compatible)
- **Auth:** Supabase Auth (JWT)
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes
- **ORM:** Supabase JS Client

---

## 💯 Features

### Core Features
- ✅ Create collaboration posts
- ✅ Browse collab feed
- ✅ Search and filter
- ✅ Express interest
- ✅ Manage collaborators
- ✅ Close collaborations
- ✅ Upload cover images

### Security Features
- ✅ Row Level Security (RLS)
- ✅ JWT authentication
- ✅ Ownership validation
- ✅ File upload validation

### Performance Features
- ✅ Database indexes
- ✅ Query optimization
- ✅ Pagination support
- ✅ Full-text search

---

## 🔧 Troubleshooting

### Common Issues

**Tables not created:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'collab_%';
```

**RLS blocking queries:**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename LIKE 'collab_%';

-- Disable RLS temporarily for testing (NOT for production)
ALTER TABLE collab_posts DISABLE ROW LEVEL SECURITY;
```

**Storage upload fails:**
- Check bucket exists: Supabase Dashboard → Storage
- Verify file size < 5MB
- Verify file type is JPEG or PNG
- Check authentication token

**Slow queries:**
```sql
-- Check if indexes are used
EXPLAIN ANALYZE SELECT * FROM collab_posts WHERE status = 'open';
```

---

## 📈 Statistics

- **Tables:** 4
- **RLS Policies:** 17
- **Indexes:** 15+
- **API Endpoints:** 14
- **Storage Buckets:** 1
- **Documentation Files:** 8

---

## 📝 Next Steps

1. **Review** the analysis document (00_ANALYSIS.md)
2. **Execute** SQL files in order (01 → 04)
3. **Follow** implementation plan (05_IMPLEMENTATION_PLAN.md)
4. **Implement** API endpoints (06_API_ENDPOINTS.md)
5. **Reference** quick guide as needed (07_QUICK_REFERENCE.md)
6. **Test** thoroughly before deployment

---

## 📦 Package Contents

```
backend-command/collab/
├── README.md                       (This file)
├── 00_ANALYSIS.md                  (Frontend analysis)
├── 01_CREATE_TABLES.sql            (Table creation)
├── 02_RLS_POLICIES.sql             (Security policies)
├── 03_INDEXES.sql                  (Performance indexes)
├── 04_STORAGE_BUCKET.sql           (Storage setup)
├── 05_IMPLEMENTATION_PLAN.md       (Implementation guide)
├── 06_API_ENDPOINTS.md             (API documentation)
└── 07_QUICK_REFERENCE.md           (Quick reference)
```

---

## ❔ Support

**Questions?** Refer to:
- Main Architecture: `/backend-command/UPDATED_BACKEND_ARCHITECTURE.md`
- Implementation Plan: `05_IMPLEMENTATION_PLAN.md`
- API Reference: `06_API_ENDPOINTS.md`

**Issues?** Check:
- Troubleshooting section above
- Common errors in `05_IMPLEMENTATION_PLAN.md`
- Quick reference guide: `07_QUICK_REFERENCE.md`

---

**Version:** 1.0
**Status:** ✅ Complete & Ready
**Last Updated:** January 2025
**Maintained By:** Development Team
