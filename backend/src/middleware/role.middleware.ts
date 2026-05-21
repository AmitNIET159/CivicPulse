import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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
