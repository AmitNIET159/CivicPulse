import { Request, Response } from 'express';
import Issue from '../models/Issue';
import Vote from '../models/Vote';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

// Priority formula helper
const recalculatePriority = async (issueId: string): Promise<void> => {
  const issue = await Issue.findById(issueId);
  if (!issue) return;
  const daysSinceCreation =
    (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const urgencyBoost = Math.max(0, 30 - daysSinceCreation);
  const priority = issue.voteCount * 2 + urgencyBoost;
  await Issue.findByIdAndUpdate(issueId, { priority });
};

// GET /api/issues — List issues (paginated, filterable)
export const getIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      status,
      category,
      ward,
      sort = 'priority',
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (ward) filter.ward = ward;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    let sortObj: any = { priority: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'votes') sortObj = { voteCount: -1 };
    if (sort === 'updated') sortObj = { updatedAt: -1 };

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('reportedBy', 'name avatar')
        .populate('assignedTo', 'name department')
        .lean(),
      Issue.countDocuments(filter),
    ]);

    res.json({
      issues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/issues/nearby — Issues near coordinates
export const getNearbyIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = '5000' } = req.query;

    if (!lat || !lng) {
      res.status(400).json({ message: 'lat and lng query parameters are required.' });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const maxDistance = parseInt(radius as string, 10);

    const issues = await Issue.aggregate([
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
    ]);

    res.json({ issues });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/issues/priority — Top issues sorted by priority
export const getPriorityIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const issues = await Issue.find({ status: { $nin: ['resolved', 'rejected'] } })
      .sort({ priority: -1 })
      .limit(limit)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name department')
      .lean();

    res.json({ issues });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/issues/:id — Single issue with full details
export const getIssueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name avatar email reportCount')
      .populate('assignedTo', 'name department ward avatar')
      .populate('statusHistory.changedBy', 'name role')
      .lean();

    if (!issue) {
      res.status(404).json({ message: 'Issue not found.' });
      return;
    }

    res.json({ issue });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// POST /api/issues — Create new issue (auth required)
export const createIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { title, description, category, coordinates, address, ward, photos } = req.body;

    if (!coordinates || !coordinates.lng || !coordinates.lat) {
      res.status(400).json({ message: 'Location coordinates are required.' });
      return;
    }

    const issue = new Issue({
      title,
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
    await User.findByIdAndUpdate(req.user._id, { $inc: { reportCount: 1 } });

    const populated = await Issue.findById(issue._id)
      .populate('reportedBy', 'name avatar')
      .lean();

    res.status(201).json({
      message: 'Issue reported successfully.',
      issue: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// PUT /api/issues/:id — Update issue (official only)
export const updateIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ message: 'Issue not found.' });
      return;
    }

    const allowedUpdates = ['title', 'description', 'category', 'address', 'ward'];
    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await Issue.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name department');

    res.json({ message: 'Issue updated.', issue: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// DELETE /api/issues/:id — Delete issue (admin only)
export const deleteIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      res.status(404).json({ message: 'Issue not found.' });
      return;
    }

    await Issue.findByIdAndDelete(req.params.id);
    // Clean up votes
    await Vote.deleteMany({ issue: req.params.id });

    res.json({ message: 'Issue deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// POST /api/issues/:id/vote — Toggle vote
export const toggleVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(id);
    if (!issue) {
      res.status(404).json({ message: 'Issue not found.' });
      return;
    }

    const hasVoted = issue.voters.some(
      (v) => v.toString() === userId.toString()
    );

    if (hasVoted) {
      // Remove vote
      await Issue.findByIdAndUpdate(id, {
        $pull: { voters: userId },
        $inc: { voteCount: -1 },
      });
      await Vote.findOneAndDelete({ issue: id, user: userId });
    } else {
      // Add vote
      await Issue.findByIdAndUpdate(id, {
        $addToSet: { voters: userId },
        $inc: { voteCount: 1 },
      });
      await Vote.create({ issue: id, user: userId });
    }

    // Recalculate priority
    await recalculatePriority(id);

    const updated = await Issue.findById(id);
    res.json({
      voteCount: updated!.voteCount,
      isVoted: !hasVoted,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
