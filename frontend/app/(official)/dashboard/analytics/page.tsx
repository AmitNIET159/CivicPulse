'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Clock } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '@/lib/api';
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/types';
import StatsGrid from '@/components/dashboard/StatsGrid';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6B7280'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-sm">
      <p className="font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [byStatus, setByStatus] = useState<any[]>([]);
  const [resTime, setResTime] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    api.get('/api/stats/trends').then((r) => setTrends(r.data.data)).catch(() => {});
    api.get('/api/stats/by-category').then((r) => setByCategory(r.data.data)).catch(() => {});
    api.get('/api/stats/by-status').then((r) => setByStatus(r.data.data)).catch(() => {});
    api.get('/api/stats/resolution-time').then((r) => setResTime(r.data.data)).catch(() => {});
    api.get('/api/stats/overview').then((r) => setOverview(r.data)).catch(() => {});
  }, []);

  const resolutionRate = overview ? Math.round((overview.resolved / Math.max(overview.totalIssues, 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Analytics</h1>
        <p className="text-sm text-text-muted mt-1">Data-driven insights for better governance.</p>
      </div>

      {/* KPIs */}
      {overview && (
        <StatsGrid stats={[
          { label: 'Resolution Rate', value: resolutionRate, icon: <TrendingUp className="w-5 h-5" />, color: '#10B981', suffix: '%' },
          { label: 'Avg Response', value: overview.avgResolutionTime, icon: <Clock className="w-5 h-5" />, color: '#F59E0B', suffix: ' days' },
          { label: 'Total Issues', value: overview.totalIssues, icon: <BarChart3 className="w-5 h-5" />, color: '#3B82F6' },
          { label: 'Pending', value: overview.pending, icon: <PieChartIcon className="w-5 h-5" />, color: '#EF4444' },
        ]} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-lg font-semibold mb-4">Issues Reported (30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="text-lg font-semibold mb-4">Issues by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={byCategory.map((d) => ({
                  ...d,
                  name: CATEGORY_CONFIG[d.category as keyof typeof CATEGORY_CONFIG]?.label || d.category,
                }))}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resolution Time Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="text-lg font-semibold mb-4">Avg Resolution Time by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={resTime.map((d) => ({
              ...d,
              name: CATEGORY_CONFIG[d.category as keyof typeof CATEGORY_CONFIG]?.label || d.category,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgDays" name="Avg Days" radius={[4, 4, 0, 0]}>
                {resTime.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byStatus.map((d) => ({
              ...d,
              name: STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG]?.label || d.status,
              fill: STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG]?.color || '#6B7280',
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Issues" radius={[4, 4, 0, 0]}>
                {byStatus.map((d, i) => (
                  <Cell key={i} fill={STATUS_CONFIG[d.status as keyof typeof STATUS_CONFIG]?.color || '#6B7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
