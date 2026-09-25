import { Request, Response } from 'express';
import User from '../models/User';
import Issue from '../models/Issue';
import Comment from '../models/Comment';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isVerified = req.body.isVerified;
    await user.save();

    res.json({ message: 'User verification status updated', user: { _id: user._id, isVerified: user.isVerified } });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, department } = req.body;
    
    if (!['citizen', 'official', 'admin'].includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const user = await User.findById(req.params.id);
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
    } else if (req.body.isVerified !== undefined) {
      user.isVerified = req.body.isVerified;
    }
    
    await user.save();

    res.json({ message: 'User role updated', user: { _id: user._id, role: user.role, isVerified: user.isVerified } });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Optional: reassign their issues or delete their issues? We probably shouldn't delete issues to maintain history.
    // We'll just delete the user.
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalIssues,
      totalComments,
      issuesByStatus,
      usersByRole
    ] = await Promise.all([
      User.countDocuments(),
      Issue.countDocuments(),
      Comment.countDocuments(),
      Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
    ]);

    res.json({
      totalUsers,
      totalIssues,
      totalComments,
      issuesByStatus,
      usersByRole
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
