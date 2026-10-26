import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
      },
    });
    return;
  }

  console.error('Unhandled Server Error:', err);

  res.status(500).json({
    error: {
      code: 'internal_server_error',
      message: 'Sunucuda beklenmeyen bir hata oluştu.',
      details: null,
    },
  });
};
