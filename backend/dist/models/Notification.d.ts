import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    type: 'assignment' | 'status_update' | 'general';
    title: string;
    message: string;
    relatedIssue?: mongoose.Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Notification;
//# sourceMappingURL=Notification.d.ts.map