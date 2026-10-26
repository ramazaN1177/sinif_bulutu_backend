import { z } from 'zod';

export const createAssignmentSchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Sınıf seçilmelidir.'),
    title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır.').max(100),
    description: z.string().max(2000).optional(),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          size: z.number().default(0),
          url: z.string().optional(),
          mime: z.string().optional(),
        })
      )
      .default([]),
    dueAt: z.string().or(z.date()),
    maxPoints: z.number().min(1).default(100),
    submissionTypes: z.array(z.enum(['photo', 'file', 'text'])).default(['photo', 'file']),
    allowLate: z.boolean().default(false),
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const updateAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().max(2000).optional(),
    dueAt: z.string().or(z.date()).optional(),
    maxPoints: z.number().min(1).optional(),
    allowLate: z.boolean().optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});
