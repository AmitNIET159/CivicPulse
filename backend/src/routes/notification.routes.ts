import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all notification routes
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead); // Note: defined before /:id so it doesn't match as an ID
router.patch('/:id/read', markAsRead);

export default router;
