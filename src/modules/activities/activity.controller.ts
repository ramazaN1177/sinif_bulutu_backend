import { Request, Response, NextFunction } from 'express';
import { ActivityService } from './activity.service';

export class ActivityController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await ActivityService.createActivity(req.user!.id, req.body);
      res.status(201).json(activity);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filterClassId = req.query.classId as string | undefined;
      const activities = await ActivityService.getActivities(req.user!.id, req.user!.role as any, filterClassId);
      res.json(activities);
    } catch (err) {
      next(err);
    }
  }

  static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await ActivityService.getActivityDetail(
        req.params.activityId,
        req.user!.id,
        req.user!.role as any
      );
      res.json(activity);
    } catch (err) {
      next(err);
    }
  }

  static async submitAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ActivityService.submitAttempt(req.user!.id, req.params.activityId, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
