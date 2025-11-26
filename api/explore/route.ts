import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/explore
 * Search and filter crew profiles (Explore/Crew Directory)
 * Public access with optional authentication
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const role = searchParams.get('role');
    const category = searchParams.get('category');
    const availability = searchParams.get('availability');
    const productionType = searchParams.get('productionType');
    const location = searchParams.get('location');
    const experienceLevel = searchParams.get('experienceLevel');
    const minRate = searchParams.get('minRate');
    const maxRate = searchParams.get('maxRate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // TODO: Fetch from user_profiles where visible_in_explore = true
    // Apply filters: keyword, role, category, availability, productionType, location, experienceLevel, rate range
    // Join with user_roles for role filtering
    // Include avatar, banner, bio, roles, location, day_rate, etc.
    // Pagination and sorting

    return NextResponse.json(
      successResponse(
        { 
          profiles: [], 
          pagination: { currentPage: page, totalPages: 0, totalProfiles: 0, limit } 
        },
        'Profiles retrieved'
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
