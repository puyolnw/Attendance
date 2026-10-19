import express from 'express';
import * as scheduleController from '../controllers/scheduleController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Weekly timetable for the logged-in user (teacher: teaching, student: enrolled)
router.get('/my', authenticate, scheduleController.getMySchedule);

export default router;
