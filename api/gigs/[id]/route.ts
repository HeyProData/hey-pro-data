import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/gigs/[id]
 * Get gig details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gigId = params.id;

    // TODO: Fetch from gigs table with related data
    // Include gig_dates, gig_locations, gig_references
    // Public access

    return NextResponse.json(
      successResponse(null, 'Gig retrieved'),
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
 * PATCH /api/gigs/[id]
 * Update a gig (creator only)
 */
export async function PATCH(
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
    const gigId = params.id;

    // TODO: Verify user is gig creator
    // Update gigs table
    // Update related tables if needed

    return NextResponse.json(
      successResponse(null, 'Gig updated'),
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
 * DELETE /api/gigs/[id]
 * Delete a gig (creator only)
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

    const gigId = params.id;

    // TODO: Verify user is gig creator
    // Delete from gigs table (CASCADE will handle related tables)

    return NextResponse.json(
      successResponse(null, 'Gig deleted'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
