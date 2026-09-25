/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { Issue, CATEGORY_CONFIG, IssueCategory } from '@/types';
import StatusBadge from './StatusBadge';
import VoteButton from './VoteButton';
import { timeAgo, truncate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import DepthCard from '@/components/ui/DepthCard';

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
      className="h-full"
    >
      <Link href={`/issues/${issue._id}`}>
        <DepthCard depth="shallow" className="overflow-hidden group cursor-pointer h-full flex flex-col p-0">
          {/* Photo */}
          {issue.photos && issue.photos.length > 0 ? (
            <div className="relative h-44 overflow-hidden rounded-t-2xl">
              <img
                src={issue.photos[0].thumbnail || issue.photos[0].url}
                alt={issue.title}
                loading="lazy"
                width={400}
                height={300}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-surface-2"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3">
                <span
                  className="px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md"
                  style={{ backgroundColor: categoryConfig.color + '33', color: categoryConfig.color, border: `1px solid ${categoryConfig.color}40` }}
                >
                  {categoryConfig.icon} {categoryConfig.label}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={issue.status} />
              </div>
            </div>
          ) : (
            <div className="relative h-32 bg-[linear-gradient(135deg,#2A2A2A,#1A1A1A,#2A2A2A)] rounded-t-2xl flex items-center justify-center border-b border-white/[0.06]">
              <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{categoryConfig.icon}</span>
              <div className="absolute top-3 left-3">
                <span
                  className="px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md"
                  style={{ backgroundColor: categoryConfig.color + '33', color: categoryConfig.color, border: `1px solid ${categoryConfig.color}40` }}
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
          <div className="p-4 flex-1 flex flex-col bg-[#141414] rounded-b-2xl">
            <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {issue.title}
            </h3>

            <div className="flex items-center gap-1.5 text-text-muted text-xs mb-4">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span className="truncate tracking-wide">{truncate(issue.address || 'Location not specified', 40)}</span>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3">
              <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span className="tracking-wide">{timeAgo(issue.createdAt)}</span>
              </div>

              <VoteButton
                issueId={issue._id}
                initialVoteCount={issue.voteCount}
                initialIsVoted={isVoted}
                size="sm"
              />
            </div>
          </div>
        </DepthCard>
      </Link>
    </motion.div>
  );
}

