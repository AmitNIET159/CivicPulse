import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getIssues: (req: Request, res: Response) => Promise<void>;
export declare const getNearbyIssues: (req: Request, res: Response) => Promise<void>;
export declare const getPriorityIssues: (req: Request, res: Response) => Promise<void>;
export declare const getIssueById: (req: Request, res: Response) => Promise<void>;
export declare const createIssue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateIssue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteIssue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleVote: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=issue.controller.d.ts.map