'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Issue } from '@/types';
import api from '@/lib/api';
import IssueCard from '@/components/issues/IssueCard';
import IssueFilter from '@/components/issues/IssueFilter';
import { Loader2, FileText, Hexagon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';

function IssuesContent() {
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState('priority');

  const fetchIssues = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;

      const res = await api.get('/api/issues', { params });
      const newIssues = res.data.issues;

      setIssues((prev) => (append ? [...prev, ...newIssues] : newIssues));
      setHasMore(pageNum < res.data.pagination.pages);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search, category, status, sort]);

  useEffect(() => {
    setPage(1);
    fetchIssues(1);
  }, [fetchIssues]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIssues(nextPage, true);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setSort('priority');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Hexagon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
        </div>

        <IssueFilter
          search={search}
          category={category}
          status={status}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
          onSortChange={setSort}
          onClear={clearFilters}
        />

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 perspective-[1000px]">
          {issues.map((issue, i) => (
            <ScrollReveal key={issue._id} direction="up" delay={i * 0.05} className="h-full">
              <IssueCard issue={issue} index={i} />
            </ScrollReveal>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && issues.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center border border-white/[0.06]">
              <FileText className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">No issues found</h3>
            <p className="text-text-muted text-sm">Try adjusting your filters</p>
          </div>
        )}

        {hasMore && !loading && issues.length > 0 && (
          <div className="flex justify-center py-8">
            <button
              onClick={loadMore}
              className="px-6 py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium hover:bg-surface hover:border-primary/30 transition-all"
            >
              Load More
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <IssuesContent />
    </Suspense>
  );
}

