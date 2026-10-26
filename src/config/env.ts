import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/sinif_bulutu'),
  JWT_ACCESS_SECRET: z.string().default('sinif-bulutu-super-secure-access-token-secret-key-2026'),
  JWT_REFRESH_SECRET: z.string().default('sinif-bulutu-super-secure-refresh-token-secret-key-2026'),
  ACCESS_TTL: z.string().default('15m'),
  REFRESH_TTL_DAYS: z.coerce.number().default(30),
});

export const env = envSchema.parse(process.env);
