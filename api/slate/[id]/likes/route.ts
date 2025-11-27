import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate/[id]/likes
 * Get list of users who liked the post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = createServerClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('slate_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Post not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch post', postError.message),
        { status: 500 }
      );
    }

    // Fetch likes with user profiles
    const from = (page - 1) * limit;
    const { data: likes, error, count } = await supabase
      .from('slate_likes')
      .select(`
        id,
        created_at,
        user:user_id (
          id,
          alias_first_name,
          alias_surname,
          profile_photo_url
        )
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch likes', error.message),
        { status: 500 }
      );
    }

    // Format response
    const formattedLikes = likes?.map(like => ({
      id: like.id,
      created_at: like.created_at,
      user: {
        id: like.user?.id,
        name: `${like.user?.alias_first_name || ''} ${like.user?.alias_surname || ''}`.trim(),
        avatar: like.user?.profile_photo_url || '',
      },
    })) || [];

    return NextResponse.json(
      successResponse(
        {
          likes: formattedLikes,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'Likes retrieved'
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
