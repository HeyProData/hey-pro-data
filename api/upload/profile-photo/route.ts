import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/profile-photo
 * Upload profile photo or banner
 * Bucket: profile-photos/ (Public)
 * Max Size: 2 MB
 * Allowed Types: JPEG, PNG, WebP
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

    // TODO: Handle multipart/form-data upload
    // Validate file size (max 2MB)
    // Validate file type (JPEG, PNG, WebP)
    // Upload to Supabase Storage: profile-photos/{user_id}/{filename}
    // Return public URL

    return NextResponse.json(
      successResponse({ url: '' }, 'Profile photo uploaded'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
