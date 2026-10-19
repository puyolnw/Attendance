import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Report routes - teacher only
router.get('/class/:classId', authenticate, authorize('teacher'), reportController.getClassReport);
router.get('/class/:classId/matrix', authenticate, authorize('teacher'), reportController.getAttendanceMatrix);
router.get('/class/:classId/export', authenticate, authorize('teacher'), reportController.exportCSV);

export default router;
