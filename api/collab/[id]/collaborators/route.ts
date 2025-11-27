import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/[id]/collaborators
 * Get list of collaborators (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collabId = params.id;
    const supabase = createServerClient();

    // Fetch collaborators with user details
    const { data: collaborators, error } = await supabase
      .from('collab_collaborators')
      .select(`
        id,
        role,
        department,
        added_at,
        user:user_id(
          id,
          raw_user_meta_data
        ),
        added_by_user:added_by(
          id,
          raw_user_meta_data
        )
      `)
      .eq('collab_id', collabId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching collaborators:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch collaborators', error.message),
        { status: 500 }
      );
    }

    // Format collaborators
    const formattedCollaborators = (collaborators || []).map((collab: any) => ({
      id: collab.id,
      user: {
        id: collab.user?.id,
        name: collab.user?.raw_user_meta_data?.name || collab.user?.raw_user_meta_data?.full_name || 'Unknown',
        avatar: collab.user?.raw_user_meta_data?.avatar_url || collab.user?.raw_user_meta_data?.profile_photo_url || '/placeholder-avatar.png'
      },
      role: collab.role,
      department: collab.department,
      added_at: collab.added_at,
      added_by: {
        id: collab.added_by_user?.id,
        name: collab.added_by_user?.raw_user_meta_data?.name || collab.added_by_user?.raw_user_meta_data?.full_name || 'Unknown'
      }
    }));

    return NextResponse.json(
      successResponse(
        { collaborators: formattedCollaborators },
        'Collaborators retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab/[id]/collaborators:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/collab/[id]/collaborators
 * Add a collaborator (owner only)
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

    const collabId = params.id;
    const body = await request.json();
    const { user_id, role, department } = body;

    if (!user_id) {
      return NextResponse.json(
        errorResponse('user_id is required'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

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
        errorResponse('Forbidden: Only the owner can add collaborators'),
        { status: 403 }
      );
    }

    // Check if user exists (optional - Supabase FK will handle this)
    const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    // Check if already a collaborator
    const { data: existingCollaborator } = await supabase
      .from('collab_collaborators')
      .select('id')
      .eq('collab_id', collabId)
      .eq('user_id', user_id)
      .single();

    if (existingCollaborator) {
      return NextResponse.json(
        errorResponse('User is already a collaborator'),
        { status: 409 }
      );
    }

    // Add collaborator
    const { data: collaborator, error: insertError } = await supabase
      .from('collab_collaborators')
      .insert({
        collab_id: collabId,
        user_id: user_id,
        role: role || null,
        department: department || null,
        added_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding collaborator:', insertError);
      return NextResponse.json(
        errorResponse('Failed to add collaborator', insertError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          id: collaborator.id,
          collab_id: collaborator.collab_id,
          user_id: collaborator.user_id,
          role: collaborator.role,
          department: collaborator.department,
          added_at: collaborator.added_at,
          added_by: collaborator.added_by
        },
        'Collaborator added successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/collab/[id]/collaborators:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
