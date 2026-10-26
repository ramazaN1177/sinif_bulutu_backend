import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Sınıf adı zorunludur').max(80).trim(),
  subject: z.string().min(1, 'Ders alanı zorunludur').max(60).trim(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir hex renk kodu giriniz').default('#2563EB'),
  joinMode: z.enum(['auto', 'approval']).default('auto'),
  allowLate: z.boolean().default(false),
});

export const joinClassSchema = z.object({
  code: z.string().length(6, 'Sınıf kodu 6 haneli olmalıdır').trim().toUpperCase(),
});
