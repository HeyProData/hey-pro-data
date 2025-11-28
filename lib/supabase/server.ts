import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server-side operations
 * Uses service role key if available for admin operations
 */
export const createServerClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Validate an authentication token from the Authorization header
 * @param authHeader - The Authorization header value (e.g., "Bearer <token>")
 * @returns The authenticated user or null if invalid
 */
export const validateAuthToken = async (authHeader: string | null): Promise<User | null> => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Create a client with the user's token
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token validation error:', error?.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token validation exception:', error);
    return null;
  }
};

/**
 * Get user from request headers
 * Convenience function for API routes
 */
export const getUserFromRequest = async (request: Request): Promise<User | null> => {
  const authHeader = request.headers.get('Authorization');
  return validateAuthToken(authHeader);
};

/**
 * Standard success response format
 */
export const successResponse = (data: unknown, message?: string) => {
  return {
    success: true,
    message: message || 'Success',
    data,
  };
};

/**
 * Standard error response format
 */
export const errorResponse = (error: string, details?: unknown) => {
  return {
    success: false,
    error,
    details: details || null,
  };
};

/**
 * Verify if a user has a complete profile
 */
export const hasCompleteProfile = async (userId: string): Promise<boolean> => {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('legal_first_name, legal_surname, country, city')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  // Check if required fields are filled
  return !!(data.legal_first_name && data.legal_surname && data.country && data.city);
};
