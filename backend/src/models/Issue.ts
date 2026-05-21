import mongoose, { Document, Schema } from 'mongoose';

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
  category:
    | 'pothole'
    | 'streetlight'
    | 'garbage'
    | 'drainage'
    | 'water_supply'
    | 'encroachment'
    | 'noise'
    | 'stray_animals'
    | 'other';
  status: 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
  priority: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
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

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'pothole',
        'streetlight',
        'garbage',
        'drainage',
        'water_supply',
        'encroachment',
        'noise',
        'stray_animals',
        'other',
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: Number,
      default: 30, // Fresh issues get max urgency boost
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
      },
    },
    address: {
      type: String,
      default: '',
    },
    ward: {
      type: String,
      default: '',
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        thumbnail: { type: String, required: true },
      },
    ],
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    voters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    officialComment: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// REQUIRED: 2dsphere index for geospatial queries
issueSchema.index({ location: '2dsphere' });
// Priority sorting
issueSchema.index({ voteCount: -1 });
// Compound filter index
issueSchema.index({ status: 1, category: 1 });
// Ward-based lookups for officials
issueSchema.index({ ward: 1, status: 1 });
// Reporter lookups
issueSchema.index({ reportedBy: 1 });
// Assigned official lookups
issueSchema.index({ assignedTo: 1 });

const Issue = mongoose.model<IIssue>('Issue', issueSchema);
export default Issue;
