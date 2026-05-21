'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Issue, CATEGORY_CONFIG, IssueCategory } from '@/types';
import StatusBadge from '@/components/issues/StatusBadge';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { Eye, ArrowBigUp, Loader2, FileText } from 'lucide-react';
import IssueFilter from '@/components/issues/IssueFilter';

export default function OfficialIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('priority');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      const res = await api.get('/api/official/issues', { params });
      setIssues(res.data.issues);
      setTotal(res.data.pagination.total);
    } catch {} finally { setLoading(false); }
  }, [page, search, category, status, sort]);

  useEffect(() => { setPage(1); }, [search, category, status, sort]);
  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">All Issues</h1>
          <p className="text-sm text-text-muted">{total} issues total</p>
        </div>
      </div>

      <IssueFilter
        search={search} category={category} status={status} sort={sort}
        onSearchChange={setSearch} onCategoryChange={setCategory}
        onStatusChange={setStatus} onSortChange={setSort}
        onClear={() => { setSearch(''); setCategory(''); setStatus(''); setSort('priority'); }}
      />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Title</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Votes</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Reported</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, i) => {
                const catConfig = CATEGORY_CONFIG[issue.category as IssueCategory];
                return (
                  <motion.tr
                    key={issue._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-4 py-3 max-w-[250px]">
                      <span className="text-sm truncate block">{issue.title}</span>
                      <span className="text-xs text-text-muted">{issue.ward}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: catConfig.color }}>{catConfig.icon} {catConfig.label}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm">
                        <ArrowBigUp className="w-4 h-4 text-primary" />{issue.voteCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{timeAgo(issue.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/issues/${issue._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Manage
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {!loading && issues.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">No issues found</div>
        )}
      </div>
    </div>
  );
}
