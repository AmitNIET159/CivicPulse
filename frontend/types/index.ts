export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'citizen' | 'official' | 'admin';
  ward: string;
  department: string;
  isVerified: boolean;
  avatar: string;
  reportCount: number;
  createdAt: string;
}

export interface Photo {
  url: string;
  publicId: string;
  thumbnail: string;
}

export interface StatusHistoryEntry {
  status: string;
  changedBy: { _id: string; name: string; role: string } | string;
  changedAt: string;
  note: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: number;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  address: string;
  ward: string;
  photos: Photo[];
  reportedBy: { _id: string; name: string; avatar: string; email?: string; reportCount?: number } | string;
  assignedTo: { _id: string; name: string; department: string; ward?: string; avatar?: string } | null;
  voteCount: number;
  voters: string[];
  officialComment: string;
  resolvedAt: string | null;
  rejectionReason: string;
  statusHistory: StatusHistoryEntry[];
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export type IssueCategory =
  | 'pothole'
  | 'streetlight'
  | 'garbage'
  | 'drainage'
  | 'water_supply'
  | 'encroachment'
  | 'noise'
  | 'stray_animals'
  | 'other';

export type IssueStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface StatsOverview {
  totalIssues: number;
  resolved: number;
  pending: number;
  inProgress: number;
  avgResolutionTime: number;
}

export interface CategoryStat {
  category: string;
  count: number;
}

export interface StatusStat {
  status: string;
  count: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface ResolutionTimeStat {
  category: string;
  avgDays: number;
  count: number;
}

export const CATEGORY_CONFIG: Record<IssueCategory, { label: string; color: string; icon: string }> = {
  pothole: { label: 'Pothole', color: '#EF4444', icon: '🕳️' },
  streetlight: { label: 'Streetlight', color: '#F59E0B', icon: '💡' },
  garbage: { label: 'Garbage', color: '#10B981', icon: '🗑️' },
  drainage: { label: 'Drainage', color: '#3B82F6', icon: '🌊' },
  water_supply: { label: 'Water Supply', color: '#06B6D4', icon: '💧' },
  encroachment: { label: 'Encroachment', color: '#8B5CF6', icon: '🚧' },
  noise: { label: 'Noise', color: '#EC4899', icon: '🔊' },
  stray_animals: { label: 'Stray Animals', color: '#F97316', icon: '🐕' },
  other: { label: 'Other', color: '#6B7280', icon: '📌' },
};

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  under_review: { label: 'Under Review', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
  in_progress: { label: 'In Progress', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  resolved: { label: 'Resolved', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  rejected: { label: 'Rejected', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
};
