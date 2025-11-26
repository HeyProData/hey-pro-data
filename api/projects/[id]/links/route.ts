import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/projects/[id]/links
 * Get project links
 * PENDING IMPLEMENTATION - v2.6
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // TODO: Fetch from project_links ordered by sort_order
    // Check project privacy and user access

    return NextResponse.json(
      successResponse([], 'Project links retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/links
 * Add a project link (team members with contribute/admin permission)
 * PENDING IMPLEMENTATION - v2.6
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const projectId = params.id;

    // TODO: Verify user has contribute or admin permission
    // Insert into project_links

    return NextResponse.json(
      successResponse(null, 'Link added'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
