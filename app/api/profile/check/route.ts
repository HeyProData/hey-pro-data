import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/check
 * Check profile completion status
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

    // Fetch profile completion data
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('is_profile_complete, profile_completion_percentage')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Profile doesn't exist yet
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          successResponse({ 
            isComplete: false, 
            completionPercentage: 0 
          }, 'No profile found'),
          { status: 200 }
        );
      }
      console.error('Profile check error:', error);
      return NextResponse.json(
        errorResponse('Failed to check profile status', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse({
        isComplete: profile.is_profile_complete || false,
        completionPercentage: profile.profile_completion_percentage || 0
      }, 'Profile status retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
