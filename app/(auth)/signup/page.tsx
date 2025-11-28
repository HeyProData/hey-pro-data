'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, setStoragePreference } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Sign Up page - As per AUTH_FLOW_TYPESCRIPT_GUIDE.md
 * Handles new user registration
 */
export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // On page load: Check if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        // Already logged in, check profile
        const token = session.access_token;
        const response = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
          router.replace('/slate');
        } else {
          router.replace('/form');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkExistingSession();
  }, [router]);

  const validatePassword = (password: string) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    validatePassword(newPassword);
  };

  const isPasswordValid = () => {
    return (
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecialChar
    );
  };

  // On form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid()) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Normalize email
      const email = formData.email.toLowerCase().trim();

      // Step 2: Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`
        }
      });

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setError('This email is already registered. Please login instead or use a different email.');
        } else if (signUpError.message.includes('Email rate limit exceeded')) {
          setError('Too many signup attempts. Please try again in a few minutes.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // If user already exists (identities array is empty), show appropriate message
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered. Please login instead.');
        setLoading(false);
        return;
      }

      // Step 3: Handle two scenarios
      if (data.user && !data.session) {
        // Email confirmation required
        toast.success('Verification code sent to your email!');
        router.push(`/otp?email=${encodeURIComponent(email)}`);
      } else if (data.session) {
        // Auto-confirmed, redirect to profile form
        router.push('/form');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // OAuth sign up
  const handleOAuthSignUp = async (provider: 'google' | 'apple') => {
    if (provider === 'apple') {
      return; // Apple login not implemented
    }

    setLoading(true);
    setError('');

    try {
      // Google OAuth defaults to "keep me logged in"
      setStoragePreference(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/callback`
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT SIGN UP PART */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <img src="/logo/logo.svg" alt="Logo" width="60" className="mb-8" />
          </div>

          <h2 className="text-3xl font-medium mb-8">
            Sign up to <span className="text-gray-900">HeyPro</span><span className="text-[#00bcd4]">Data</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                required
                disabled={loading}
              />
            </div>

            {!isPasswordValid() && formData.password.length > 0 && (
              <div className="mb-6 text-sm text-gray-600">
                Password must contain a minimum of 8 characters, 1 upper case, 1 number and 1 special character.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isPasswordValid()}
              className="w-full bg-[#ff6b9d] hover:bg-[#ff5a8f] text-white py-3 rounded-lg font-medium mb-6 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => handleOAuthSignUp('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/assets/google-icon.png" width="22" alt="Google" />
              Google
            </button>
            <button 
              disabled
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
            >
              <img src="/assets/apple-icon.png" width="20" alt="Apple" />
              Apple
            </button>
          </div>

          <div className="text-center text-sm">
            Already have an account? <Link href="/login" className="text-[#0066ff] hover:underline">Login</Link>
          </div>
        </div>
      </div>

      {/* RIGHT GRADIENT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <div className="w-full h-full rounded-3xl" style={{background: 'conic-gradient(from 180deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)'}}></div>
      </div>
    </div>
  );
}
