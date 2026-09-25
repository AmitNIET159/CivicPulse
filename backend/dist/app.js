"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
// Route imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const issue_routes_1 = __importDefault(require("./routes/issue.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const official_routes_1 = __importDefault(require("./routes/official.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1); // Trust first proxy (Render reverse proxy)
// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());
// Security Headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Required if loading Cloudinary images via Next.js or direct
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS policy: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Sanitize MongoDB inputs (prevents NoSQL injection like {$gt: ""})
app.use((0, express_mongo_sanitize_1.default)());
// Only use morgan in non-test environments
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
app.use('/api/', rateLimit_middleware_1.apiLimiter);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/issues', issue_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/official', official_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map