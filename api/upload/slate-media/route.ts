import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/slate-media
 * Upload slate post media (images/videos)
 * Bucket: slate-media/ (Public)
 * Max Size: 10 MB
 * Allowed Types: JPEG, JPG, PNG, WebP, MP4, MOV, AVI
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
    // Validate file size (max 10MB)
    // Validate file type
    // Upload to Supabase Storage: slate-media/{user_id}/{post_id}/{filename}
    // Return public URL and media_type

    return NextResponse.json(
      successResponse({ url: '', media_type: 'image' }, 'Slate media uploaded'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
