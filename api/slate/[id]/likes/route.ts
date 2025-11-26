import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/server';

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

    // TODO: Fetch from slate_likes with user profiles
    // Public access

    return NextResponse.json(
      successResponse([], 'Likes retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
