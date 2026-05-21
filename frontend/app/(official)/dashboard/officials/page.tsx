'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { User } from '@/types';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function OfficialsPage() {
  const { user: currentUser } = useAuthStore();
  const [officials, setOfficials] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/official/team')
      .then((r) => setOfficials(r.data.officials))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false));
  }, []);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 mx-auto text-text-muted mb-4" />
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-text-muted text-sm">Only administrators can manage official accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Officials
        </h1>
        <p className="text-sm text-text-muted mt-1">Manage government official accounts.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officials.map((official, i) => (
            <motion.div
              key={official._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {official.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{official.name}</p>
                    <p className="text-xs text-text-muted">{official.email}</p>
                  </div>
                </div>
                {official.isVerified ? (
                  <span className="flex items-center gap-1 text-xs text-success"><CheckCircle className="w-3 h-3" /> Verified</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-warning"><XCircle className="w-3 h-3" /> Pending</span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Role</span>
                  <span className="capitalize font-medium">{official.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Ward</span>
                  <span>{official.ward || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Department</span>
                  <span>{official.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Joined</span>
                  <span>{formatDate(official.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && officials.length === 0 && (
        <div className="text-center py-16 text-text-muted text-sm">No officials found</div>
      )}
    </div>
  );
}
