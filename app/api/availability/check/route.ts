import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/availability/check
 * Check for availability conflicts in a date range
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
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // Validate date parameters
    if (!fromDate || !toDate) {
      return NextResponse.json(
        errorResponse('Both from_date and to_date are required'),
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      return NextResponse.json(
        errorResponse('Dates must be in YYYY-MM-DD format'),
        { status: 400 }
      );
    }

    // Check for conflicts (dates marked as 'hold' or 'na')
    const { data: conflicts, error } = await supabase
      .from('crew_availability')
      .select('*')
      .eq('user_id', user.id)
      .gte('availability_date', fromDate)
      .lte('availability_date', toDate)
      .in('status', ['hold', 'na'])
      .order('availability_date', { ascending: true });

    if (error) {
      console.error('Availability check error:', error);
      return NextResponse.json(
        errorResponse('Failed to check availability', error.message),
        { status: 500 }
      );
    }

    const hasConflict = conflicts && conflicts.length > 0;
    const conflictDates = conflicts?.map(c => ({
      date: c.availability_date,
      status: c.status
    })) || [];

    return NextResponse.json(
      successResponse(
        {
          hasConflict,
          conflictCount: conflicts?.length || 0,
          conflicts: conflictDates
        },
        'Conflict check completed'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/availability/check:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
