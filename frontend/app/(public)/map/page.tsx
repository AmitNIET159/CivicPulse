'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Layers, MapPin, X, Crosshair } from 'lucide-react';
import { Issue, CATEGORY_CONFIG, STATUS_CONFIG, IssueCategory } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchIssues();
  }, [category, status]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 200 };
      if (category) params.category = category;
      if (status) params.status = status;
      const res = await api.get('/api/issues', { params });
      setIssues(res.data.issues);
    } catch {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const findNearMe = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await api.get('/api/issues/nearby', {
            params: { lat: latitude, lng: longitude, radius: 2000 },
          });
          setIssues(res.data.issues);
          toast.success(`Found ${res.data.issues.length} issues near you`);
        } catch {
          toast.error('Failed to find nearby issues');
        }
      },
      () => toast.error('Could not get location'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {/* Map */}
      <IssueMap issues={issues} height="100%" showClusters={true} />

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 px-4 py-2.5 glass-card text-sm font-medium hover:border-primary/30 transition-all"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        <button
          onClick={findNearMe}
          className="flex items-center gap-2 px-4 py-2.5 glass-card text-sm font-medium hover:border-primary/30 transition-all"
        >
          <Crosshair className="w-4 h-4 text-primary" />
          Near Me
        </button>
      </div>

      {/* Issue count badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="glass-card px-4 py-2 flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium">{issues.length} issues</span>
          {loading && <span className="text-text-muted">loading...</span>}
        </div>
      </div>

      {/* Sidebar filters */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute top-0 left-0 bottom-0 w-72 z-[1000] glass-card rounded-none border-t-0 border-b-0 border-l-0 p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-surface rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !category ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-text-muted'
                    }`}
                  >
                    All Categories
                  </button>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        category === key ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-text-muted'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
                  Status
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setStatus('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !status ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-text-muted'
                    }`}
                  >
                    All Statuses
                  </button>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setStatus(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        status === key ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-text-muted'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setCategory(''); setStatus(''); }}
                className="w-full py-2 text-sm text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
