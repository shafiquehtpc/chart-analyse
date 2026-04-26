import { z } from 'zod';

// Auth validation schemas
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Chart upload validation
export const ChartUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.type.startsWith('image/'), 'File must be an image').refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
  timeframe: z.enum(['1min', '5min', '15min', '30min', '1h', '4h', '1day'], {
    errorMap: () => ({ message: 'Invalid timeframe' }),
  }),
});

export type SignUpFormData = z.infer<typeof SignUpSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof NewPasswordSchema>;
export type ChartUploadFormData = z.infer<typeof ChartUploadSchema>;