"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LoginSchema, type LoginFormData } from '@/lib/validation';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <AuthForm
          schema={LoginSchema}
          onSubmit={handleLogin}
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
          ]}
          submitLabel="Sign In"
          isLoading={isLoading}
          error={error}
        />

        <div className="flex items-center justify-between">
          <Link href="/auth/reset-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}