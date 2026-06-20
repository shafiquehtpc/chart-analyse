"use client";

import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ZodSchema } from 'zod';

interface AuthFormProps {
  schema: ZodSchema;
  onSubmit: (data: any) => Promise<void>;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }[];
  submitLabel: string;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

export default function AuthForm({
  schema,
  onSubmit,
  fields,
  submitLabel,
  isLoading = false,
  error,
  success,
}: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label}
          </label>
          <input
            {...register(field.name)}
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
          />
          {errors[field.name] && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors[field.name]?.message as string}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? 'Loading...' : submitLabel}
      </button>
    </form>
  );
}