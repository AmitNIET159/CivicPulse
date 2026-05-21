import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map