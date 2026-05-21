'use client';

import { IssueStatus, STATUS_CONFIG } from '@/types';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const isActive = status === 'in_progress' || status === 'under_review';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      {isActive && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.color }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {config.label}
    </span>
  );
}
