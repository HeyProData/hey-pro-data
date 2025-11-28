'use client';

import { supabase, setStoragePreference } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * OAuth Callback page - Handles OAuth redirects
 * As per AUTH_FLOW_TYPESCRIPT_GUIDE.md
 */
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Step 1: Get session from URL (OAuth callback)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('Session error:', sessionError);
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Step 2: OAuth users stay logged in
        setStoragePreference(true);

        // Step 3: Check profile and redirect
        await checkProfileAndRedirect(session.access_token);

      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred during authentication.');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleCallback();
  }, [router]);

  const checkProfileAndRedirect = async (token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      setIsRedirecting(true);

      // Non-blocking error handling
      if (!data.success || !data.data) {
        // No profile, redirect to form
        router.push('/form');
      } else {
        // Profile exists, redirect to home
        router.push('/home');
      }
    } catch (err) {
      // Profile check errors treated as "no profile"
      console.log('[Callback] Profile check error (non-blocking):', err);
      setIsRedirecting(true);
      router.push('/form');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Image
          src="https://customer-assets.emergentagent.com/job_2a9bf250-13c7-456d-9a61-1240d767c09d/artifacts/97u04lh8_hpd.png"
          alt="HeyProData"
          width={200}
          height={60}
          className="h-14 w-auto mx-auto"
        />
        {error ? (
          <div className="space-y-2">
            <p className="text-red-500 text-lg">{error}</p>
            <p className="text-gray-600 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80] mx-auto"></div>
            <p className="text-gray-900 text-lg">Completing authentication...</p>
            <p className="text-gray-600 text-sm">Please wait</p>
          </div>
        )}
      </div>
    </div>
  );
}
