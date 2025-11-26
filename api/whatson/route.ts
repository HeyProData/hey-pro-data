import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson
 * Get all What's On events (public feed with pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'published';
    const isPaid = searchParams.get('isPaid');
    const isOnline = searchParams.get('isOnline');

    // TODO: Fetch from whatson_events where status = 'published'
    // Include schedule, tags, thumbnail, RSVP count
    // Filter by isPaid, isOnline if provided
    // Pagination and sorting

    return NextResponse.json(
      successResponse(
        { events: [], pagination: { page, limit, total: 0 } },
        'Events retrieved'
      ),
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
 * POST /api/whatson
 * Create a new event
 */
export async function POST(request: NextRequest) {
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

    // TODO: Validate title (3-200 chars), description (max 10000 chars)
    // Validate location if not online
    // Validate total_spots if not unlimited
    // Generate slug from title
    // Insert into whatson_events
    // Insert schedule into whatson_schedule
    // Insert tags into whatson_tags

    return NextResponse.json(
      successResponse(null, 'Event created'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
