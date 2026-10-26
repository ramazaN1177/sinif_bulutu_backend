import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz').toLowerCase().trim(),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  firstName: z.string().min(1, 'Ad alanı zorunludur').trim(),
  lastName: z.string().min(1, 'Soyad alanı zorunludur').trim(),
  role: z.enum(['teacher', 'student']).optional(),
});


export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz').toLowerCase().trim(),
  password: z.string().min(1, 'Şifre alanı zorunludur'),
});

export const googleAuthSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz').toLowerCase().trim(),
  firstName: z.string().min(1, 'Ad alanı zorunludur').trim(),
  lastName: z.string().trim().optional(),
  avatarUrl: z.string().optional(),
  googleId: z.string().min(1, 'Google ID zorunludur'),
  role: z.enum(['teacher', 'student']).optional(),
  idToken: z.string().optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token zorunludur'),
});

export const selectRoleSchema = z.object({
  role: z.enum(['teacher', 'student']),
});

export const updateProfileSchema = z.object({
  school: z.string().optional(),
  branch: z.string().optional(),
  gradeLevel: z.string().optional(),
  birthYear: z.number().optional(),
  avatarUrl: z.string().optional(),
});
