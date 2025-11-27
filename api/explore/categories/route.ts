import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/explore/categories
 * Get all unique role categories
 * Public access
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Query all distinct role names from user_roles
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role_name')
      .order('role_name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch categories', error.message),
        { status: 500 }
      );
    }

    // Get unique role names
    const uniqueRoles = [...new Set(roles?.map(r => r.role_name) || [])];

    // Sort alphabetically
    const sortedRoles = uniqueRoles.sort((a, b) => a.localeCompare(b));

    return NextResponse.json(
      successResponse(
        { categories: sortedRoles },
        'Categories retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/explore/categories:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
