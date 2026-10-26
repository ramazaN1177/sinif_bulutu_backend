import { Request, Response, NextFunction } from 'express';
import { SubmissionService } from './submission.service';

export class SubmissionController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await SubmissionService.submitAssignment(req.user!.id, req.body);
      res.status(201).json(submission);
    } catch (err) {
      next(err);
    }
  }

  static async grade(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await SubmissionService.gradeSubmission(req.user!.id, req.params.submissionId, req.body);
      res.json(submission);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await SubmissionService.getSubmission(req.params.submissionId, req.user!.id, req.user!.role as any);
      res.json(submission);
    } catch (err) {
      next(err);
    }
  }
}
