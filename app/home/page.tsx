'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Home page - Protected route that requires authentication and complete profile
 * As per AUTH_FLOW_TYPESCRIPT_GUIDE.md
 */
export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const protectRoute = async () => {
      try {
        // Step 1: Check session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated
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
          // No profile, redirect to form
          router.push('/form');
          return;
        }
        
        // All checks passed, show home page
        setAuthorized(true);
      } catch (error) {
        console.error('Home page protection error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    protectRoute();
  }, [router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80] mx-auto"></div>
          <p className="text-gray-900 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </main>
  );
}
