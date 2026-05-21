import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getOfficialIssues: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateIssueStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const assignIssue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTeam: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=official.controller.d.ts.map