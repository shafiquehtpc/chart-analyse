"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { SignUpSchema, type SignUpFormData } from '@/lib/validation';
import AuthForm from '@/components/AuthForm';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      setSuccess('Sign up successful! Check your email to confirm.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Get Started</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account to begin analyzing charts</p>
        </div>

        <AuthForm
          schema={SignUpSchema}
          onSubmit={handleSignUp}
          fields={[
            {
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'you@example.com',
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: '••••••••',
            },
            {
              name: 'confirmPassword',
              label: 'Confirm Password',
              type: 'password',
              placeholder: '••••••••',
            },
          ]}
          submitLabel="Create Account"
          isLoading={isLoading}
          error={error}
          success={success}
        />

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}