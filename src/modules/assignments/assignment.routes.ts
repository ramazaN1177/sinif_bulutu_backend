import { Router } from 'express';
import { AssignmentController } from './assignment.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createAssignmentSchema } from './assignment.schema';

const router = Router();

router.use(authenticate);

// List assignments (filtered optionally by ?classId=)
router.get('/', AssignmentController.getAll);

// Detail of assignment
router.get('/:assignmentId', AssignmentController.getDetail);

// Teacher creates assignment
router.post('/', requireRole('teacher'), validate(createAssignmentSchema), AssignmentController.create);

export default router;
