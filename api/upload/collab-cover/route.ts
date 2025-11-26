import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/collab-cover
 * Upload collab post cover image
 * Bucket: collab-covers/ (Public)
 * Max Size: 5 MB
 * Allowed Types: JPEG, JPG, PNG
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
    // Validate file size (max 5MB)
    // Validate file type (JPEG, JPG, PNG)
    // Upload to Supabase Storage: collab-covers/{user_id}/{collab_id}/{filename}
    // Return public URL

    return NextResponse.json(
      successResponse({ url: '' }, 'Collab cover uploaded'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
