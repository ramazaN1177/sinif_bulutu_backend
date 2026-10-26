import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { User } from '../../models/User';
import { toUserDTO } from '../../lib/dto';
import { AppError } from '../../lib/errors';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.googleAuth(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) throw new AppError('not_found', 404, 'Kullanıcı bulunamadı.');
      res.json({ user: toUserDTO(user) });
    } catch (err) {
      next(err);
    }
  }

  static async setRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.setRole(req.user!.id, req.body.role);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
}
