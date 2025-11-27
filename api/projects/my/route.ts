import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/projects/my
 * Get user's projects (all statuses and privacy levels)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const privacy = searchParams.get('privacy');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = createServerClient();

    // Build query for user's projects
    let query = supabase
      .from('design_projects')
      .select(`
        *,
        tags:project_tags(tag_name),
        team:project_team(count),
        files:project_files(count)
      `)
      .eq('user_id', user.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (privacy) {
      query = query.eq('privacy', privacy);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching user projects:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch projects', error.message),
        { status: 500 }
      );
    }

    // Format response
    const formattedProjects = (projects || []).map((project: any) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      project_type: project.project_type,
      status: project.status,
      privacy: project.privacy,
      thumbnail_url: project.thumbnail_url,
      hero_image_url: project.hero_image_url,
      location: project.location,
      is_remote: project.is_remote,
      start_date: project.start_date,
      end_date: project.end_date,
      estimated_duration: project.estimated_duration,
      budget_amount: project.budget_amount,
      budget_currency: project.budget_currency,
      tags: project.tags?.map((t: any) => t.tag_name) || [],
      team_count: project.team?.[0]?.count || 0,
      files_count: project.files?.[0]?.count || 0,
      created_at: project.created_at,
      updated_at: project.updated_at
    }));

    return NextResponse.json(
      successResponse(
        formattedProjects,
        'User projects retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/projects/my:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
