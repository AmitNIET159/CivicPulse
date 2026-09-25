import express from 'express';
import {
  getUsers,
  verifyUser,
  changeUserRole,
  deleteUser,
  getSystemStats,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

// All admin routes are protected and restricted to 'admin' role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);
router.get('/system-stats', getSystemStats);

export default router;

