import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export const requireRole = (role: 'teacher' | 'student') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('unauthorized', 401, 'Giriş yapmanız gerekiyor.'));
    }

    if (!req.user.role) {
      return next(new AppError('role_required', 403, 'Rol seçimi yapılması gerekiyor.'));
    }

    if (req.user.role !== role) {
      return next(new AppError('forbidden', 403, 'Bu işlem için yetkiniz bulunmamaktadır.'));
    }

    next();
  };
};
