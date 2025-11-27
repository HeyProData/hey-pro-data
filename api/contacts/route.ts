import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/contacts
 * Add a contact to a gig
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

    const supabase = createServerClient();
    const body = await request.json();
    const { gig_id, contact_name, contact_email, contact_phone, role } = body;

    // Validate required fields
    if (!gig_id || !contact_name) {
      return NextResponse.json(
        errorResponse('Gig ID and contact name are required'),
        { status: 400 }
      );
    }

    // Verify user is the gig creator
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('creator_user_id')
      .eq('id', gig_id)
      .maybeSingle();

    if (gigError) {
      console.error('Gig fetch error:', gigError);
      return NextResponse.json(
        errorResponse('Failed to verify gig ownership', gigError.message),
        { status: 500 }
      );
    }

    if (!gig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    if (gig.creator_user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Only the gig creator can add contacts'),
        { status: 403 }
      );
    }

    // Insert contact
    const { data: contact, error: contactError } = await supabase
      .from('crew_contacts')
      .insert({
        gig_id,
        contact_name,
        contact_email,
        contact_phone,
        role
      })
      .select()
      .single();

    if (contactError) {
      console.error('Contact creation error:', contactError);
      return NextResponse.json(
        errorResponse('Failed to add contact', contactError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(contact, 'Contact added successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/contacts:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
