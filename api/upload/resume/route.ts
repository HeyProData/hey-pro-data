import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/resume
 * Upload resume file
 * Bucket: resumes/ (Private)
 * Max Size: 5 MB
 * Allowed Types: PDF, DOC, DOCX
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
    // Validate file type (PDF, DOC, DOCX)
    // Upload to Supabase Storage: resumes/{user_id}/{filename}
    // Return public URL

    return NextResponse.json(
      successResponse({ url: '' }, 'Resume uploaded'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
