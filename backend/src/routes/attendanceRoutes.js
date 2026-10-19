import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check-in/qr', authenticate, authorize('student'), attendanceController.checkInByQR);
router.post('/check-in/pin', authenticate, authorize('student'), attendanceController.checkInByPIN);
router.get('/my-history', authenticate, authorize('student'), attendanceController.getMyHistory);
router.get('/my-class/:classId', authenticate, authorize('student'), attendanceController.getMyClassHistory);
router.get('/class/:classId', authenticate, authorize('teacher'), attendanceController.getClassAttendance);

export default router;
