/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, User as UserIcon } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import DepthCard from '@/components/ui/DepthCard';

interface CommentAuthor {
  _id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  author: CommentAuthor;
  isOfficial: boolean;
  createdAt: string;
}

interface CommentSectionProps {
  issueId: string;
}

export default function CommentSection({ issueId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { user, isAuthenticated } = useAuthStore();

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/api/issues/${issueId}/comments`);
      setComments(res.data.comments);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await api.post(`/api/issues/${issueId}/comments`, {
        content: newComment.trim(),
      });
      setComments([...comments, res.data.comment]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DepthCard depth="shallow" className="p-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </DepthCard>
    );
  }

  return (
    <DepthCard depth="shallow" className="p-6">
      <h3 className="text-lg font-semibold mb-6 text-text-primary">Discussion</h3>
      
      <div className="space-y-6 mb-8">
        {comments.length === 0 ? (
          <p className="text-text-muted text-sm italic">No comments yet. Be the first to start the discussion!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className={`flex gap-4 ${comment.isOfficial ? 'bg-primary/5 p-4 rounded-xl border border-primary/10' : ''}`}>
              <div className="flex-shrink-0">
                {comment.author.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center border border-white/10">
                    <UserIcon className="w-5 h-5 text-text-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-text-primary truncate">
                      {comment.author.name}
                    </span>
                    {comment.isOfficial && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-background uppercase tracking-wider">
                        Official
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center border border-white/10 flex-shrink-0">
              <UserIcon className="w-5 h-5 text-text-muted" />
            </div>
          )}
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-surface-2 border border-white/[0.06] rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none overflow-hidden h-[46px]"
              maxLength={500}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '46px';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-2 bottom-1.5 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-surface-2 border border-white/[0.06] rounded-xl text-center">
          <p className="text-sm text-text-muted">
            Please log in to participate in the discussion.
          </p>
        </div>
      )}
    </DepthCard>
  );
}


