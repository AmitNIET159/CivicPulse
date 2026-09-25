"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.getComments = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const Issue_1 = __importDefault(require("../models/Issue"));
const Comment_1 = __importDefault(require("../models/Comment"));
// GET /api/issues/:id/comments
const getComments = async (req, res) => {
    try {
        const { id: issueId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(issueId)) {
            res.status(400).json({ message: 'Invalid Issue ID format.' });
            return;
        }
        const { page = '1', limit = '50' } = req.query;
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 50 : Math.min(parsedLimit, 100);
        const skip = (pageNum - 1) * limitNum;
        // Fetch comments for issue
        const [comments, total] = await Promise.all([
            Comment_1.default.find({ issue: issueId })
                .sort({ createdAt: 1 }) // oldest first (standard chronological order for threads)
                .skip(skip)
                .limit(limitNum)
                .populate('author', 'name role avatar'), // Only populate safe fields
            Comment_1.default.countDocuments({ issue: issueId })
        ]);
        res.json({
            comments,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error fetching comments.' });
    }
};
exports.getComments = getComments;
// POST /api/issues/:id/comments
const createComment = async (req, res) => {
    try {
        // 1. Validation
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { id: issueId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(issueId)) {
            res.status(400).json({ message: 'Invalid Issue ID format.' });
            return;
        }
        const user = req.user;
        const { content } = req.body;
        // 2. Check if issue exists
        const issue = await Issue_1.default.findById(issueId);
        if (!issue) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        // 3. Create comment
        const comment = new Comment_1.default({
            issue: issueId,
            author: user._id,
            content,
            isOfficial: user.role === 'official' || user.role === 'admin'
        });
        await comment.save();
        // Re-populate author before returning
        await comment.populate('author', 'name role avatar');
        res.status(201).json({ comment, message: 'Comment posted successfully.' });
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Server error creating comment.' });
    }
};
exports.createComment = createComment;
//# sourceMappingURL=comment.controller.js.map