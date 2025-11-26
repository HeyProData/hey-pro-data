import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/explore/[userId]
 * Get detailed profile for a specific user
 * Public access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // TODO: Fetch complete profile from user_profiles
    // Include: links, roles, languages, travel_countries, skills, credits, highlights, recommendations
    // Public data only (no visa info)

    return NextResponse.json(
      successResponse(null, 'Profile retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
