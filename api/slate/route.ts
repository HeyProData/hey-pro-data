import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate
 * Get slate feed (all published posts)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: Fetch from slate_posts where status = 'published'
    // Include media, author profile, likes/comments/shares count
    // Order by created_at DESC
    // Pagination

    return NextResponse.json(
      successResponse(
        { posts: [], pagination: { page, limit, total: 0 } },
        'Slate feed retrieved'
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
 * POST /api/slate
 * Create a new slate post
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

    // TODO: Validate content (max 5000 chars)
    // Generate slug
    // Insert into slate_posts
    // Insert media into slate_media if provided

    return NextResponse.json(
      successResponse(null, 'Slate post created'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
