"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleVote = exports.deleteIssue = exports.updateIssue = exports.createIssue = exports.getIssueById = exports.getPriorityIssues = exports.getNearbyIssues = exports.getIssues = void 0;
const express_validator_1 = require("express-validator");
const Issue_1 = __importDefault(require("../models/Issue"));
const Vote_1 = __importDefault(require("../models/Vote"));
const User_1 = __importDefault(require("../models/User"));
// Priority formula helper
const recalculatePriority = async (issueId) => {
    const issue = await Issue_1.default.findById(issueId);
    if (!issue)
        return;
    const daysSinceCreation = (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const urgencyBoost = Math.max(0, 30 - daysSinceCreation);
    const priority = issue.voteCount * 2 + urgencyBoost;
    await Issue_1.default.findByIdAndUpdate(issueId, { priority });
};
// GET /api/issues — List issues (paginated, filterable)
const getIssues = async (req, res) => {
    try {
        const { page = '1', limit = '12', status, category, ward, sort = 'priority', search, } = req.query;
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100);
        const skip = (pageNum - 1) * limitNum;
        // Build filter
        const filter = {};
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (ward)
            filter.ward = ward;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        // Build sort
        let sortObj = { priority: -1 };
        if (sort === 'newest')
            sortObj = { createdAt: -1 };
        if (sort === 'oldest')
            sortObj = { createdAt: 1 };
        if (sort === 'votes')
            sortObj = { voteCount: -1 };
        if (sort === 'updated')
            sortObj = { updatedAt: -1 };
        const issues = await Issue_1.default.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .select('-statusHistory -officialComment')
            .populate('reportedBy', 'name avatar')
            .populate('assignedTo', 'name department')
            .lean();
        const total = await Issue_1.default.countDocuments(filter);
        const userId = req.user?._id?.toString();
        const processedIssues = issues.map((issue) => {
            const hasVoted = userId ? issue.voters?.some((v) => v.toString() === userId) : false;
            return {
                ...issue,
                voters: hasVoted ? [userId] : []
            };
        });
        res.json({
            issues: processedIssues,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('getIssues error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getIssues = getIssues;
// GET /api/issues/nearby — Issues near coordinates
const getNearbyIssues = async (req, res) => {
    try {
        const { lat, lng, radius = '5000' } = req.query;
        if (!lat || !lng) {
            res.status(400).json({ message: 'lat and lng query parameters are required.' });
            return;
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const maxDistance = parseInt(radius, 10);
        const issues = await Issue_1.default.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    distanceField: 'distance',
                    maxDistance,
                    spherical: true,
                },
            },
            { $limit: 50 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reportedBy',
                    foreignField: '_id',
                    as: 'reportedBy',
                    pipeline: [{ $project: { name: 1, avatar: 1 } }],
                },
            },
            { $unwind: { path: '$reportedBy', preserveNullAndEmptyArrays: true } },
            { $project: { statusHistory: 0, officialComment: 0, voters: 0 } },
        ]);
        res.json({ issues });
    }
    catch (error) {
        console.error('getNearbyIssues error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getNearbyIssues = getNearbyIssues;
// GET /api/issues/priority — Top issues sorted by priority
const getPriorityIssues = async (req, res) => {
    try {
        const parsedLimit = parseInt(req.query.limit || '20', 10);
        const limit = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100);
        const issues = await Issue_1.default.find({ status: { $nin: ['resolved', 'rejected'] } })
            .sort({ priority: -1 })
            .limit(limit)
            .select('-statusHistory -officialComment')
            .populate('reportedBy', 'name avatar')
            .populate('assignedTo', 'name department')
            .lean();
        const userId = req.user?._id?.toString();
        const processedIssues = issues.map((issue) => {
            const hasVoted = userId ? issue.voters?.some((v) => v.toString() === userId) : false;
            return {
                ...issue,
                voters: hasVoted ? [userId] : []
            };
        });
        res.json({ issues: processedIssues });
    }
    catch (error) {
        console.error('getPriorityIssues error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getPriorityIssues = getPriorityIssues;
// GET /api/issues/:id — Single issue with full details
const getIssueById = async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id)
            .populate('reportedBy', 'name avatar email reportCount')
            .populate('assignedTo', 'name department ward avatar')
            .populate('statusHistory.changedBy', 'name role')
            .lean();
        if (!issue) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        res.json({ issue });
    }
    catch (error) {
        console.error('Issue controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getIssueById = getIssueById;
// POST /api/issues — Create new issue (auth required)
const createIssue = async (req, res) => {
    try {
        // Check express-validator results
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ message: errors.array().map(e => e.msg).join(', '), errors: errors.array() });
            return;
        }
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const { title, description, category, coordinates, address, ward, photos } = req.body;
        // Auto-generate title from description if not provided
        const issueTitle = (title && title.trim()) ? title.trim() : description.trim().slice(0, 100);
        if (!coordinates || !coordinates.lng || !coordinates.lat) {
            res.status(400).json({ message: 'Location coordinates are required.' });
            return;
        }
        // Validate photo count: minimum 1, maximum 5
        if (!photos || !Array.isArray(photos) || photos.length < 1) {
            res.status(400).json({ message: 'At least 1 photo is required.' });
            return;
        }
        if (photos.length > 5) {
            res.status(400).json({ message: 'Maximum 5 photos allowed.' });
            return;
        }
        const issue = new Issue_1.default({
            title: issueTitle,
            description,
            category,
            location: {
                type: 'Point',
                coordinates: [coordinates.lng, coordinates.lat], // GeoJSON: [lng, lat]
            },
            address: address || '',
            ward: ward || '',
            photos: photos || [],
            reportedBy: req.user._id,
            statusHistory: [
                {
                    status: 'pending',
                    changedBy: req.user._id,
                    changedAt: new Date(),
                    note: 'Issue reported',
                },
            ],
        });
        await issue.save();
        // Increment reporter's count
        await User_1.default.findByIdAndUpdate(req.user._id, { $inc: { reportCount: 1 } });
        const populated = await Issue_1.default.findById(issue._id)
            .populate('reportedBy', 'name avatar')
            .lean();
        res.status(201).json({
            message: 'Issue reported successfully.',
            issue: populated,
        });
    }
    catch (error) {
        console.error('Issue controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.createIssue = createIssue;
// PUT /api/issues/:id — Update issue (official only)
const updateIssue = async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        const allowedUpdates = ['title', 'description', 'category', 'address', 'ward'];
        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        const updated = await Issue_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        })
            .populate('reportedBy', 'name avatar')
            .populate('assignedTo', 'name department');
        res.json({ message: 'Issue updated.', issue: updated });
    }
    catch (error) {
        console.error('Issue controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.updateIssue = updateIssue;
// DELETE /api/issues/:id — Delete issue (admin only)
const deleteIssue = async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        await Issue_1.default.findByIdAndDelete(req.params.id);
        // Clean up votes
        await Vote_1.default.deleteMany({ issue: req.params.id });
        res.json({ message: 'Issue deleted successfully.' });
    }
    catch (error) {
        console.error('Issue controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.deleteIssue = deleteIssue;
// POST /api/issues/:id/vote — Toggle vote
const toggleVote = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const { id } = req.params;
        const userId = req.user._id;
        const issue = await Issue_1.default.findById(id);
        if (!issue) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        const hasVoted = issue.voters.some((v) => v.toString() === userId.toString());
        if (hasVoted) {
            // Remove vote
            await Issue_1.default.findByIdAndUpdate(id, {
                $pull: { voters: userId },
                $inc: { voteCount: -1 },
            });
            await Vote_1.default.findOneAndDelete({ issue: id, user: userId });
        }
        else {
            // Add vote
            await Issue_1.default.findByIdAndUpdate(id, {
                $addToSet: { voters: userId },
                $inc: { voteCount: 1 },
            });
            await Vote_1.default.create({ issue: id, user: userId });
        }
        // Recalculate priority
        await recalculatePriority(id);
        const updated = await Issue_1.default.findById(id);
        res.json({
            voteCount: updated.voteCount,
            isVoted: !hasVoted,
        });
    }
    catch (error) {
        console.error('Issue controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.toggleVote = toggleVote;
//# sourceMappingURL=issue.controller.js.map