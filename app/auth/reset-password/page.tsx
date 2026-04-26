"use client";

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ResetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation';
import AuthForm from '@/components/AuthForm';

export default function ResetPasswordPage() {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess('Check your email for password reset instructions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your email to receive reset instructions</p>
        </div>

        <AuthForm
          schema={ResetPasswordSchema}
          onSubmit={handleResetPassword}
          fields={[
            {
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'you@example.com',
            },
          ]}
          submitLabel="Send Reset Link"
          isLoading={isLoading}
          error={error}
          success={success}
        />

        <div className="text-center">
          <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}