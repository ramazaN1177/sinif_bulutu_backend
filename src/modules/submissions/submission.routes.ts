import { Router } from 'express';
import { SubmissionController } from './submission.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createSubmissionSchema, gradeSubmissionSchema } from './submission.schema';

const router = Router();

router.use(authenticate);

// Student submits or updates submission
router.post('/', requireRole('student'), validate(createSubmissionSchema), SubmissionController.submit);

// Teacher grades a submission
router.patch('/:submissionId/grade', requireRole('teacher'), validate(gradeSubmissionSchema), SubmissionController.grade);

// View submission detail
router.get('/:submissionId', SubmissionController.getById);

export default router;
