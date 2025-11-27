# Frontend Analysis: Create Project Feature

## Location
**Path:** `/app/app/(app)/create/page.tsx`

## Current UI State

### Page Structure
The create page presents users with two main options:

1. **Design Project** (Primary Color: #FA6E80 - Pink/Red)
   - Icon: Folder
   - Title: "Design Project"
   - Description: "Define your project details"
   - Purpose: Create structured design projects

2. **Add Gigs** (Primary Color: #31A7AC - Teal)
   - Icon: Folder
   - Title: "Add Gigs"
   - Description: "Create roles for your team"
   - Purpose: Post job opportunities (ALREADY IMPLEMENTED)

## Analysis: Frontend vs Backend Gap

### ✅ What Already Exists in Backend

**Add Gigs Feature** - Fully implemented with:
- `gigs` table with 20+ fields including slug, crew_count, role, type, department, company, expiry_date, etc.
- `gig_dates` table for scheduling
- `gig_locations` table for multiple locations
- `gig_references` table for supporting files/links
- `applications` table for job applications
- Complete API endpoints at `/api/gigs/`
- Storage bucket for gig-related files
- Comprehensive RLS policies

### ❌ What's Missing in Backend

**Design Project Feature** - NOT implemented at all:
- No `projects` or `design_projects` table
- No project-related API endpoints
- No storage bucket for project assets
- No RLS policies for project access
- No relationship tables for project team members

## Feature Requirements Analysis

### Design Project Feature Needs

Based on the UI hint "Define your project details" and comparing with similar features (Collab, What's On), a Design Project likely needs:

#### Core Project Information
1. **Basic Details:**
   - Project title/name
   - Project description/summary
   - Project type (commercial, film, tv, social, digital, etc.)
   - Project status (draft, active, in-progress, completed, archived, cancelled)
   - Timeline (start date, end date, estimated duration)
   - Budget information (optional)
   - Location (physical or remote)

2. **Visual Assets:**
   - Project thumbnail/cover image
   - Hero image for detail page
   - Gallery images/videos

3. **Project Metadata:**
   - Slug (URL-friendly identifier)
   - Created by (user_id)
   - Created date, updated date
   - Privacy settings (public/private/team-only)
   - Tags/categories for organization

4. **Team Management:**
   - Project owner/creator
   - Team members with roles
   - Role assignments (Director, Designer, Editor, etc.)
   - Department assignments (Creative, Technical, Marketing, etc.)
   - Permissions (view-only, contributor, admin)

5. **Project Organization:**
   - Milestones/phases
   - Tasks/deliverables
   - File attachments
   - Notes/documentation
   - Links to external resources

6. **Collaboration Features:**
   - Comments/discussions
   - Activity feed/timeline
   - Notifications for team members
   - Approval workflows

7. **Integration with Existing Features:**
   - Link to gigs (hire people for the project)
   - Link to collab posts (find collaborators)
   - Link to user profiles (team members)

## Comparison with Existing Features

### Similar to Collab Feature
- User-created content
- Team collaboration
- Status tracking (open/closed/draft)
- Tags for categorization
- Cover images
- Interest/application system

### Similar to What's On Events
- Structured information
- Multiple related items (dates, locations)
- RSVP/participation tracking
- Detailed descriptions
- Terms and conditions

### Similar to Gigs Feature
- Creator ownership
- Team/role management
- Applications/hiring
- Reference files
- Status tracking

### Key Differences
- **Design Project** = Long-term creative work container
- **Gig** = Short-term job posting for hiring
- **Collab** = Open call for collaborators
- **What's On** = Time-bound event with RSVPs

## Recommended Database Schema

### Minimal MVP Tables (Phase 1)

#### 1. `design_projects` (Main table)
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users) - Project creator/owner
- title (TEXT, NOT NULL, 3-200 chars)
- slug (TEXT, UNIQUE, NOT NULL)
- description (TEXT, NOT NULL, 10-10000 chars)
- project_type (TEXT) - commercial, film, tv, social, digital, etc.
- status (TEXT) - draft, active, in-progress, completed, archived, cancelled
- start_date (DATE)
- end_date (DATE)
- estimated_duration (INTEGER) - in days
- budget_amount (INTEGER)
- budget_currency (TEXT, default AED)
- location (TEXT)
- is_remote (BOOLEAN, default false)
- thumbnail_url (TEXT) - Card image
- hero_image_url (TEXT) - Detail page banner
- privacy (TEXT) - public, private, team-only
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 2. `project_tags` (Categorization)
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- tag_name (TEXT, NOT NULL, 1-50 chars)
- created_at (TIMESTAMPTZ)
- UNIQUE(project_id, tag_name)
```

#### 3. `project_team` (Team members)
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- user_id (UUID, FK → auth.users)
- role (TEXT) - Director, Designer, Editor, etc.
- department (TEXT) - Creative, Technical, Marketing, etc.
- permission (TEXT) - view, contribute, admin
- added_by (UUID, FK → auth.users)
- added_at (TIMESTAMPTZ)
- UNIQUE(project_id, user_id)
```

#### 4. `project_files` (File attachments)
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- uploaded_by (UUID, FK → auth.users)
- file_name (TEXT, NOT NULL)
- file_url (TEXT, NOT NULL)
- file_type (TEXT) - document, image, video, other
- file_size (INTEGER) - in bytes
- description (TEXT)
- created_at (TIMESTAMPTZ)
```

#### 5. `project_links` (External resources)
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- label (TEXT, NOT NULL)
- url (TEXT, NOT NULL)
- sort_order (INTEGER)
- created_at (TIMESTAMPTZ)
```

### Extended Tables (Phase 2 - Future)

#### 6. `project_milestones`
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- title (TEXT, NOT NULL)
- description (TEXT)
- due_date (DATE)
- status (TEXT) - pending, in-progress, completed
- sort_order (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 7. `project_tasks`
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- milestone_id (UUID, FK → project_milestones, NULL)
- title (TEXT, NOT NULL)
- description (TEXT)
- assigned_to (UUID, FK → auth.users)
- priority (TEXT) - low, medium, high, urgent
- status (TEXT) - todo, in-progress, review, completed
- due_date (DATE)
- created_by (UUID, FK → auth.users)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 8. `project_comments`
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- user_id (UUID, FK → auth.users)
- parent_comment_id (UUID, FK → project_comments, NULL)
- content (TEXT, NOT NULL, max 2000 chars)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 9. `project_activity`
```sql
- id (UUID, PK)
- project_id (UUID, FK → design_projects)
- user_id (UUID, FK → auth.users)
- action_type (TEXT) - created, updated, member_added, file_uploaded, etc.
- details (JSONB) - Flexible metadata
- created_at (TIMESTAMPTZ)
```

## Required Storage Bucket

### `project-assets/` (Mixed access)
- **Purpose:** Project thumbnails, hero images, files, and gallery media
- **Max Size:** 20 MB per file
- **Allowed Types:** Images (JPEG, PNG, WebP), Videos (MP4, MOV), Documents (PDF, DOC, DOCX), Archives (ZIP)
- **Path Structure:** `{user_id}/{project_id}/{filename}`
- **Access Control:**
  - Public read for public projects
  - Team read for team-only projects
  - Private read for private projects
  - Authenticated write to own folder

## Required API Endpoints

### Project CRUD (6 endpoints)
1. `POST /api/projects` - Create new project
2. `GET /api/projects` - List all public projects (browse)
3. `GET /api/projects/my` - Get user's projects
4. `GET /api/projects/[id]` - Get project details
5. `PATCH /api/projects/[id]` - Update project
6. `DELETE /api/projects/[id]` - Delete project

### Team Management (4 endpoints)
7. `GET /api/projects/[id]/team` - List team members
8. `POST /api/projects/[id]/team` - Add team member
9. `PATCH /api/projects/[id]/team/[userId]` - Update member role/permission
10. `DELETE /api/projects/[id]/team/[userId]` - Remove team member

### File Management (3 endpoints)
11. `GET /api/projects/[id]/files` - List project files
12. `POST /api/upload/project-asset` - Upload file
13. `DELETE /api/projects/[id]/files/[fileId]` - Delete file

### Additional Features (3 endpoints)
14. `GET /api/projects/[id]/links` - Get external links
15. `POST /api/projects/[id]/links` - Add external link
16. `DELETE /api/projects/[id]/links/[linkId]` - Delete link

## Implementation Priority

### Phase 1: MVP (Core Functionality)
**Goal:** Allow users to create and manage basic design projects

✅ Must Have:
- Create project with basic info (title, description, type, status)
- Add thumbnail and hero images
- Add tags for categorization
- Add team members with roles
- View project details
- List user's projects
- Update/delete projects
- Privacy settings (public/private/team-only)

❌ Can Skip for MVP:
- Advanced file management
- Comments/discussions
- Milestones and tasks
- Activity feed
- Complex permissions

### Phase 2: Enhanced Features
- File uploads and management
- External links
- Project gallery
- Budget tracking

### Phase 3: Collaboration Features
- Milestones and tasks
- Comments and discussions
- Activity timeline
- Notifications
- Advanced permissions

## Recommended Implementation Approach

1. **Database First:** Create tables with RLS policies
2. **Storage Setup:** Configure project-assets bucket
3. **API Implementation:** Build CRUD endpoints
4. **Frontend Integration:** Connect UI to backend
5. **Testing:** Validate all features work correctly

## Open Questions for User

1. **Feature Scope:** Should we implement full project management (tasks, milestones) or keep it simple (just project info + team)?
2. **Integration:** Should projects link to gigs for hiring? Should there be a way to convert a collab post into a project?
3. **Privacy:** Do we need granular permissions (viewer, editor, admin) or simple team access?
4. **Budget:** Is budget tracking important for MVP?
5. **Timeline:** Are milestones/phases critical or can they be Phase 2?

## Summary

**Current State:** The UI shows "Design Project" option but NO backend support exists.

**Required Work:** Build complete Design Project feature from scratch with:
- 5 core tables (projects, tags, team, files, links)
- Storage bucket for project assets
- 16+ API endpoints
- Comprehensive RLS policies
- Performance indexes

**Estimated Complexity:** Medium-High (similar to Collab + What's On combined)

**Recommendation:** Start with Phase 1 MVP focusing on core project creation and team management, then expand based on user needs.
