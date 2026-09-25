import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { apiLimiter } from './middleware/rateLimit.middleware';

// Route imports
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import uploadRoutes from './routes/upload.routes';
import officialRoutes from './routes/official.routes';
import statsRoutes from './routes/stats.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render reverse proxy)

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Required if loading Cloudinary images via Next.js or direct
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sanitize MongoDB inputs (prevents NoSQL injection like {$gt: ""})
app.use(mongoSanitize());

// Only use morgan in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/official', officialRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

