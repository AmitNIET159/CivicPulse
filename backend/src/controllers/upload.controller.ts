import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No image file provided.' });
      return;
    }

    // Minimum file size: 5KB
    if (file.size < 5 * 1024) {
      res.status(400).json({ message: 'Image must be at least 5KB.' });
      return;
    }

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'civicpulse/issues',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' },
          ],
          eager: [{ width: 400, height: 300, crop: 'fill' }],
          eager_async: false,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error.message, error.http_code || '', error);
    res.status(500).json({ message: 'Upload failed.', error: error.message });
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      res.status(400).json({ message: 'Public ID is required.' });
      return;
    }
    const fullPublicId = `civicpulse/issues/${publicId}`;
    await cloudinary.uploader.destroy(fullPublicId);
    res.json({ message: 'Image deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Delete failed.', error: error.message });
  }
};
