import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab
 * Get all collab posts (public feed with pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'open';
    const tag = searchParams.get('tag');

    // TODO: Fetch from collab_posts where status IN ('open', 'closed')
    // Include tags, interest count, author profile
    // Filter by tag if provided
    // Pagination and sorting

    return NextResponse.json(
      successResponse(
        { posts: [], pagination: { page, limit, total: 0 } },
        'Collab posts retrieved'
      ),
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
 * POST /api/collab
 * Create a new collab post
 */
export async function POST(request: NextRequest) {
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

    // TODO: Validate title (3-200 chars), summary (10-5000 chars)
    // Generate slug from title
    // Insert into collab_posts
    // Insert tags into collab_tags

    return NextResponse.json(
      successResponse(null, 'Collab post created'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
