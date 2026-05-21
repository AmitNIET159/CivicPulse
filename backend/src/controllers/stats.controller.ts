import { Request, Response } from 'express';
import Issue from '../models/Issue';

// GET /api/stats/overview
export const getOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalIssues, resolved, pending, inProgress] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'in_progress' }),
    ]);

    // Average resolution time
    const resolvedIssues = await Issue.find({ status: 'resolved', resolvedAt: { $ne: null } })
      .select('createdAt resolvedAt').lean();
    let avgResolutionTime = 0;
    if (resolvedIssues.length > 0) {
      const totalDays = resolvedIssues.reduce((sum, issue) => {
        const days = (new Date(issue.resolvedAt!).getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgResolutionTime = Math.round((totalDays / resolvedIssues.length) * 10) / 10;
    }

    res.json({ totalIssues, resolved, pending, inProgress, avgResolutionTime });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/stats/by-category
export const getByCategory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ data: result.map((r) => ({ category: r._id, count: r.count })) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/stats/by-status
export const getByStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ data: result.map((r) => ({ status: r._id, count: r.count })) });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/stats/heatmap
export const getHeatmapData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days, category } = req.query;
    const filter: any = {};
    if (days) {
      const d = parseInt(days as string, 10);
      filter.createdAt = { $gte: new Date(Date.now() - d * 24 * 60 * 60 * 1000) };
    }
    if (category) filter.category = category;

    const issues = await Issue.find(filter)
      .select('location voteCount')
      .lean();

    const points = issues.map((issue) => ({
      lat: issue.location.coordinates[1],
      lng: issue.location.coordinates[0],
      weight: Math.max(issue.voteCount, 1),
    }));

    res.json({ points });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/stats/trends
export const getTrends = async (_req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Issue.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// GET /api/stats/resolution-time
export const getResolutionTime = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Issue.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
