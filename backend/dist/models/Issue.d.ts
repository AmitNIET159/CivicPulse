import mongoose, { Document } from 'mongoose';
export interface IStatusHistory {
    status: string;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    note: string;
}
export interface IPhoto {
    url: string;
    publicId: string;
    thumbnail: string;
}
export interface IIssue extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: 'pothole' | 'streetlight' | 'garbage' | 'drainage' | 'water_supply' | 'encroachment' | 'noise' | 'stray_animals' | 'other';
    status: 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
    priority: number;
    location: {
        type: string;
        coordinates: [number, number];
    };
    address: string;
    ward: string;
    photos: IPhoto[];
    reportedBy: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId;
    voteCount: number;
    voters: mongoose.Types.ObjectId[];
    officialComment: string;
    resolvedAt: Date;
    rejectionReason: string;
    statusHistory: IStatusHistory[];
    createdAt: Date;
    updatedAt: Date;
}
declare const Issue: mongoose.Model<IIssue, {}, {}, {}, mongoose.Document<unknown, {}, IIssue, {}, {}> & IIssue & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Issue;
//# sourceMappingURL=Issue.d.ts.map