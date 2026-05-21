"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const official_controller_1 = require("../controllers/official.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All routes require official or admin role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('official', 'admin'));
router.get('/issues', official_controller_1.getOfficialIssues);
router.put('/issues/:id/status', [(0, express_validator_1.body)('status').isIn(['pending', 'under_review', 'in_progress', 'resolved', 'rejected'])], official_controller_1.updateIssueStatus);
router.put('/issues/:id/assign', [(0, express_validator_1.body)('officialId').isMongoId()], official_controller_1.assignIssue);
router.get('/team', official_controller_1.getTeam);
exports.default = router;
//# sourceMappingURL=official.routes.js.map