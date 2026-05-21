"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/image', auth_middleware_1.authenticate, rateLimit_middleware_1.reportLimiter, upload_middleware_1.upload.single('image'), upload_controller_1.uploadImage);
router.delete('/image/:publicId', auth_middleware_1.authenticate, upload_controller_1.deleteImage);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map