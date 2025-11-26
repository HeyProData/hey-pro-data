import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/explore/categories
 * Get all role categories with counts
 * Public access
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Query user_roles to get all unique categories
    // Count profiles for each category
    // Group related roles by category (e.g., Director, Assistant Director -> Director category)
    // Return with slug, title, count, and roles list

    const categories = [
      // Example structure:
      // { slug: 'director', title: 'Director', count: 25, roles: ['Director', 'Director | Commercial', 'Assistant Director'] }
    ];

    return NextResponse.json(
      successResponse({ categories }, 'Categories retrieved'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
