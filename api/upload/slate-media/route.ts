import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postId = formData.get('post_id') as string | null;
    
    if (!file) {
      return NextResponse.json(
        errorResponse('No file provided'),
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        errorResponse('Invalid file type. Allowed: JPEG, PNG, WebP, MP4, MOV, AVI'),
        { status: 415 }
      );
    }

    // Validate file size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        errorResponse('File too large. Maximum size is 10MB'),
        { status: 413 }
      );
    }

    const supabase = createServerClient();

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Build file path
    const filePath = postId 
      ? `${user.id}/${postId}/${fileName}`
      : `${user.id}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('slate-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        errorResponse('Failed to upload file', uploadError.message),
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('slate-media')
      .getPublicUrl(filePath);

    // Determine media type
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    return NextResponse.json(
      successResponse(
        {
          url: publicUrlData.publicUrl,
          path: filePath,
          size: file.size,
          mimeType: file.type,
          mediaType,
          fileName: file.name
        },
        'Slate media uploaded successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
