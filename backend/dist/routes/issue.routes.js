"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const issue_controller_1 = require("../controllers/issue.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.optionalAuth, issue_controller_1.getIssues);
router.get('/nearby', issue_controller_1.getNearbyIssues);
router.get('/priority', issue_controller_1.getPriorityIssues);
router.get('/:id', auth_middleware_1.optionalAuth, issue_controller_1.getIssueById);
router.post('/', auth_middleware_1.authenticate, rateLimit_middleware_1.reportLimiter, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10, max: 1000 }),
    (0, express_validator_1.body)('category').isIn([
        'pothole', 'streetlight', 'garbage', 'drainage', 'water_supply',
        'encroachment', 'noise', 'stray_animals', 'other',
    ]),
    (0, express_validator_1.body)('coordinates.lat').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('coordinates.lng').isFloat({ min: -180, max: 180 }),
], issue_controller_1.createIssue);
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('official', 'admin'), issue_controller_1.updateIssue);
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), issue_controller_1.deleteIssue);
router.post('/:id/vote', auth_middleware_1.authenticate, issue_controller_1.toggleVote);
exports.default = router;
//# sourceMappingURL=issue.routes.js.map