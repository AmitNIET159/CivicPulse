"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeam = exports.assignIssue = exports.updateIssueStatus = exports.getOfficialIssues = void 0;
const Issue_1 = __importDefault(require("../models/Issue"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
// GET /api/official/issues
const getOfficialIssues = async (req, res) => {
    try {
        const { page = '1', limit = '20', status, category, assignedTo, ward } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (assignedTo)
            filter.assignedTo = assignedTo;
        if (ward)
            filter.ward = ward;
        else if (req.user?.role === 'official')
            filter.ward = req.user.ward;
        const [issues, total] = await Promise.all([
            Issue_1.default.find(filter)
                .sort({ priority: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('reportedBy', 'name avatar')
                .populate('assignedTo', 'name department')
                .lean(),
            Issue_1.default.countDocuments(filter),
        ]);
        res.json({
            issues,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    }
    catch (error) {
        console.error('Official controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getOfficialIssues = getOfficialIssues;
// PUT /api/official/issues/:id/status
const updateIssueStatus = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Auth required.' });
            return;
        }
        const { id } = req.params;
        const { status, comment, rejectionReason } = req.body;
        const issue = await Issue_1.default.findById(id);
        if (!issue) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        const validStatuses = ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: 'Invalid status.' });
            return;
        }
        const updates = {
            status,
            $push: {
                statusHistory: {
                    status,
                    changedBy: req.user._id,
                    changedAt: new Date(),
                    note: comment || '',
                },
            },
        };
        if (comment)
            updates.officialComment = comment;
        if (status === 'rejected' && rejectionReason)
            updates.rejectionReason = rejectionReason;
        if (status === 'resolved')
            updates.resolvedAt = new Date();
        const updated = await Issue_1.default.findByIdAndUpdate(id, updates, { new: true })
            .populate('reportedBy', 'name avatar')
            .populate('assignedTo', 'name department');
        res.json({ message: 'Status updated.', issue: updated });
    }
    catch (error) {
        console.error('Official controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.updateIssueStatus = updateIssueStatus;
// PUT /api/official/issues/:id/assign
const assignIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { officialId } = req.body;
        const official = await User_1.default.findById(officialId);
        if (!official || (official.role !== 'official' && official.role !== 'admin')) {
            res.status(400).json({ message: 'Invalid official.' });
            return;
        }
        const existingIssue = await Issue_1.default.findById(id);
        if (!existingIssue) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        // Check if the assignment is actually changing to prevent duplicate notifications
        const isNewAssignment = existingIssue.assignedTo?.toString() !== officialId.toString();
        const updated = await Issue_1.default.findByIdAndUpdate(id, { assignedTo: officialId }, { new: true })
            .populate('reportedBy', 'name avatar')
            .populate('assignedTo', 'name department ward');
        if (!updated) {
            res.status(404).json({ message: 'Issue not found.' });
            return;
        }
        // STEP 6: Duplicate Prevention — only notify if assignment changed
        if (isNewAssignment) {
            await Notification_1.default.create({
                recipient: officialId,
                type: 'assignment',
                title: 'New Task Assigned',
                message: `Admin has assigned you a new civic issue: ${updated.title}`,
                relatedIssue: updated._id,
            });
        }
        res.json({ message: 'Issue assigned.', issue: updated });
    }
    catch (error) {
        console.error('Official controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.assignIssue = assignIssue;
// GET /api/official/team
const getTeam = async (req, res) => {
    try {
        const filter = { role: { $in: ['official', 'admin'] } };
        if (req.user?.role === 'official') {
            filter.$or = [{ ward: req.user.ward }, { department: req.user.department }];
        }
        const officials = await User_1.default.find(filter).select('name email ward department isVerified avatar role').lean();
        res.json({ officials });
    }
    catch (error) {
        console.error('Official controller error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getTeam = getTeam;
//# sourceMappingURL=official.controller.js.map