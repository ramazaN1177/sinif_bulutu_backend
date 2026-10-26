import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from './assignment.service';

export class AssignmentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.createAssignment(req.user!.id, req.body);
      res.status(201).json(assignment);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filterClassId = req.query.classId as string | undefined;
      const assignments = await AssignmentService.getAssignments(req.user!.id, req.user!.role as any, filterClassId);
      res.json(assignments);
    } catch (err) {
      next(err);
    }
  }

  static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await AssignmentService.getAssignmentDetail(
        req.params.assignmentId,
        req.user!.id,
        req.user!.role as any
      );
      res.json(assignment);
    } catch (err) {
      next(err);
    }
  }
}
