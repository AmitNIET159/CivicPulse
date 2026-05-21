'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, UserCheck } from 'lucide-react';

interface AssignOfficerProps {
  issueId: string;
  currentAssignee?: { _id: string; name: string } | null;
  onAssign: (official: User) => void;
}

export default function AssignOfficer({ issueId, currentAssignee, onAssign }: AssignOfficerProps) {
  const [officials, setOfficials] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState(currentAssignee?._id || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/official/team')
      .then((res) => setOfficials(res.data.officials))
      .catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!selectedId) {
      toast.error('Select an officer');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put(`/api/official/issues/${issueId}/assign`, {
        officialId: selectedId,
      });
      const assignedOfficial = officials.find((o) => o._id === selectedId);
      if (assignedOfficial) onAssign(assignedOfficial);
      toast.success('Issue assigned successfully');
    } catch {
      toast.error('Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-primary" />
        Assign Officer
      </h3>

      {currentAssignee && (
        <p className="text-sm text-text-muted">
          Currently assigned to: <span className="text-text-primary font-medium">{currentAssignee.name}</span>
        </p>
      )}

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50"
      >
        <option value="">Select an officer...</option>
        {officials.map((o) => (
          <option key={o._id} value={o._id}>
            {o.name} — {o.department} ({o.ward})
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        disabled={loading || !selectedId}
        className="w-full py-2.5 bg-primary/10 border border-primary/30 text-primary rounded-lg font-medium text-sm hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Assign
      </button>
    </div>
  );
}
