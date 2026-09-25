"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// Wrap multer upload with proper error handling
const handleUpload = (req, res, next) => {
    upload_middleware_1.upload.single('image')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            // Multer-specific errors (file too large, too many files, etc.)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        }
        else if (err) {
            // Custom errors from fileFilter
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
router.post('/image', auth_middleware_1.authenticate, rateLimit_middleware_1.reportLimiter, handleUpload, upload_controller_1.uploadImage);
router.delete('/image/:publicId', auth_middleware_1.authenticate, upload_controller_1.deleteImage);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map