import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/recommendations
 * Get recommended profiles ("People also viewed")
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

    // Fetch recommendations with profile photos from user_profiles
    const { data: recommendations, error } = await supabase
      .from('user_recommendations')
      .select(`
        id,
        recommended_user_id,
        created_at,
        user_profiles!user_recommendations_recommended_user_id_fkey(
          user_id,
          first_name,
          surname,
          profile_photo_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Recommendations fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch recommendations', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(recommendations || [], 'Recommendations retrieved successfully'),
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
 * POST /api/profile/recommendations
 * Add a recommendation
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
    const { recommended_user_id } = body;

    // Validate required fields
    if (!recommended_user_id) {
      return NextResponse.json(
        errorResponse('Recommended user ID is required'),
        { status: 400 }
      );
    }

    // Validate not recommending self
    if (recommended_user_id === user.id) {
      return NextResponse.json(
        errorResponse('Cannot recommend yourself'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_recommendations')
      .insert({
        user_id: user.id,
        recommended_user_id
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('This recommendation already exists'),
          { status: 409 }
        );
      }
      // Check for check constraint violation (user_id = recommended_user_id)
      if (error.code === '23514') {
        return NextResponse.json(
          errorResponse('Cannot recommend yourself'),
          { status: 400 }
        );
      }
      console.error('Recommendation creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add recommendation', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Recommendation added successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/recommendations
 * Delete a recommendation
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        errorResponse('Recommendation ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Recommendation deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete recommendation', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Recommendation deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
