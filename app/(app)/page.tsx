'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/**
 * App group root page - Protected route as per AUTH_FLOW_TYPESCRIPT_GUIDE.md
 * Redirects authenticated users with complete profiles to slate feed
 */
export default function AppRootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const protectAndRedirect = async () => {
      try {
        // Step 1: Check session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated → redirect to login
          router.push('/login');
          return;
        }
        
        // Step 2: Verify profile exists
        const token = session.access_token;
        
        const response = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!data.success || !data.data) {
          // No profile → redirect to form
          router.push('/form');
          return;
        }
        
        // All checks passed → redirect to slate
        router.push('/slate');
      } catch (error) {
        console.error('App root protection error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    protectAndRedirect();
  }, [router]);

  // Show loading state while checking
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80] mx-auto"></div>
        <p className="text-gray-900 text-lg">Loading...</p>
      </div>
    </div>
  );
}
