import { Router } from 'express';
import { getOfficialIssues, updateIssueStatus, assignIssue, getTeam } from '../controllers/official.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { body } from 'express-validator';

const router = Router();

// All routes require official or admin role
router.use(authenticate, authorize('official', 'admin'));

router.get('/issues', getOfficialIssues);
router.put(
  '/issues/:id/status',
  [body('status').isIn(['pending', 'under_review', 'in_progress', 'resolved', 'rejected'])],
  updateIssueStatus
);
router.put(
  '/issues/:id/assign',
  [body('officialId').isMongoId()],
  assignIssue
);
router.get('/team', getTeam);

export default router;
