import { z } from 'zod';

const activityItemSchema = z.object({
  id: z.string(),
  question: z.string().optional(),
  answer: z.string().optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any().optional(),
  image: z.string().optional(),
  answerImage: z.string().optional(),
  category: z.string().optional(),
  term: z.string().optional(),
  definition: z.string().optional(),
  label: z.string().optional(),
  points: z.number().default(10),
});

export const createActivitySchema = z.object({
  body: z.object({
    classId: z.string().min(1, 'Sınıf seçilmelidir.'),
    title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır.').max(100),
    description: z.string().max(1000).optional(),
    templateType: z.string().min(1, 'Şablon türü belirtilmelidir.'),
    items: z.array(activityItemSchema).min(1, 'En az 1 soru/öğe eklenmelidir.'),
    categories: z.array(z.string()).optional(),
    boxColors: z.record(z.string(), z.number()).optional(),
    boxImages: z.record(z.string(), z.string()).optional(),
    subject: z.string().optional(),
    gradeLevel: z.string().optional(),
    timeLimitSeconds: z.number().min(10).max(600).default(60),
    maxScore: z.number().min(10).default(100),
    status: z.enum(['draft', 'published']).default('published'),
    dueAt: z.string().or(z.date()).optional(),
  }),
});

export const submitAttemptSchema = z.object({
  body: z.object({
    score: z.number().min(0),
    maxScore: z.number().min(1),
    timeSpentSeconds: z.number().min(0),
    answers: z
      .array(
        z.object({
          itemId: z.string(),
          givenAnswer: z.any(),
          isCorrect: z.boolean(),
        })
      )
      .default([]),
  }),
});
