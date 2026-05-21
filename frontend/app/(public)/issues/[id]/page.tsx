'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, Share2, ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Issue, CATEGORY_CONFIG, STATUS_CONFIG, IssueCategory, IssueStatus } from '@/types';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import StatusBadge from '@/components/issues/StatusBadge';
import VoteButton from '@/components/issues/VoteButton';
import { formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function IssueDetailPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      api.get(`/api/issues/${id}`)
        .then((res) => setIssue(res.data.issue))
        .catch(() => toast.error('Failed to load issue'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-bold">Issue not found</h2>
        <Link href="/issues" className="text-primary mt-4 inline-block">Back to issues</Link>
      </div>
    );
  }

  const catConfig = CATEGORY_CONFIG[issue.category as IssueCategory];
  const reporter = typeof issue.reportedBy === 'object' ? issue.reportedBy : null;
  const assignee = issue.assignedTo && typeof issue.assignedTo === 'object' ? issue.assignedTo : null;
  const isVoted = user ? issue.voters?.includes(user._id) : false;

  const statusSteps: IssueStatus[] = ['pending', 'under_review', 'in_progress', 'resolved'];
  const currentStepIndex = statusSteps.indexOf(issue.status);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <Link href="/issues" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Issues
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            {issue.photos && issue.photos.length > 0 && (
              <div className="glass-card overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={issue.photos[currentPhoto]?.url}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {issue.photos.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {issue.photos.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhoto(i)}
                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                          i === currentPhoto ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={photo.thumbnail || photo.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Issue Info */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: catConfig.color + '22', color: catConfig.color }}
                    >
                      {catConfig.icon} {catConfig.label}
                    </span>
                    <StatusBadge status={issue.status} size="md" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{issue.title}</h1>
                </div>
                <VoteButton issueId={issue._id} initialVoteCount={issue.voteCount} initialIsVoted={isVoted} size="lg" />
              </div>

              <p className="text-text-muted leading-relaxed mb-6">{issue.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {issue.address || 'No address'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(issue.createdAt)}
                </div>
                {reporter && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {reporter.name}
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
              <div className="flex items-center gap-2">
                {statusSteps.map((step, i) => {
                  const isCompleted = i <= currentStepIndex && issue.status !== 'rejected';
                  const isCurrent = i === currentStepIndex;
                  const stepConfig = STATUS_CONFIG[step];
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : 'bg-surface border border-border text-text-muted'
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-xs mt-1 ${isCurrent ? 'text-primary font-medium' : 'text-text-muted'}`}>
                          {stepConfig.label}
                        </span>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`h-0.5 flex-1 ${isCompleted && i < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              {issue.status === 'rejected' && (
                <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Issue Rejected</p>
                    {issue.rejectionReason && <p className="text-danger/80 mt-1">{issue.rejectionReason}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Official Response */}
            {issue.officialComment && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-3">Official Response</h3>
                <p className="text-text-muted text-sm">{issue.officialComment}</p>
                {assignee && (
                  <p className="text-xs text-text-muted mt-3">— {assignee.name}, {assignee.department}</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Map */}
            <div className="glass-card overflow-hidden">
              <div className="p-3 border-b border-border">
                <h4 className="text-sm font-semibold">Location</h4>
              </div>
              <div className="h-48">
                <IssueMap
                  issues={[issue]}
                  center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                  zoom={15}
                  height="192px"
                  showClusters={false}
                  interactive={false}
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-text-muted font-mono">
                  {issue.location.coordinates[1].toFixed(6)}, {issue.location.coordinates[0].toFixed(6)}
                </p>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium hover:border-primary/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Issue
            </button>

            {/* Meta info */}
            <div className="glass-card p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Ward</span>
                <span className="font-medium">{issue.ward || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Priority Score</span>
                <span className="font-mono text-primary font-bold">{Math.round(issue.priority)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Reported</span>
                <span>{timeAgo(issue.createdAt)}</span>
              </div>
              {issue.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Resolved</span>
                  <span className="text-success">{formatDate(issue.resolvedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
