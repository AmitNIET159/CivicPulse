import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { reportLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Wrap multer upload with proper error handling
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (file too large, too many files, etc.)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Custom errors from fileFilter
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/image', authenticate, reportLimiter, handleUpload, uploadImage);
router.delete('/image/:publicId', authenticate, deleteImage);

export default router;
