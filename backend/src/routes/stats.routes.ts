import { Router } from 'express';
import { getOverview, getByCategory, getByStatus, getHeatmapData, getTrends, getResolutionTime } from '../controllers/stats.controller';

const router = Router();

router.get('/overview', getOverview);
router.get('/by-category', getByCategory);
router.get('/by-status', getByStatus);
router.get('/heatmap', getHeatmapData);
router.get('/trends', getTrends);
router.get('/resolution-time', getResolutionTime);

export default router;
