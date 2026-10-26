import { Router } from 'express';
import { ActivityController } from './activity.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createActivitySchema, submitAttemptSchema } from './activity.schema';

const router = Router();

router.use(authenticate);

// List activities
router.get('/', ActivityController.getAll);

// Detail of an activity (with questions / items and leaderboard)
router.get('/:activityId', ActivityController.getDetail);

// Teacher creates activity
router.post('/', requireRole('teacher'), validate(createActivitySchema), ActivityController.create);

// Student submits an attempt/game run
router.post('/:activityId/attempt', requireRole('student'), validate(submitAttemptSchema), ActivityController.submitAttempt);

export default router;
