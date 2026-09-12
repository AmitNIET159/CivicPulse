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
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide shadow-sm backdrop-blur-md ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {isActive && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]"
          style={{ backgroundColor: config.color }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {config.label}
    </span>
  );
}
