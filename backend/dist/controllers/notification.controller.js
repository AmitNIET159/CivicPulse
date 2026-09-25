"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
// GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const { page = '1', limit = '20' } = req.query;
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100);
        const skip = (pageNum - 1) * limitNum;
        const [notifications, total, unreadCount] = await Promise.all([
            Notification_1.default.find({ recipient: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Notification_1.default.countDocuments({ recipient: req.user._id }),
            Notification_1.default.countDocuments({ recipient: req.user._id, isRead: false }),
        ]);
        res.json({
            notifications,
            unreadCount,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getNotifications = getNotifications;
// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const { id } = req.params;
        // Ensure the notification belongs to the user
        const notification = await Notification_1.default.findOneAndUpdate({ _id: id, recipient: req.user._id }, { isRead: true }, { new: true });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found.' });
            return;
        }
        res.json({ message: 'Notification marked as read.', notification });
    }
    catch (error) {
        console.error('markAsRead error:', error);
        if (error.name === 'CastError') {
            res.status(400).json({ message: 'Invalid ID format.' });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.markAsRead = markAsRead;
// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        await Notification_1.default.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read.' });
    }
    catch (error) {
        console.error('markAllAsRead error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notification.controller.js.map