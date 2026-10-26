import { Request, Response, NextFunction } from 'express';
import { ClassService } from './class.service';

export class ClassController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cls = await ClassService.createClass(req.user!.id, req.body);
      res.status(201).json(cls);
    } catch (err) {
      next(err);
    }
  }

  static async getMyClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const classes = await ClassService.getMyClasses(req.user!.id, req.user!.role as any);
      res.json(classes);
    } catch (err) {
      next(err);
    }
  }

  static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const cls = await ClassService.getClassDetail(req.params.classId, req.user!.id, req.user!.role as any);
      res.json(cls);
    } catch (err) {
      next(err);
    }
  }

  static async join(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ClassService.joinClass(req.user!.id, req.body.code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await ClassService.getMembers(req.params.classId);
      res.json(members);
    } catch (err) {
      next(err);
    }
  }
}
