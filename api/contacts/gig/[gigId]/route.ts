import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/contacts/gig/[gigId]
 * Get all contacts for a gig
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { gigId: string } }
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

    const gigId = params.gigId;

    // TODO: Fetch from crew_contacts where gig_id = gigId
    // Verify user is the gig creator

    return NextResponse.json(
      successResponse([], 'Contacts retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
