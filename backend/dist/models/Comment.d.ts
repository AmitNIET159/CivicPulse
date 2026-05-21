import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    _id: mongoose.Types.ObjectId;
    issue: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    isOfficial: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Comment;
//# sourceMappingURL=Comment.d.ts.map