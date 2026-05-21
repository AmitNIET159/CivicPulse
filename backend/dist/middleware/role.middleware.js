"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
            });
            return;
        }
        // Officials must be verified
        if (req.user.role === 'official' && !req.user.isVerified) {
            res.status(403).json({
                message: 'Your official account is pending verification by an admin.',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=role.middleware.js.map