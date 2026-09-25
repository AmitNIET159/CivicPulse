import { Response } from 'express';
import Issue from '../models/Issue';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/official/issues
export const getOfficialIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', status, category, assignedTo, ward } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (ward) filter.ward = ward;
    else if (req.user?.role === 'official') filter.ward = req.user.ward;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ priority: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('reportedBy', 'name avatar')
        .populate('assignedTo', 'name department')
        .lean(),
      Issue.countDocuments(filter),
    ]);

    res.json({
      issues,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    console.error('Official controller error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format.' });
      return;
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/official/issues/:id/status
export const updateIssueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Auth required.' }); return; }
    const { id } = req.params;
    const { status, comment, rejectionReason } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) { res.status(404).json({ message: 'Issue not found.' }); return; }

    const validStatuses = ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status.' }); return;
    }

    const updates: any = {
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

    if (comment) updates.officialComment = comment;
    if (status === 'rejected' && rejectionReason) updates.rejectionReason = rejectionReason;
    if (status === 'resolved') updates.resolvedAt = new Date();

    const updated = await Issue.findByIdAndUpdate(id, updates, { new: true })
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name department');

    res.json({ message: 'Status updated.', issue: updated });
  } catch (error: any) {
    console.error('Official controller error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format.' });
      return;
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/official/issues/:id/assign
export const assignIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { officialId } = req.body;

    const official = await User.findById(officialId);
    if (!official || (official.role !== 'official' && official.role !== 'admin')) {
      res.status(400).json({ message: 'Invalid official.' }); return;
    }

    const existingIssue = await Issue.findById(id);
    if (!existingIssue) { res.status(404).json({ message: 'Issue not found.' }); return; }

    // Check if the assignment is actually changing to prevent duplicate notifications
    const isNewAssignment = existingIssue.assignedTo?.toString() !== officialId.toString();

    const updated = await Issue.findByIdAndUpdate(
      id,
      { assignedTo: officialId },
      { new: true }
    )
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name department ward');

    if (!updated) { res.status(404).json({ message: 'Issue not found.' }); return; }

    // STEP 6: Duplicate Prevention — only notify if assignment changed
    if (isNewAssignment) {
      await Notification.create({
        recipient: officialId,
        type: 'assignment',
        title: 'New Task Assigned',
        message: `Admin has assigned you a new civic issue: ${updated.title}`,
        relatedIssue: updated._id,
      });
    }

    res.json({ message: 'Issue assigned.', issue: updated });
  } catch (error: any) {
    console.error('Official controller error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format.' });
      return;
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/official/team
export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = { role: { $in: ['official', 'admin'] } };
    if (req.user?.role === 'official') {
      filter.$or = [{ ward: req.user.ward }, { department: req.user.department }];
    }
    const officials = await User.find(filter).select('name email ward department isVerified avatar role').lean();
    res.json({ officials });
  } catch (error: any) {
    console.error('Official controller error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format.' });
      return;
    }
    res.status(500).json({ message: 'Server error.' });
  }
};
