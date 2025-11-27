import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/visa
 * Get user's visa information (1:1 relationship)
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

    const { data: visaInfo, error } = await supabase
      .from('user_visa_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // No visa info found
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          successResponse(null, 'No visa information found'),
          { status: 200 }
        );
      }
      console.error('Visa info fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch visa information', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(visaInfo, 'Visa information retrieved successfully'),
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
 * POST /api/profile/visa
 * Create visa information
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
    const { visa_type, issued_by, expiry_date } = body;

    const { data, error } = await supabase
      .from('user_visa_info')
      .insert({
        user_id: user.id,
        visa_type,
        issued_by,
        expiry_date
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('Visa information already exists. Use PATCH to update.'),
          { status: 409 }
        );
      }
      console.error('Visa creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to create visa information', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Visa information created successfully'),
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
 * PATCH /api/profile/visa
 * Update visa information
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
    const { visa_type, issued_by, expiry_date } = body;

    const updateData: any = {};
    if (visa_type !== undefined) updateData.visa_type = visa_type;
    if (issued_by !== undefined) updateData.issued_by = issued_by;
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date;

    const { data, error } = await supabase
      .from('user_visa_info')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Visa update error:', error);
      return NextResponse.json(
        errorResponse('Failed to update visa information', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Visa information updated successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
