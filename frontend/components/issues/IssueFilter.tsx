'use client';

import { IssueCategory, IssueStatus, CATEGORY_CONFIG, STATUS_CONFIG } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import DepthCard from '@/components/ui/DepthCard';

interface IssueFilterProps {
  search: string;
  category: string;
  status: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

export default function IssueFilter({
  search, category, status, sort,
  onSearchChange, onCategoryChange, onStatusChange, onSortChange, onClear,
}: IssueFilterProps) {
  const hasFilters = search || category || status || sort !== 'priority';

  return (
    <DepthCard depth="shallow" className="p-4 space-y-4 border-l-2 border-l-primary/50 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute -left-10 -top-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Search */}
      <div className="relative z-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 z-10 relative">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 min-w-[140px] transition-all cursor-pointer hover:border-white/[0.12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.icon} {config.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 min-w-[140px] transition-all cursor-pointer hover:border-white/[0.12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 min-w-[140px] transition-all cursor-pointer hover:border-white/[0.12] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <option value="priority">Most Priority</option>
          <option value="votes">Most Voted</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="updated">Recently Updated</option>
        </select>

        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-danger border border-danger/40 bg-danger/5 rounded-lg hover:bg-danger/20 hover:border-danger transition-all ml-auto"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </DepthCard>
  );
}
