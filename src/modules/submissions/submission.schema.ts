import { z } from 'zod';

export const createSubmissionSchema = z.object({
  body: z.object({
    assignmentId: z.string().min(1, 'Ödev seçilmelidir.'),
    textAnswer: z.string().max(10000).optional(),
    files: z
      .array(
        z.object({
          name: z.string(),
          size: z.number().default(0),
          url: z.string().optional(),
          mime: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .default([]),
  }),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    points: z.number().min(0).max(100, 'Puan 0-100 arasında olmalıdır.'),
    feedback: z.string().max(1000).optional(),
  }),
});
