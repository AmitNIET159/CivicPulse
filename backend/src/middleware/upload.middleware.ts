import multer from 'multer';
import { Request } from 'express';

// Use memory storage — files are buffered in memory for Cloudinary streaming
const storage = multer.memoryStorage();

// File filter — only accept images
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5, // Max 5 files per request
  },
});
