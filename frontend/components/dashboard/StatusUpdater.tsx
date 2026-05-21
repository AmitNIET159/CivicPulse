'use client';

import { useState } from 'react';
import { IssueStatus, STATUS_CONFIG } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface StatusUpdaterProps {
  issueId: string;
  currentStatus: IssueStatus;
  onStatusUpdate: (status: IssueStatus) => void;
}

export default function StatusUpdater({ issueId, currentStatus, onStatusUpdate }: StatusUpdaterProps) {
  const [status, setStatus] = useState<IssueStatus>(currentStatus);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!comment.trim() && status !== currentStatus) {
      toast.error('Please add a comment when changing status');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/official/issues/${issueId}/status`, {
        status,
        comment,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      });
      toast.success('Status updated');
      onStatusUpdate(status);
      setComment('');
      setRejectionReason('');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-lg font-semibold">Update Status</h3>

      <div className="grid grid-cols-1 gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as IssueStatus)}
          className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50"
        >
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment about this status change..."
          className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 min-h-[80px] resize-none"
        />

        {status === 'rejected' && (
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 min-h-[60px] resize-none border-danger/30"
          />
        )}

        <button
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update Status
        </button>
      </div>
    </div>
  );
}
