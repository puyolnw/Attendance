import express from 'express';
import * as enrollmentController from '../controllers/enrollmentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student enrollment routes
router.post('/', authenticate, authorize('student'), enrollmentController.enrollStudent);
router.get('/my-classes', authenticate, authorize('student'), enrollmentController.getMyClasses);
router.delete('/:enrollmentId', authenticate, authorize('student'), enrollmentController.dropClass);

export default router;
