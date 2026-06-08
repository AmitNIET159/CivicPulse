import { Router } from 'express';
import { body } from 'express-validator';
import {
  getIssues, getIssueById, createIssue, updateIssue, deleteIssue,
  toggleVote, getNearbyIssues, getPriorityIssues,
} from '../controllers/issue.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { reportLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/', optionalAuth, getIssues);
router.get('/nearby', getNearbyIssues);
router.get('/priority', getPriorityIssues);
router.get('/:id', optionalAuth, getIssueById);

router.post(
  '/',
  authenticate,
  reportLimiter,
  [
    body('title').optional().trim().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('category').isIn([
      'pothole', 'streetlight', 'garbage', 'drainage', 'water_supply',
      'encroachment', 'noise', 'stray_animals', 'other',
    ]),
    body('coordinates.lat').isFloat({ min: -90, max: 90 }),
    body('coordinates.lng').isFloat({ min: -180, max: 180 }),
  ],
  createIssue
);

router.put('/:id', authenticate, authorize('official', 'admin'), updateIssue);
router.delete('/:id', authenticate, authorize('admin'), deleteIssue);
router.post('/:id/vote', authenticate, toggleVote);

export default router;
