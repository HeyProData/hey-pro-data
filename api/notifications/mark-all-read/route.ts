import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
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

    // Update all unread notifications to read
    const { data, error, count } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select('id', { count: 'exact' });

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return NextResponse.json(
        errorResponse('Failed to mark all notifications as read', error.message),
        { status: 500 }
      );
    }

    const updatedCount = count || 0;

    return NextResponse.json(
      successResponse(
        {
          updatedCount,
          message: `${updatedCount} notification(s) marked as read`
        },
        'All notifications marked as read'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/notifications/mark-all-read:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
