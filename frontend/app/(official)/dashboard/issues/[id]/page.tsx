'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, User, ArrowBigUp } from 'lucide-react';
import { Issue, CATEGORY_CONFIG, STATUS_CONFIG, IssueCategory, IssueStatus } from '@/types';
import api from '@/lib/api';
import StatusBadge from '@/components/issues/StatusBadge';
import StatusUpdater from '@/components/dashboard/StatusUpdater';
import AssignOfficer from '@/components/dashboard/AssignOfficer';
import { formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function OfficialIssueDetailPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/api/issues/${id}`)
        .then((r) => setIssue(r.data.issue))
        .catch(() => toast.error('Failed to load'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleStatusUpdate = (newStatus: IssueStatus) => {
    if (issue) setIssue({ ...issue, status: newStatus });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!issue) {
    return <div className="text-center py-20"><h2 className="text-xl font-bold">Issue not found</h2></div>;
  }

  const catConfig = CATEGORY_CONFIG[issue.category as IssueCategory];
  const reporter = typeof issue.reportedBy === 'object' ? issue.reportedBy : null;
  const assignee = issue.assignedTo && typeof issue.assignedTo === 'object' ? issue.assignedTo : null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/issues" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Issues
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: catConfig.color + '22', color: catConfig.color }}>
              {catConfig.icon} {catConfig.label}
            </span>
            <StatusBadge status={issue.status} size="md" />
          </div>
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(issue.createdAt)}</span>
            <span className="flex items-center gap-1"><ArrowBigUp className="w-3 h-3 text-primary" />{issue.voteCount} votes</span>
            {reporter && <span className="flex items-center gap-1"><User className="w-3 h-3" />{reporter.name}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {issue.photos.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="grid grid-cols-3 gap-1">
                {issue.photos.map((photo, i) => (
                  <img key={i} src={photo.url} alt="" className="w-full aspect-video object-cover" />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm leading-relaxed">{issue.description}</p>
          </div>

          {/* Location */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                Location
              </h3>
              <p className="text-xs text-text-muted mt-1">{issue.address}</p>
            </div>
            <div className="h-64">
              <IssueMap
                issues={[issue]}
                center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                zoom={15}
                height="256px"
                showClusters={false}
              />
            </div>
          </div>

          {/* Status History */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Status History</h3>
            <div className="space-y-3">
              {issue.statusHistory.map((entry, i) => {
                const changedByName = typeof entry.changedBy === 'object' ? entry.changedBy.name : 'System';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_CONFIG[entry.status as IssueStatus]?.color || '#6B7280' }} />
                    <div>
                      <p>
                        <span className="font-medium">{changedByName}</span>
                        {' changed status to '}
                        <span className="font-medium" style={{ color: STATUS_CONFIG[entry.status as IssueStatus]?.color }}>
                          {STATUS_CONFIG[entry.status as IssueStatus]?.label || entry.status}
                        </span>
                      </p>
                      {entry.note && <p className="text-text-muted text-xs mt-0.5">{entry.note}</p>}
                      <p className="text-text-muted text-xs">{formatDate(entry.changedAt)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <StatusUpdater issueId={issue._id} currentStatus={issue.status} onStatusUpdate={handleStatusUpdate} />
          <AssignOfficer issueId={issue._id} currentAssignee={assignee} onAssign={() => {}} />

          {/* Meta */}
          <div className="glass-card p-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Priority Score</span><span className="font-mono text-primary font-bold">{Math.round(issue.priority)}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Ward</span><span>{issue.ward || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Reported</span><span>{timeAgo(issue.createdAt)}</span></div>
            {issue.resolvedAt && <div className="flex justify-between"><span className="text-text-muted">Resolved</span><span className="text-success">{formatDate(issue.resolvedAt)}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
