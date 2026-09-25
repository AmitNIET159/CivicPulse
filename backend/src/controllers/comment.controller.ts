import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Issue from '../models/Issue';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/issues/:id/comments
export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: issueId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      res.status(400).json({ message: 'Invalid Issue ID format.' });
      return;
    }

    const { page = '1', limit = '50' } = req.query;
    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);
    const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 50 : Math.min(parsedLimit, 100);
    const skip = (pageNum - 1) * limitNum;

    // Fetch comments for issue
    const [comments, total] = await Promise.all([
      Comment.find({ issue: issueId })
        .sort({ createdAt: 1 }) // oldest first (standard chronological order for threads)
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'name role avatar'), // Only populate safe fields
      Comment.countDocuments({ issue: issueId })
    ]);

    res.json({
      comments,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error fetching comments.' });
  }
};

// POST /api/issues/:id/comments
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id: issueId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      res.status(400).json({ message: 'Invalid Issue ID format.' });
      return;
    }

    const user = req.user!;
    const { content } = req.body;

    // 2. Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      res.status(404).json({ message: 'Issue not found.' });
      return;
    }

    // 3. Create comment
    const comment = new Comment({
      issue: issueId,
      author: user._id,
      content,
      isOfficial: user.role === 'official' || user.role === 'admin'
    });

    await comment.save();

    // Re-populate author before returning
    await comment.populate('author', 'name role avatar');

    res.status(201).json({ comment, message: 'Comment posted successfully.' });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error creating comment.' });
  }
};
