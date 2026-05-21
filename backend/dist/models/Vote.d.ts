import mongoose, { Document } from 'mongoose';
export interface IVote extends Document {
    _id: mongoose.Types.ObjectId;
    issue: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const Vote: mongoose.Model<IVote, {}, {}, {}, mongoose.Document<unknown, {}, IVote, {}, {}> & IVote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Vote;
//# sourceMappingURL=Vote.d.ts.map