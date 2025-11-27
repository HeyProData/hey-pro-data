import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/rsvps/my
 * Get user's RSVPs
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
    const status = searchParams.get('status'); // Filter by RSVP status

    // Build query
    let query = supabase
      .from('whatson_rsvps')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: rsvps, error: rsvpsError, count } = await query;

    if (rsvpsError) {
      return NextResponse.json(
        errorResponse('Failed to fetch RSVPs', rsvpsError.message),
        { status: 500 }
      );
    }

    // Enrich RSVPs with event details and selected dates
    const enrichedRsvps = await Promise.all(
      (rsvps || []).map(async (rsvp) => {
        // Fetch event details
        const { data: event } = await supabase
          .from('whatson_events')
          .select(`
            id,
            title,
            slug,
            location,
            is_online,
            is_paid,
            price_amount,
            price_currency,
            thumbnail_url,
            status
          `)
          .eq('id', rsvp.event_id)
          .maybeSingle();

        // Fetch selected dates
        const { data: rsvpDates } = await supabase
          .from('whatson_rsvp_dates')
          .select(`
            schedule_id,
            whatson_schedule (
              event_date,
              start_time,
              end_time,
              timezone
            )
          `)
          .eq('rsvp_id', rsvp.id);

        return {
          ...rsvp,
          event: event || null,
          selected_dates: rsvpDates || []
        };
      })
    );

    return NextResponse.json(
      successResponse(
        {
          rsvps: enrichedRsvps,
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
          }
        },
        'User RSVPs retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/whatson/rsvps/my error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
