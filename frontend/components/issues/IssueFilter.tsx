'use client';

import { IssueCategory, IssueStatus, CATEGORY_CONFIG, STATUS_CONFIG } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

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
    <div className="glass-card p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50 min-w-[140px]"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.icon} {config.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50 min-w-[140px]"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50 min-w-[140px]"
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
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
