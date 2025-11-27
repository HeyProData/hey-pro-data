import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate/my
 * Get user's slate posts (all statuses)
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const status = searchParams.get('status'); // Filter by status if provided

    const supabase = createServerClient();

    // Build query
    let query = supabase
      .from('slate_posts')
      .select(`
        id,
        content,
        slug,
        status,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        updated_at,
        media:slate_media(
          id,
          media_url,
          media_type,
          sort_order
        )
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Filter by status if provided
    if (status && ['published', 'draft', 'archived'].includes(status)) {
      query = query.eq('status', status);
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    // Pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch posts', error.message),
        { status: 500 }
      );
    }

    // Format response
    const formattedPosts = posts?.map(post => ({
      id: post.id,
      content: post.content,
      slug: post.slug,
      status: post.status,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      shares_count: post.shares_count,
      created_at: post.created_at,
      updated_at: post.updated_at,
      media: post.media?.sort((a, b) => a.sort_order - b.sort_order) || [],
    })) || [];

    return NextResponse.json(
      successResponse(
        {
          posts: formattedPosts,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'User slate posts retrieved'
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
