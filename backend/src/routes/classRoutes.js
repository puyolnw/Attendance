import express from 'express';
import * as classController from '../controllers/classController.js';
import * as sessionController from '../controllers/sessionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Teacher routes
router.post('/', authenticate, authorize('teacher'), classController.createClass);
router.get('/my-classes', authenticate, authorize('teacher'), classController.listMyClasses);
router.get('/my-terms', authenticate, authorize('teacher'), classController.listMyTerms);
router.get('/available', authenticate, authorize('student'), classController.listAvailableClasses);

// Current active term (single source of truth) — any authenticated user
router.get('/current-term', authenticate, classController.getCurrentTerm);

// Class details and management
router.get('/:id', authenticate, classController.getClass);
router.put('/:id', authenticate, authorize('teacher'), classController.updateClass);
router.delete('/:id', authenticate, authorize('teacher'), classController.deleteClass);

// Student management in class
router.get('/:id/sessions', authenticate, authorize('teacher'), sessionController.listClassSessions);
router.get('/:id/active-session', authenticate, sessionController.getActiveSession);
router.get('/:id/students', authenticate, classController.getStudents);
router.post('/:id/students', authenticate, authorize('teacher'), classController.addStudent);
router.delete('/:id/students/:studentId', authenticate, authorize('teacher'), classController.removeStudent);

export default router;
