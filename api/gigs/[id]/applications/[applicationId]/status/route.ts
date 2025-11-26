import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/gigs/[id]/applications/[applicationId]/status
 * Update application status (creator only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
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
    const gigId = params.id;
    const applicationId = params.applicationId;

    // TODO: Verify user is gig creator
    // Update applications table status (pending/shortlisted/confirmed/released)
    // Create notification for applicant

    return NextResponse.json(
      successResponse(null, 'Application status updated'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
