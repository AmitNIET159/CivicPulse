"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const issueSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    voteCount: {
        type: Number,
        default: 0,
    },
    voters: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
            changedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            changedAt: { type: Date, default: Date.now },
            note: { type: String, default: '' },
        },
    ],
}, {
    timestamps: true,
});
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
const Issue = mongoose_1.default.model('Issue', issueSchema);
exports.default = Issue;
//# sourceMappingURL=Issue.js.map