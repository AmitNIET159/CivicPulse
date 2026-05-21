"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolutionTime = exports.getTrends = exports.getHeatmapData = exports.getByStatus = exports.getByCategory = exports.getOverview = void 0;
const Issue_1 = __importDefault(require("../models/Issue"));
// GET /api/stats/overview
const getOverview = async (_req, res) => {
    try {
        const [totalIssues, resolved, pending, inProgress] = await Promise.all([
            Issue_1.default.countDocuments(),
            Issue_1.default.countDocuments({ status: 'resolved' }),
            Issue_1.default.countDocuments({ status: 'pending' }),
            Issue_1.default.countDocuments({ status: 'in_progress' }),
        ]);
        // Average resolution time
        const resolvedIssues = await Issue_1.default.find({ status: 'resolved', resolvedAt: { $ne: null } })
            .select('createdAt resolvedAt').lean();
        let avgResolutionTime = 0;
        if (resolvedIssues.length > 0) {
            const totalDays = resolvedIssues.reduce((sum, issue) => {
                const days = (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0);
            avgResolutionTime = Math.round((totalDays / resolvedIssues.length) * 10) / 10;
        }
        res.json({ totalIssues, resolved, pending, inProgress, avgResolutionTime });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
exports.getOverview = getOverview;
// GET /api/stats/by-category
const getByCategory = async (_req, res) => {
    try {
        const result = await Issue_1.default.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({ data: result.map((r) => ({ category: r._id, count: r.count })) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
exports.getByCategory = getByCategory;
// GET /api/stats/by-status
const getByStatus = async (_req, res) => {
    try {
        const result = await Issue_1.default.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({ data: result.map((r) => ({ status: r._id, count: r.count })) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
exports.getByStatus = getByStatus;
// GET /api/stats/heatmap
const getHeatmapData = async (req, res) => {
    try {
        const { days, category } = req.query;
        const filter = {};
        if (days) {
            const d = parseInt(days, 10);
            filter.createdAt = { $gte: new Date(Date.now() - d * 24 * 60 * 60 * 1000) };
        }
        if (category)
            filter.category = category;
        const issues = await Issue_1.default.find(filter)
            .select('location voteCount')
            .lean();
        const points = issues.map((issue) => ({
            lat: issue.location.coordinates[1],
            lng: issue.location.coordinates[0],
            weight: Math.max(issue.voteCount, 1),
        }));
        res.json({ points });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
exports.getHeatmapData = getHeatmapData;
// GET /api/stats/trends
const getTrends = async (_req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await Issue_1.default.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({ data: result.map((r) => ({ date: r._id, count: r.count })) });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
exports.getTrends = getTrends;
// GET /api/stats/resolution-time
const getResolutionTime = async (_req, res) => {
    try {
        const result = await Issue_1.default.aggregate([
            { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
            {
                $group: {
                    _id: '$category',
                    avgDays: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$resolvedAt', '$createdAt'] },
                                1000 * 60 * 60 * 24,
                            ],
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { avgDays: 1 } },
        ]);
        res.json({
            data: result.map((r) => ({
                category: r._id,
                avgDays: Math.round(r.avgDays * 10) / 10,
                count: r.count,
            })),
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
exports.getResolutionTime = getResolutionTime;
//# sourceMappingURL=stats.controller.js.map