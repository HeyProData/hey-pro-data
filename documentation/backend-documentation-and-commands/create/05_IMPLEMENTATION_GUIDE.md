# Design Projects Feature - Implementation Guide

## Overview

This guide provides step-by-step instructions to implement the **Design Projects** feature from scratch to match the frontend requirements.

**Status:** Backend NOT implemented yet  
**Frontend:** `/app/app/(app)/create/page.tsx` (UI only, no functionality)  
**Priority:** HIGH - Core feature needed for project creation flow

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Database Setup](#phase-1-database-setup)
3. [Phase 2: Storage Configuration](#phase-2-storage-configuration)
4. [Phase 3: API Implementation](#phase-3-api-implementation)
5. [Phase 4: Frontend Integration](#phase-4-frontend-integration)
6. [Phase 5: Testing & Validation](#phase-5-testing--validation)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Access
- ✅ Supabase project dashboard access
- ✅ Database SQL editor access
- ✅ Storage configuration access
- ✅ API route creation capability

### Existing Features to Understand
- Gigs feature (similar CRUD patterns)
- Collab feature (similar team management)
- What's On feature (similar structured data)
- Profile feature (user relationships)

---

## Phase 1: Database Setup

### Step 1.1: Create Tables

**File:** `01_CREATE_TABLES.sql`

1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire content from `01_CREATE_TABLES.sql`
4. Execute the script
5. Verify success:

```sql
-- Should return 5 tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%project%' 
OR table_name = 'design_projects';
```

**Expected Result:**
- ✅ `design_projects` (main table)
- ✅ `project_tags` (categorization)
- ✅ `project_team` (team members)
- ✅ `project_files` (file references)
- ✅ `project_links` (external resources)

**What These Tables Do:**
- **design_projects:** Store project details (title, description, status, dates, budget, privacy)
- **project_tags:** Categorize projects with tags (many-to-many)
- **project_team:** Manage team members with roles and permissions
- **project_files:** Track uploaded files with metadata
- **project_links:** Store external references (portfolios, references, etc.)

### Step 1.2: Apply RLS Policies

**File:** `02_RLS_POLICIES.sql`

1. Create new query in SQL Editor
2. Copy entire content from `02_RLS_POLICIES.sql`
3. Execute the script
4. Verify success:

```sql
-- Should return 34 policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
GROUP BY tablename;
```

**Expected Result:**
- ✅ `design_projects`: 7 policies
- ✅ `project_tags`: 5 policies
- ✅ `project_team`: 7 policies
- ✅ `project_files`: 6 policies
- ✅ `project_links`: 5 policies
- ✅ **Total: 30+ policies**

**What RLS Policies Do:**
- Control who can view/edit projects based on privacy settings
- Enforce ownership (only owner can delete)
- Enable team access (team members can view team-only projects)
- Protect private data (private projects only visible to owner)
- Prevent unauthorized modifications

### Step 1.3: Create Performance Indexes

**File:** `03_INDEXES.sql`

1. Create new query in SQL Editor
2. Copy entire content from `03_INDEXES.sql`
3. Execute the script
4. Verify success:

```sql
-- Should return 35+ indexes
SELECT tablename, COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'design_projects',
    'project_tags',
    'project_team',
    'project_files',
    'project_links'
)
GROUP BY tablename;
```

**Expected Result:**
- ✅ `design_projects`: 13 indexes
- ✅ `project_tags`: 4 indexes
- ✅ `project_team`: 6 indexes
- ✅ `project_files`: 7 indexes
- ✅ `project_links`: 3 indexes
- ✅ **Total: 33+ indexes**

**What Indexes Do:**
- Speed up queries by user_id (filter user's projects)
- Optimize status/privacy filtering
- Improve sorting by date
- Enable fast full-text search
- Accelerate JOIN operations

---

## Phase 2: Storage Configuration

### Step 2.1: Create Storage Bucket

**File:** `04_STORAGE_BUCKET.sql`

**Option A: Via SQL (Recommended)**
1. Open Supabase SQL Editor
2. Copy content from `04_STORAGE_BUCKET.sql`
3. Execute the script

**Option B: Via Dashboard**
1. Go to Storage → Create Bucket
2. Name: `project-assets`
3. Public: ✅ Enabled
4. File size limit: 20MB (20971520 bytes)
5. Allowed MIME types:
   - Images: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
   - Videos: `video/mp4`, `video/quicktime`, `video/x-msvideo`
   - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Archives: `application/zip`
   - Audio: `audio/mpeg`, `audio/wav`

### Step 2.2: Verify Storage Policies

Run this query to check storage policies:

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%project_assets%';
```

**Expected Result: 7 storage policies**

**What Storage Bucket Does:**
- Store project images (thumbnails, hero images)
- Store project files (documents, videos, assets)
- Enforce 20MB file size limit
- Control access via RLS policies
- Path structure: `{user_id}/{project_id}/{filename}`

---

## Phase 3: API Implementation

### Step 3.1: Project CRUD Endpoints

**Create:** `/app/api/projects/route.js`

```javascript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

// POST /api/projects - Create new project
export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      project_type,
      status = 'draft',
      start_date,
      end_date,
      estimated_duration,
      budget_amount,
      budget_currency = 'AED',
      location,
      is_remote = false,
      thumbnail_url,
      hero_image_url,
      privacy = 'public',
      tags = []
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100) + '-' + Date.now().toString(36);

    // Insert project
    const { data: project, error: projectError } = await supabase
      .from('design_projects')
      .insert({
        user_id: user.id,
        title,
        slug,
        description,
        project_type,
        status,
        start_date,
        end_date,
        estimated_duration,
        budget_amount,
        budget_currency,
        location,
        is_remote,
        thumbnail_url,
        hero_image_url,
        privacy
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return NextResponse.json(
        { success: false, error: 'Failed to create project', details: projectError.message },
        { status: 500 }
      );
    }

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map(tag => ({
        project_id: project.id,
        tag_name: tag
      }));

      const { error: tagsError } = await supabase
        .from('project_tags')
        .insert(tagInserts);

      if (tagsError) {
        console.error('Tags insertion error:', tagsError);
        // Don't fail the request, tags are optional
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: { ...project, tags }
    });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/projects - List projects (browse)
export async function GET(request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const project_type = searchParams.get('type');
    const privacy = searchParams.get('privacy') || 'public';
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('design_projects')
      .select(`
        *,
        project_tags(tag_name),
        user_profiles!design_projects_user_id_fkey(
          legal_first_name,
          legal_surname,
          profile_photo_url
        )
      `, { count: 'exact' })
      .eq('privacy', privacy)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) query = query.eq('status', status);
    if (project_type) query = query.eq('project_type', project_type);
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Projects list error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalProjects: count,
          limit,
          hasNextPage: offset + limit < count,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('List projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 3.2: Additional Endpoints

Create these additional API files:

1. **`/app/api/projects/my/route.js`** - Get user's projects
2. **`/app/api/projects/[id]/route.js`** - Get/Update/Delete specific project
3. **`/app/api/projects/[id]/team/route.js`** - Manage team members
4. **`/app/api/upload/project-asset/route.js`** - Upload files

Refer to similar implementations in:
- `/app/api/collab/` (for reference patterns)
- `/app/api/gigs/` (for CRUD patterns)
- `/app/api/upload/` (for file upload patterns)

### Step 3.3: Test API Endpoints

Use curl or Postman to test:

```bash
# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Project",
    "description": "This is a test project for design work",
    "project_type": "commercial",
    "status": "draft",
    "privacy": "public",
    "tags": ["design", "branding"]
  }'

# List projects
curl http://localhost:3000/api/projects?page=1&limit=10
```

---

## Phase 4: Frontend Integration

### Step 4.1: Update Create Page

Modify `/app/app/(app)/create/page.tsx` to add navigation:

```typescript
import { Folder } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
    return (
        <main className="mt-10 sm:mt-20 lg:mt-30 w-full max-w-xl min-h-[24rem] shadow-sm mx-auto rounded-2xl flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
            <div className="w-full">
                <div className="flex flex-col justify-center items-center mb-6 sm:mb-8 lg:mb-10">
                    <Folder className="mx-auto mb-3 sm:mb-4" size={40} />
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal mb-2 text-center">Create New Project</h1>
                        <p className="text-gray-600 text-center px-4 sm:px-6 text-sm sm:text-base">
                            Let&apos;s bring your creative vision to life. We&apos;ll guide you through setting up your project.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-9 px-4 sm:px-6 lg:px-10">
                    {/* Design Project Option */}
                    <Link href="/projects/new">
                        <div className="flex flex-col h-full items-center p-8 border rounded-lg cursor-pointer border-[#FA6E80] font-normal hover:bg-[#FA6E80]/5 transition-colors">
                            <Folder className="mx-auto" size={30} color="#FA6E80" />
                            <div className="text-center">
                                <h2 className="text-lg font-semibold text-center text-[#FA6E80]">Design Project</h2>
                                <p className="text-[10px]">Define your project details</p>
                            </div>
                        </div>
                    </Link>

                    {/* Add Gigs Option */}
                    <Link href="/gigs/new">
                        <div className="flex flex-col items-center p-8 border border-[#31A7AC] rounded-lg cursor-pointer hover:bg-[#31A7AC]/5 transition-colors">
                            <Folder className="mx-auto" size={30} color="#31A7AC" />
                            <h2 className="text-lg font-semibold text-center text-[#31A7AC]">Add Gigs</h2>
                            <p className="text-[10px]">Create roles for your team</p>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
```

### Step 4.2: Create Project Form Page

Create `/app/app/(app)/projects/new/page.tsx`:

```typescript
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_type: 'other',
        status: 'draft',
        privacy: 'public',
        tags: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                router.push(`/projects/${result.data.slug}`);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Create project error:', error);
            alert('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create Design Project</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Project Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                        minLength={3}
                        maxLength={200}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2"
                        rows={5}
                        required
                        minLength={10}
                        maxLength={10000}
                    />
                </div>

                {/* Project Type */}
                <div>
                    <label className="block text-sm font-medium mb-2">Project Type</label>
                    <select
                        value={formData.project_type}
                        onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2"
                    >
                        <option value="commercial">Commercial</option>
                        <option value="film">Film</option>
                        <option value="tv">TV</option>
                        <option value="social">Social Media</option>
                        <option value="digital">Digital</option>
                        <option value="photography">Photography</option>
                        <option value="branding">Branding</option>
                        <option value="web_design">Web Design</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Privacy */}
                <div>
                    <label className="block text-sm font-medium mb-2">Privacy</label>
                    <select
                        value={formData.privacy}
                        onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2"
                    >
                        <option value="public">Public - Everyone can see</option>
                        <option value="private">Private - Only me</option>
                        <option value="team_only">Team Only - Team members only</option>
                    </select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#FA6E80] text-white px-6 py-2 rounded-lg hover:bg-[#FA6E80]/90 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="border px-6 py-2 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
```

---

## Phase 5: Testing & Validation

### Test Checklist

#### Database Tests
- [ ] All 5 tables exist
- [ ] All 30+ RLS policies active
- [ ] All 33+ indexes created
- [ ] Triggers working (updated_at)
- [ ] Constraints enforced (unique, foreign keys)

#### Storage Tests
- [ ] Bucket `project-assets` exists
- [ ] 20MB file size limit enforced
- [ ] MIME type validation working
- [ ] Storage policies active
- [ ] Path structure correct

#### API Tests
- [ ] POST /api/projects (create)
- [ ] GET /api/projects (list)
- [ ] GET /api/projects/my (user's projects)
- [ ] GET /api/projects/[id] (details)
- [ ] PATCH /api/projects/[id] (update)
- [ ] DELETE /api/projects/[id] (delete)

#### Frontend Tests
- [ ] Navigation from /create works
- [ ] Form validation works
- [ ] Project creation successful
- [ ] Redirect after creation
- [ ] Error handling works

---

## Troubleshooting

### Common Issues

#### Issue 1: Tables not created
**Symptom:** SQL error when running 01_CREATE_TABLES.sql  
**Solution:**
- Check if tables already exist: `SELECT * FROM design_projects LIMIT 1;`
- Drop existing tables if needed: `DROP TABLE IF EXISTS design_projects CASCADE;`
- Re-run the script

#### Issue 2: RLS policies not working
**Symptom:** Users can't access their own projects  
**Solution:**
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'design_projects';`
- Check policies: `SELECT * FROM pg_policies WHERE tablename = 'design_projects';`
- Test with specific user: Log in and try querying

#### Issue 3: Storage upload fails
**Symptom:** File upload returns 403 or 500  
**Solution:**
- Verify bucket exists: Check Supabase Dashboard → Storage
- Check file size (must be < 20MB)
- Verify MIME type is allowed
- Check storage policies are active
- Ensure path follows pattern: `{user_id}/{project_id}/{filename}`

#### Issue 4: API returns 401 Unauthorized
**Symptom:** All API calls return 401  
**Solution:**
- Check authentication token in request headers
- Verify token is not expired
- Test with fresh login
- Check Supabase auth configuration

---

## Next Steps After Implementation

1. **Create project detail page** at `/app/app/(app)/projects/[slug]/page.tsx`
2. **Create project list page** at `/app/app/(app)/projects/page.tsx`
3. **Implement team management UI**
4. **Add file upload interface**
5. **Create project gallery view**
6. **Add project status tracking**
7. **Implement notifications** for team invites

---

## Summary

This implementation guide covers:
- ✅ 5 database tables with full schema
- ✅ 30+ RLS policies for security
- ✅ 33+ performance indexes
- ✅ Storage bucket configuration
- ✅ API endpoint structure
- ✅ Frontend integration example
- ✅ Testing checklist
- ✅ Troubleshooting guide

Expected implementation time: **4-6 hours** for experienced developers

For questions or issues, refer to similar implementations in:
- `backend-command/collab/` (collaboration pattern)
- `backend-command/gigs/` (CRUD pattern)
- `backend-command/whatson/` (event pattern)