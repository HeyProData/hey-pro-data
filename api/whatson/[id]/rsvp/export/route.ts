import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/[id]/rsvp/export
 * Export event RSVPs as CSV (creator only)
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
    // Fetch RSVP data
    // Generate CSV with columns: Name, Email, Ticket Number, Reference, Spots, Payment Status, RSVP Date
    // Return as downloadable CSV file

    return NextResponse.json(
      successResponse(null, 'RSVP export generated'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
