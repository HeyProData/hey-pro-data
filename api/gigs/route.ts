import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/gigs
 * Get all gigs (public access with pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Fetch from gigs table with pagination
    // Include gig_dates, gig_locations
    // Filter by status = 'active'

    return NextResponse.json(
      successResponse({ gigs: [], pagination: { page, limit, total: 0 } }, 'Gigs retrieved'),
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
 * POST /api/gigs
 * Create a new gig (requires complete profile)
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

    // TODO: Check profile completeness
    // Insert into gigs table
    // Insert gig_dates records
    // Insert gig_locations records
    // Generate slug from title

    return NextResponse.json(
      successResponse(null, 'Gig created successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
