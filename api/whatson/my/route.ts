import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/my
 * Get user's events (all statuses)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch user's events (all statuses)
    const { data: events, error: eventsError, count } = await supabase
      .from('whatson_events')
      .select('*', { count: 'exact' })
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventsError) {
      return NextResponse.json(
        errorResponse('Failed to fetch events', eventsError.message),
        { status: 500 }
      );
    }

    // Enrich events with schedule, tags, and RSVP count
    const enrichedEvents = await Promise.all(
      (events || []).map(async (event) => {
        // Fetch schedule
        const { data: schedule } = await supabase
          .from('whatson_schedule')
          .select('*')
          .eq('event_id', event.id)
          .order('sort_order', { ascending: true });

        // Fetch tags
        const { data: eventTags } = await supabase
          .from('whatson_tags')
          .select('tag_name')
          .eq('event_id', event.id);

        // Count RSVPs
        const { count: rsvpCount } = await supabase
          .from('whatson_rsvps')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'confirmed');

        // Calculate total spots booked
        const { data: rsvps } = await supabase
          .from('whatson_rsvps')
          .select('number_of_spots')
          .eq('event_id', event.id)
          .eq('status', 'confirmed');

        const spotsBooked = rsvps?.reduce((sum, rsvp) => sum + rsvp.number_of_spots, 0) || 0;

        return {
          ...event,
          schedule: schedule || [],
          tags: eventTags?.map(t => t.tag_name) || [],
          rsvp_count: rsvpCount || 0,
          spots_booked: spotsBooked,
          is_fully_booked: !event.is_unlimited_spots && spotsBooked >= (event.total_spots || 0)
        };
      })
    );

    return NextResponse.json(
      successResponse(
        {
          events: enrichedEvents,
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
          }
        },
        'User events retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/whatson/my error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
