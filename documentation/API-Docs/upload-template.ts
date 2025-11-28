// ACTION FILE: Generic Upload Template
// Use this as a template for all upload endpoints
// Customize: bucket name, max size, allowed types

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/[endpoint-name]
 * Upload file to Supabase Storage
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

    // 1. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        errorResponse('No file provided'),
        { status: 400 }
      );
    }

    // 2. Validate file type
    // CUSTOMIZE THIS: Add allowed types for your endpoint
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        errorResponse('Invalid file type. Allowed: JPEG, PNG, WebP, PDF'),
        { status: 415 }
      );
    }

    // 3. Validate file size
    // CUSTOMIZE THIS: Set max size for your endpoint
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        errorResponse(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`),
        { status: 413 }
      );
    }

    const supabase = createServerClient();

    // 4. Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // 5. Build file path
    // CUSTOMIZE THIS: Adjust path structure for your endpoint
    const contextId = formData.get('context_id') as string | null;
    const filePath = contextId 
      ? `${user.id}/${contextId}/${fileName}`
      : `${user.id}/${fileName}`;

    // 6. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Upload to Supabase Storage
    // CUSTOMIZE THIS: Change bucket name
    const bucketName = 'your-bucket-name'; // e.g., 'profile-photos', 'portfolios'
    
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false // Set to true to allow overwriting
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        errorResponse('Failed to upload file', uploadError.message),
        { status: 500 }
      );
    }

    // 8. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // 9. Return response
    return NextResponse.json(
      successResponse(
        {
          url: publicUrlData.publicUrl,
          path: filePath,
          size: file.size,
          mimeType: file.type,
          fileName: file.name
        },
        'File uploaded successfully'
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

// CUSTOMIZATION GUIDE:
// 
// For profile-photo endpoint:
// - bucketName: 'profile-photos'
// - maxSize: 2 MB
// - allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
//
// For portfolio endpoint:
// - bucketName: 'portfolios'
// - maxSize: 10 MB
// - allowedTypes: images, videos, PDFs
//
// For slate-media endpoint:
// - bucketName: 'slate-media'
// - maxSize: 10 MB
// - allowedTypes: images, videos
//
// For resume endpoint:
// - bucketName: 'resumes'
// - maxSize: 5 MB
// - allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
//
// For project-asset endpoint:
// - bucketName: 'project-assets'
// - maxSize: 20 MB
// - allowedTypes: all media types
