'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { Issue, CATEGORY_CONFIG, IssueCategory } from '@/types';
import StatusBadge from './StatusBadge';
import VoteButton from './VoteButton';
import { timeAgo, truncate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';

interface IssueCardProps {
  issue: Issue;
  index?: number;
}

export default function IssueCard({ issue, index = 0 }: IssueCardProps) {
  const categoryConfig = CATEGORY_CONFIG[issue.category as IssueCategory];
  const reporter = typeof issue.reportedBy === 'object' ? issue.reportedBy : null;
  const { user } = useAuthStore();

  const isVoted = user ? issue.voters?.includes(user._id) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/issues/${issue._id}`}>
        <div className="glass-card glass-card-hover overflow-hidden transition-all duration-300 group cursor-pointer h-full flex flex-col">
          {/* Photo */}
          {issue.photos && issue.photos.length > 0 ? (
            <div className="relative h-44 overflow-hidden">
              <img
                src={issue.photos[0].thumbnail || issue.photos[0].url}
                alt={issue.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-3">
                <span
                  className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: categoryConfig.color + '22', color: categoryConfig.color }}
                >
                  {categoryConfig.icon} {categoryConfig.label}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={issue.status} />
              </div>
            </div>
          ) : (
            <div className="relative h-32 bg-gradient-to-br from-surface to-background flex items-center justify-center">
              <span className="text-4xl">{categoryConfig.icon}</span>
              <div className="absolute top-3 left-3">
                <span
                  className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: categoryConfig.color + '22', color: categoryConfig.color }}
                >
                  {categoryConfig.label}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={issue.status} />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {issue.title}
            </h3>

            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-3">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{truncate(issue.address || 'Location not specified', 40)}</span>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock className="w-3 h-3" />
                <span>{timeAgo(issue.createdAt)}</span>
                {reporter && <span>by {reporter.name}</span>}
              </div>

              <VoteButton
                issueId={issue._id}
                initialVoteCount={issue.voteCount}
                initialIsVoted={isVoted}
                size="sm"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
