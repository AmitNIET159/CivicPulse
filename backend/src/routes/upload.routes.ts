import { Router } from 'express';
import { uploadImage, deleteImage } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { reportLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/image', authenticate, reportLimiter, upload.single('image'), uploadImage);
router.delete('/image/:publicId', authenticate, deleteImage);

export default router;
