import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate/saved
 * Get user's saved/bookmarked slate posts
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

    const supabase = createServerClient();

    // Fetch saved posts with post details
    const from = (page - 1) * limit;
    const { data: savedPosts, error, count } = await supabase
      .from('slate_saved')
      .select(`
        id,
        created_at,
        post:post_id (
          id,
          content,
          slug,
          status,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          updated_at,
          user_id,
          author:user_id (
            id,
            alias_first_name,
            alias_surname,
            profile_photo_url
          ),
          media:slate_media(
            id,
            media_url,
            media_type,
            sort_order
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch saved posts', error.message),
        { status: 500 }
      );
    }

    // Get post IDs for likes check
    const postIds = savedPosts?.map(sp => sp.post?.id).filter(Boolean) || [];
    let userLikes: string[] = [];

    if (postIds.length > 0) {
      const { data: likes } = await supabase
        .from('slate_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);
      userLikes = likes?.map(l => l.post_id) || [];
    }

    // Format response
    const formattedPosts = savedPosts
      ?.filter(sp => sp.post) // Filter out any null posts
      .map(savedPost => ({
        id: savedPost.post.id,
        content: savedPost.post.content,
        slug: savedPost.post.slug,
        status: savedPost.post.status,
        likes_count: savedPost.post.likes_count,
        comments_count: savedPost.post.comments_count,
        shares_count: savedPost.post.shares_count,
        created_at: savedPost.post.created_at,
        updated_at: savedPost.post.updated_at,
        saved_at: savedPost.created_at,
        author: {
          id: savedPost.post.author?.id,
          name: `${savedPost.post.author?.alias_first_name || ''} ${savedPost.post.author?.alias_surname || ''}`.trim(),
          avatar: savedPost.post.author?.profile_photo_url || '',
        },
        media: savedPost.post.media?.sort((a, b) => a.sort_order - b.sort_order) || [],
        user_has_liked: userLikes.includes(savedPost.post.id),
        user_has_saved: true, // Always true for saved posts
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
        'Saved posts retrieved'
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
