import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only user management
router.get('/summary', authenticate, authorize('admin'), userController.getSummary);
router.get('/', authenticate, authorize('admin'), userController.listUsers);
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

export default router;
