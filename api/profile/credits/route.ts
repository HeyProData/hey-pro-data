import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/credits
 * Get user's work history and credits
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

    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Credits fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch credits', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(credits || [], 'Credits retrieved successfully'),
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
 * POST /api/profile/credits
 * Add a new credit/work history
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
    const { credit_title, description, start_date, end_date, image_url, sort_order } = body;

    // Validate required fields
    if (!credit_title || !start_date) {
      return NextResponse.json(
        errorResponse('Credit title and start date are required'),
        { status: 400 }
      );
    }

    // Validate date logic
    if (end_date && new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        errorResponse('End date must be after start date'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: user.id,
        credit_title,
        description,
        start_date,
        end_date,
        image_url,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Credit creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add credit', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Credit added successfully'),
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
 * PATCH /api/profile/credits
 * Update a credit
 */
export async function PATCH(request: NextRequest) {
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
    const { id, credit_title, description, start_date, end_date, image_url, sort_order } = body;

    if (!id) {
      return NextResponse.json(
        errorResponse('Credit ID is required'),
        { status: 400 }
      );
    }

    // Validate date logic if both dates are provided
    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        errorResponse('End date must be after start date'),
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (credit_title !== undefined) updateData.credit_title = credit_title;
    if (description !== undefined) updateData.description = description;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data, error } = await supabase
      .from('user_credits')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Credit update error:', error);
      return NextResponse.json(
        errorResponse('Failed to update credit', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Credit updated successfully'),
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
 * DELETE /api/profile/credits
 * Delete a credit
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
        errorResponse('Credit ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_credits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Credit deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete credit', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Credit deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
