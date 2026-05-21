'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Issue, StatsOverview } from '@/types';
import api from '@/lib/api';
import StatsGrid from '@/components/dashboard/StatsGrid';
import PriorityQueue from '@/components/dashboard/PriorityQueue';
import { useAuthStore } from '@/lib/store';

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [priorityIssues, setPriorityIssues] = useState<Issue[]>([]);
  const [wardIssues, setWardIssues] = useState<Issue[]>([]);

  useEffect(() => {
    api.get('/api/stats/overview').then((r) => setStats(r.data)).catch(() => {});
    api.get('/api/issues/priority?limit=15').then((r) => setPriorityIssues(r.data.issues)).catch(() => {});
    api.get('/api/official/issues', { params: { limit: 50 } }).then((r) => setWardIssues(r.data.issues)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Welcome back, {user?.name}. Here&apos;s your ward overview.</p>
      </div>

      {/* Stats */}
      {stats && (
        <StatsGrid
          stats={[
            { label: 'Pending Issues', value: stats.pending, icon: <AlertCircle className="w-5 h-5" />, color: '#EF4444' },
            { label: 'Resolved This Month', value: stats.resolved, icon: <CheckCircle className="w-5 h-5" />, color: '#10B981' },
            { label: 'Avg Resolution Time', value: stats.avgResolutionTime, icon: <Clock className="w-5 h-5" />, color: '#F59E0B', suffix: ' days' },
            { label: 'Total Issues', value: stats.totalIssues, icon: <FileText className="w-5 h-5" />, color: '#3B82F6' },
          ]}
        />
      )}

      {/* Priority Queue */}
      <PriorityQueue issues={priorityIssues} />

      {/* Map */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Ward Map</h3>
          <p className="text-xs text-text-muted mt-1">All issues in your jurisdiction</p>
        </div>
        <div className="h-[400px]">
          <IssueMap issues={wardIssues} height="400px" />
        </div>
      </div>
    </div>
  );
}
