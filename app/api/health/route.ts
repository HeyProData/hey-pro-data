import { NextRequest, NextResponse } from 'next/server';
import { successResponse } from '@/lib/supabase/server';

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      successResponse(
        { 
          status: 'ok', 
          timestamp: new Date().toISOString() 
        },
        'API is healthy'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}
