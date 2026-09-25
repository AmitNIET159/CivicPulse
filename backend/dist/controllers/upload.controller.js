"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImage = async (req, res) => {
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
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream({
                folder: 'civicpulse/issues',
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' },
                    { width: 1200, crop: 'limit' },
                ],
                eager: [{ width: 400, height: 300, crop: 'fill' }],
                eager_async: false,
            }, (error, result) => (error ? reject(error) : resolve(result)));
            uploadStream.end(file.buffer);
        });
        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
        });
    }
    catch (error) {
        console.error('Cloudinary upload error:', error.message, error.http_code || '', error);
        res.status(500).json({ message: 'Upload failed.' });
    }
};
exports.uploadImage = uploadImage;
const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.params;
        if (!publicId) {
            res.status(400).json({ message: 'Public ID is required.' });
            return;
        }
        const fullPublicId = `civicpulse/issues/${publicId}`;
        await cloudinary_1.default.uploader.destroy(fullPublicId);
        res.json({ message: 'Image deleted successfully.' });
    }
    catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ message: 'Delete failed.' });
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=upload.controller.js.map