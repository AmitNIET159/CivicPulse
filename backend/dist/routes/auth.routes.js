"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post('/register', rateLimit_middleware_1.authLimiter, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], auth_controller_1.register);
router.post('/register-official', rateLimit_middleware_1.authLimiter, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('ward').trim().notEmpty().withMessage('Ward is required for officials'),
    (0, express_validator_1.body)('department').trim().notEmpty().withMessage('Department is required for officials'),
], auth_controller_1.registerOfficial);
router.post('/login', rateLimit_middleware_1.authLimiter, [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
], auth_controller_1.login);
router.post('/refresh', auth_controller_1.refreshAccessToken);
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.logout);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map