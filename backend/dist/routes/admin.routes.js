"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = express_1.default.Router();
// All admin routes are protected and restricted to 'admin' role
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorize)('admin'));
router.get('/users', admin_controller_1.getUsers);
router.put('/users/:id/verify', admin_controller_1.verifyUser);
router.put('/users/:id/role', admin_controller_1.changeUserRole);
router.delete('/users/:id', admin_controller_1.deleteUser);
router.get('/system-stats', admin_controller_1.getSystemStats);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map