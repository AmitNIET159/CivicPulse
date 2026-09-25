"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStats = exports.deleteUser = exports.changeUserRole = exports.verifyUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Issue_1 = __importDefault(require("../models/Issue"));
const Comment_1 = __importDefault(require("../models/Comment"));
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.role)
            filter.role = req.query.role;
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ];
        }
        const users = await User_1.default.find(filter)
            .select('-password -refreshTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await User_1.default.countDocuments(filter);
        res.json({
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUsers = getUsers;
const verifyUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.isVerified = req.body.isVerified;
        await user.save();
        res.json({ message: 'User verification status updated', user: { _id: user._id, isVerified: user.isVerified } });
    }
    catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyUser = verifyUser;
const changeUserRole = async (req, res) => {
    try {
        const { role, department } = req.body;
        if (!['citizen', 'official', 'admin'].includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Prevent demoting the last admin if this was the last admin? That might be too complex.
        // Just allow it for now.
        user.role = role;
        if (department !== undefined) {
            user.department = department;
        }
        // Auto-verify citizens, unverify newly promoted officials unless explicitly passed
        if (role === 'citizen') {
            user.isVerified = true;
        }
        else if (req.body.isVerified !== undefined) {
            user.isVerified = req.body.isVerified;
        }
        await user.save();
        res.json({ message: 'User role updated', user: { _id: user._id, role: user.role, isVerified: user.isVerified } });
    }
    catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }
        res.status(500).json({ message: 'Server error' });
    }
};
exports.changeUserRole = changeUserRole;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Optional: reassign their issues or delete their issues? We probably shouldn't delete issues to maintain history.
        // We'll just delete the user.
        await User_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
const getSystemStats = async (req, res) => {
    try {
        const [totalUsers, totalIssues, totalComments, issuesByStatus, usersByRole] = await Promise.all([
            User_1.default.countDocuments(),
            Issue_1.default.countDocuments(),
            Comment_1.default.countDocuments(),
            Issue_1.default.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            User_1.default.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
        ]);
        res.json({
            totalUsers,
            totalIssues,
            totalComments,
            issuesByStatus,
            usersByRole
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSystemStats = getSystemStats;
//# sourceMappingURL=admin.controller.js.map