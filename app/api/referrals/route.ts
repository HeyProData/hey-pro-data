import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/referrals
 * Get user's referrals (sent and received)
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

    const supabase = createServerClient();

    // Fetch referrals where user is either referrer or referred
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*')
      .or(`referrer_user_id.eq.${user.id},referred_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Referrals fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch referrals', error.message),
        { status: 500 }
      );
    }

    // Enrich referrals with user information
    const enrichedReferrals = await Promise.all(
      (referrals || []).map(async (referral) => {
        // Fetch referrer profile
        const { data: referrerProfile } = await supabase
          .from('user_profiles')
          .select('id, name, profile_photo_url')
          .eq('user_id', referral.referrer_user_id)
          .maybeSingle();

        // Fetch referred user profile
        const { data: referredProfile } = await supabase
          .from('user_profiles')
          .select('id, name, profile_photo_url')
          .eq('user_id', referral.referred_user_id)
          .maybeSingle();

        return {
          id: referral.id,
          referrer: referrerProfile ? {
            id: referrerProfile.id,
            name: referrerProfile.name,
            avatar: referrerProfile.profile_photo_url
          } : null,
          referred: referredProfile ? {
            id: referredProfile.id,
            name: referredProfile.name,
            avatar: referredProfile.profile_photo_url
          } : null,
          contextType: referral.context_type,
          contextId: referral.context_id,
          message: referral.message,
          status: referral.status,
          createdAt: referral.created_at
        };
      })
    );

    return NextResponse.json(
      successResponse(enrichedReferrals, 'Referrals retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/referrals:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/referrals
 * Create a referral
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
    const { referred_user_id, context_type, context_id, message } = body;

    // Validate required fields
    if (!referred_user_id) {
      return NextResponse.json(
        errorResponse('Referred user ID is required'),
        { status: 400 }
      );
    }

    // Prevent self-referral
    if (referred_user_id === user.id) {
      return NextResponse.json(
        errorResponse('You cannot refer yourself'),
        { status: 400 }
      );
    }

    // Insert referral
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_user_id: user.id,
        referred_user_id,
        context_type: context_type || 'general',
        context_id,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (referralError) {
      console.error('Referral creation error:', referralError);
      return NextResponse.json(
        errorResponse('Failed to create referral', referralError.message),
        { status: 500 }
      );
    }

    // Create notification for the referred user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: referred_user_id,
        actor_id: user.id,
        type: 'referral_received',
        title: 'New Referral',
        message: message || 'You have been referred for an opportunity',
        metadata: {
          referral_id: referral.id,
          context_type,
          context_id
        },
        is_read: false
      });

    if (notificationError) {
      console.error('Notification creation error:', notificationError);
      // Don't fail the referral if notification fails
    }

    return NextResponse.json(
      successResponse(referral, 'Referral created successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/referrals:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
