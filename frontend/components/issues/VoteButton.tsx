'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowBigUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface VoteButtonProps {
  issueId: string;
  initialVoteCount: number;
  initialIsVoted: boolean;
  size?: 'sm' | 'lg';
  onVoteChange?: (voteCount: number, isVoted: boolean) => void;
}

export default function VoteButton({
  issueId,
  initialVoteCount,
  initialIsVoted,
  size = 'sm',
  onVoteChange,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isVoted, setIsVoted] = useState(initialIsVoted);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    if (user?.role !== 'citizen') {
      toast.error('Only citizens can vote');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    // Optimistic update
    const wasVoted = isVoted;
    setIsVoted(!wasVoted);
    setVoteCount((prev) => (wasVoted ? prev - 1 : prev + 1));

    try {
      const res = await api.post(`/api/issues/${issueId}/vote`);
      setVoteCount(res.data.voteCount);
      setIsVoted(res.data.isVoted);
      onVoteChange?.(res.data.voteCount, res.data.isVoted);
    } catch {
      // Revert
      setIsVoted(wasVoted);
      setVoteCount((prev) => (wasVoted ? prev + 1 : prev - 1));
      toast.error('Failed to vote');
    } finally {
      setIsLoading(false);
    }
  };

  const isLarge = size === 'lg';

  return (
    <motion.button
      onClick={handleVote}
      whileTap={{ scale: 0.9 }}
      className={`flex flex-col items-center gap-0.5 rounded-xl transition-all duration-200 ${
        isLarge ? 'px-6 py-3' : 'px-3 py-2'
      } ${
        isVoted
          ? 'bg-primary/20 border-primary/40 text-primary'
          : 'bg-surface border-border text-text-muted hover:text-primary hover:border-primary/30'
      } border`}
      disabled={isLoading}
    >
      <motion.div
        animate={isVoted ? { scale: [1, 1.3, 1], y: [0, -3, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <ArrowBigUp
          className={`${isLarge ? 'w-7 h-7' : 'w-5 h-5'} ${
            isVoted ? 'fill-primary' : ''
          }`}
        />
      </motion.div>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={voteCount}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -5, opacity: 0 }}
          className={`font-bold ${isLarge ? 'text-lg' : 'text-sm'}`}
        >
          {voteCount}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
