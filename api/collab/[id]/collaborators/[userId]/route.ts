import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * DELETE /api/collab/[id]/collaborators/[userId]
 * Remove a collaborator (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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
    const collaboratorUserId = params.userId;

    // TODO: Verify user is post owner
    // Delete from collab_collaborators where collab_id = collabId AND user_id = collaboratorUserId

    return NextResponse.json(
      successResponse(null, 'Collaborator removed'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
