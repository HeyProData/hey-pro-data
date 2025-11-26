import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/whatson/[id]/rsvp
 * Create an RSVP for an event
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
    const eventId = params.id;

    // TODO: Check available spots
    // Validate number_of_spots <= max_spots_per_person
    // Generate ticket_number (WO-2025-NNNNNN)
    // Generate reference_number (#ALPHANUMERIC13)
    // Set payment_status based on event.is_paid
    // Insert into whatson_rsvps with UNIQUE constraint
    // Insert selected dates into whatson_rsvp_dates

    return NextResponse.json(
      successResponse(
        { ticket_number: '', reference_number: '' },
        'RSVP created'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatson/[id]/rsvp
 * Cancel an RSVP
 */
export async function DELETE(
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

    // TODO: Update whatson_rsvps set status = 'cancelled' where event_id = eventId AND user_id = user.id
    // Or DELETE if cancellation policy allows

    return NextResponse.json(
      successResponse(null, 'RSVP cancelled'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
