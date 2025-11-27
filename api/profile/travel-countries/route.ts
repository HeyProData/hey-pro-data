import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/travel-countries
 * Get countries available for work travel
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

    const { data: countries, error } = await supabase
      .from('user_travel_countries')
      .select('*')
      .eq('user_id', user.id)
      .order('country_name', { ascending: true });

    if (error) {
      console.error('Travel countries fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch travel countries', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(countries || [], 'Travel countries retrieved successfully'),
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
 * POST /api/profile/travel-countries
 * Add a travel country
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
    const { country_code, country_name } = body;

    // Validate required fields
    if (!country_code || !country_name) {
      return NextResponse.json(
        errorResponse('Country code and country name are required'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_travel_countries')
      .insert({
        user_id: user.id,
        country_code,
        country_name
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('This country is already in your travel list'),
          { status: 409 }
        );
      }
      console.error('Travel country creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add travel country', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Travel country added successfully'),
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
 * DELETE /api/profile/travel-countries
 * Delete a travel country
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
        errorResponse('Country ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_travel_countries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Travel country deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete travel country', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Travel country deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
