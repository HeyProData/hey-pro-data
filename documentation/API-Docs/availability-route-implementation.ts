// ACTION FILE: Availability Route Implementation
// File: /app/api/availability/route.ts
// Replace the existing placeholder with this implementation

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/availability
 * Get user's availability calendar
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
    
    // Parse query parameters for filtering
    const month = searchParams.get('month'); // Format: YYYY-MM
    const year = searchParams.get('year');   // Format: YYYY

    // Build query
    let query = supabase
      .from('crew_availability')
      .select('*')
      .eq('user_id', user.id)
      .order('availability_date', { ascending: true });

    // Apply month filter if provided
    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      query = query.gte('availability_date', startDate).lte('availability_date', endDate);
    } else if (year) {
      // Apply year filter if provided
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('availability_date', startDate).lte('availability_date', endDate);
    }

    const { data: availability, error } = await query;

    if (error) {
      console.error('Availability fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch availability', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(availability || [], 'Availability retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/availability:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability
 * Set availability for a date (upsert)
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
    const { availability_date, status } = body;

    // Validate required fields
    if (!availability_date) {
      return NextResponse.json(
        errorResponse('Availability date is required'),
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['available', 'hold', 'na'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        errorResponse('Status must be one of: available, hold, na'),
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(availability_date)) {
      return NextResponse.json(
        errorResponse('Date must be in YYYY-MM-DD format'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Use upsert to handle duplicates (insert or update)
    const { data: availability, error } = await supabase
      .from('crew_availability')
      .upsert({
        user_id: user.id,
        availability_date,
        status
      }, {
        onConflict: 'user_id,availability_date'
      })
      .select()
      .single();

    if (error) {
      console.error('Availability set error:', error);
      return NextResponse.json(
        errorResponse('Failed to set availability', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(availability, 'Availability set successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/availability:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
