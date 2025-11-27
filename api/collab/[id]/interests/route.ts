import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/[id]/interests
 * Get list of interested users (owner only)
 */
export async function GET(
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

    const collabId = params.id;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Verify ownership
    const { data: collab, error: fetchError } = await supabase
      .from('collab_posts')
      .select('user_id')
      .eq('id', collabId)
      .single();

    if (fetchError || !collab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    if (collab.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Forbidden: Only the owner can view interested users'),
        { status: 403 }
      );
    }

    // Fetch interested users with pagination
    const { data: interests, error, count } = await supabase
      .from('collab_interests')
      .select(`
        id,
        created_at,
        user:user_id(
          id,
          raw_user_meta_data
        )
      `, { count: 'exact' })
      .eq('collab_id', collabId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching interests:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch interested users', error.message),
        { status: 500 }
      );
    }

    // Format interested users
    const formattedInterests = (interests || []).map((interest: any) => ({
      id: interest.id,
      user: {
        id: interest.user?.id,
        name: interest.user?.raw_user_meta_data?.name || interest.user?.raw_user_meta_data?.full_name || 'Unknown',
        avatar: interest.user?.raw_user_meta_data?.avatar_url || interest.user?.raw_user_meta_data?.profile_photo_url || '/placeholder-avatar.png',
        bio: interest.user?.raw_user_meta_data?.bio || ''
      },
      created_at: interest.created_at
    }));

    const totalInterests = count || 0;
    const totalPages = Math.ceil(totalInterests / limit);

    return NextResponse.json(
      successResponse(
        {
          interests: formattedInterests,
          pagination: {
            currentPage: page,
            totalPages,
            totalInterests,
            limit
          }
        },
        'Interested users retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab/[id]/interests:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
