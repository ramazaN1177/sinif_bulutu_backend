import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { User } from '../models/User';
import { AppError } from '../lib/errors';

export interface AuthUser {
  id: string;
  role: 'teacher' | 'student' | null;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('unauthorized', 401, 'Giriş yapmanız gerekiyor.'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('role tokenVersion email');

    if (!user || user.tokenVersion !== payload.tv) {
      return next(new AppError('token_expired', 401, 'Oturum süreniz doldu, lütfen yenileyin.'));
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    next(new AppError('token_expired', 401, 'Geçersiz veya süresi dolmuş token.'));
  }
};
