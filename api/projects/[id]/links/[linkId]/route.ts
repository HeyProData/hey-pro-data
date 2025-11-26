import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * DELETE /api/projects/[id]/links/[linkId]
 * Delete a project link (owner or admin only)
 * PENDING IMPLEMENTATION - v2.6
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
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

    const projectId = params.id;
    const linkId = params.linkId;

    // TODO: Verify user is project owner or has admin permission
    // Delete from project_links

    return NextResponse.json(
      successResponse(null, 'Link deleted'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
