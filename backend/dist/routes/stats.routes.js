"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats.controller");
const router = (0, express_1.Router)();
router.get('/overview', stats_controller_1.getOverview);
router.get('/by-category', stats_controller_1.getByCategory);
router.get('/by-status', stats_controller_1.getByStatus);
router.get('/heatmap', stats_controller_1.getHeatmapData);
router.get('/trends', stats_controller_1.getTrends);
router.get('/resolution-time', stats_controller_1.getResolutionTime);
exports.default = router;
//# sourceMappingURL=stats.routes.js.map