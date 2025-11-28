'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/**
 * Root page with routing logic as per AUTH_FLOW_TYPESCRIPT_GUIDE.md
 * Checks authentication and profile completion, then routes accordingly
 */
export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRoute = async () => {
      try {
        // Step 1: Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Step 2: No session → redirect to login
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Step 3: Has session → check profile
        const token = session.access_token;
        
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const profileData = await response.json();
        
        // Step 4: Route based on profile existence
        if (profileData.success && profileData.data) {
          router.push('/slate');  // Profile exists → redirect to slate feed
        } else {
          router.push('/form');  // No profile → redirect to form
        }
      } catch (error) {
        console.error('Root routing error:', error);
        // On error, default to login
        router.push('/login');
      } finally {
        setChecking(false);
      }
    };

    checkAuthAndRoute();
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
