import express from 'express';
import * as sessionController from '../controllers/sessionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorize('teacher'), sessionController.createSession);
router.post('/quick-start', authenticate, authorize('teacher'), sessionController.quickStartSession);
router.get('/', authenticate, authorize('teacher'), sessionController.listTeacherSessions);
router.get('/:id', authenticate, sessionController.getSession);
router.get('/:id/summary', authenticate, authorize('teacher'), sessionController.getSessionSummary);
router.get('/:id/qr-code', authenticate, sessionController.getQRCode);
router.patch('/:id/status', authenticate, authorize('teacher'), sessionController.updateSessionStatus);
router.get('/:id/attendance', authenticate, authorize('teacher'), sessionController.getSessionAttendance);
router.post('/:id/manual-mark', authenticate, authorize('teacher'), sessionController.manualMark);

export default router;
