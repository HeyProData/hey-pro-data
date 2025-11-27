import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/project-asset
 * Upload project assets (images, videos, documents)
 * Bucket: project-assets/ (Mixed - based on project privacy)
 * Max Size: 20 MB
 * Allowed Types: Images, Videos, Documents, Archives, Audio
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
    const projectId = formData.get('project_id') as string | null;
    
    if (!file) {
      return NextResponse.json(
        errorResponse('No file provided'),
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        errorResponse('Project ID is required'),
        { status: 400 }
      );
    }

    // Validate file type - allow wide range of media types
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      // Audio
      'audio/mpeg',
      'audio/wav'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        errorResponse('Invalid file type. Allowed: Images, Videos, Documents (PDF, DOC, DOCX, TXT), Archives (ZIP), Audio (MP3, WAV)'),
        { status: 415 }
      );
    }

    // Validate file size (20 MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        errorResponse('File too large. Maximum size is 20MB'),
        { status: 413 }
      );
    }

    const supabase = createServerClient();

    // Verify user has access to the project (owner or team member)
    const { data: project, error: projectError } = await supabase
      .from('design_projects')
      .select('creator_user_id')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) {
      console.error('Project fetch error:', projectError);
      return NextResponse.json(
        errorResponse('Failed to verify project access', projectError.message),
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Check if user is project creator or team member
    const isCreator = project.creator_user_id === user.id;
    if (!isCreator) {
      // Check if user is a team member
      const { data: teamMember } = await supabase
        .from('project_team')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!teamMember) {
        return NextResponse.json(
          errorResponse('You do not have permission to upload assets to this project'),
          { status: 403 }
        );
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Build file path
    const filePath = `${user.id}/${projectId}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('project-assets')
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
      .from('project-assets')
      .getPublicUrl(filePath);

    // Determine file type
    let fileType = 'document';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    else if (file.type.includes('zip')) fileType = 'archive';

    return NextResponse.json(
      successResponse(
        {
          url: publicUrlData.publicUrl,
          path: filePath,
          size: file.size,
          mimeType: file.type,
          fileType,
          fileName: file.name
        },
        'Project asset uploaded successfully'
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
