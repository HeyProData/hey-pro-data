import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

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

    // TODO: Fetch from collab_collaborators with user profiles
    // Public access

    return NextResponse.json(
      successResponse([], 'Collaborators retrieved'),
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

    const body = await request.json();
    const collabId = params.id;

    // TODO: Verify user is post owner
    // Insert into collab_collaborators with role and department
    // UNIQUE constraint on (collab_id, user_id)

    return NextResponse.json(
      successResponse(null, 'Collaborator added'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
