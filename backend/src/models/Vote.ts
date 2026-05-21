import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  _id: mongoose.Types.ObjectId;
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — prevents duplicate votes
voteSchema.index({ issue: 1, user: 1 }, { unique: true });

const Vote = mongoose.model<IVote>('Vote', voteSchema);
export default Vote;
