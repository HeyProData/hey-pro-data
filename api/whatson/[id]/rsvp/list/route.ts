import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/[id]/rsvp/list
 * Get event RSVPs (creator only)
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

    const eventId = params.id;

    // TODO: Verify user is event creator
    // Fetch from whatson_rsvps with user profiles, selected dates
    // Include ticket_number, reference_number, payment_status, status

    return NextResponse.json(
      successResponse([], 'Event RSVPs retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
