'use client';

import { Issue, CATEGORY_CONFIG, IssueCategory } from '@/types';
import StatusBadge from '../issues/StatusBadge';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, UserPlus, ArrowBigUp } from 'lucide-react';

interface PriorityQueueProps {
  issues: Issue[];
}

export default function PriorityQueue({ issues }: PriorityQueueProps) {
  const getRowColor = (issue: Issue) => {
    if (issue.voteCount > 30 || daysSince(issue.createdAt) > 14) return 'border-l-danger';
    if (issue.voteCount >= 10) return 'border-l-warning';
    return 'border-l-success';
  };

  const daysSince = (dateStr: string) =>
    Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Priority Queue</h3>
        <p className="text-xs text-text-muted mt-1">Sorted by priority score</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Votes</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Age</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, index) => {
              const catConfig = CATEGORY_CONFIG[issue.category as IssueCategory];
              return (
                <motion.tr
                  key={issue._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-b border-border/50 hover:bg-surface/50 transition-colors border-l-4 ${getRowColor(issue)}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-bold text-primary">
                      {Math.round(issue.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: catConfig.color + '22', color: catConfig.color }}
                    >
                      {catConfig.icon} {catConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="text-sm truncate block">{issue.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm">
                      <ArrowBigUp className="w-4 h-4 text-primary" />
                      {issue.voteCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted">
                    {daysSince(issue.createdAt)}d
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/issues/${issue._id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {issues.length === 0 && (
        <div className="p-8 text-center text-text-muted">No issues in queue</div>
      )}
    </div>
  );
}
