import { Router } from 'express';
import { ClassController } from './class.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createClassSchema, joinClassSchema } from './class.schema';

const router = Router();

router.use(authenticate);

// Teacher creates class
router.post('/', requireRole('teacher'), validate(createClassSchema), ClassController.create);

// Get my classes (both teacher & student)
router.get('/', ClassController.getMyClasses);

// Student joins class via code
router.post('/join', requireRole('student'), validate(joinClassSchema), ClassController.join);

// Class detail
router.get('/:classId', ClassController.getDetail);

// Members/students roster of class
router.get('/:classId/members', ClassController.getMembers);

export default router;
