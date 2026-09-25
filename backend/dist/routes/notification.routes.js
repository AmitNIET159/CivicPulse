"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all notification routes
router.use(auth_middleware_1.authenticate);
router.get('/', notification_controller_1.getNotifications);
router.patch('/read-all', notification_controller_1.markAllAsRead); // Note: defined before /:id so it doesn't match as an ID
router.patch('/:id/read', notification_controller_1.markAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map