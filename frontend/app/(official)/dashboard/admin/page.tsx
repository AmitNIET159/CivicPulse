'use client';

import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import DepthCard from '@/components/ui/DepthCard';
import toast from 'react-hot-toast';

export default function AdminPanelPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/system-stats')
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data);
    } catch (err: any) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/admin/users/${userId}/verify`, { isVerified: !currentStatus });
      toast.success('Verification updated');
      fetchData();
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      fetchData();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Admin Control Panel</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DepthCard className="p-6 text-center">
            <h3 className="text-text-muted text-sm font-medium mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-primary">{stats.totalUsers}</p>
          </DepthCard>
          <DepthCard className="p-6 text-center">
            <h3 className="text-text-muted text-sm font-medium mb-2">Total Issues</h3>
            <p className="text-4xl font-bold text-primary">{stats.totalIssues}</p>
          </DepthCard>
          <DepthCard className="p-6 text-center">
            <h3 className="text-text-muted text-sm font-medium mb-2">Total Comments</h3>
            <p className="text-4xl font-bold text-primary">{stats.totalComments}</p>
          </DepthCard>
        </div>
      )}

      <DepthCard className="p-6">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-text-muted text-sm">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Verified</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map(user => (
                <tr key={user._id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01]">
                  <td className="py-4 text-text-primary">{user.name}</td>
                  <td className="py-4 text-text-muted">{user.email}</td>
                  <td className="py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="bg-background border border-white/[0.1] rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-primary"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="official">Official</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <button onClick={() => handleVerify(user._id, user.isVerified)} className="focus:outline-none">
                      {user.isVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500 hover:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 hover:text-red-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-500 hover:text-red-400 p-1 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DepthCard>
    </div>
  );
}
