"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Use memory storage — files are buffered in memory for Cloudinary streaming
const storage = multer_1.default.memoryStorage();
// File filter — only accept images
const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
        return;
    }
    cb(null, true);
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 5, // Max 5 files per request
    },
});
//# sourceMappingURL=upload.middleware.js.map