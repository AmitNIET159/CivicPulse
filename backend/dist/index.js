"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
// Route imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const issue_routes_1 = __importDefault(require("./routes/issue.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const official_routes_1 = __importDefault(require("./routes/official.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
(0, db_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use('/api/', rateLimit_middleware_1.apiLimiter);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/issues', issue_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/official', official_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
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
app.listen(PORT, () => {
    console.log(`🚀 CivicPulse API running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map