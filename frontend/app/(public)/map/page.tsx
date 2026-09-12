'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, MapPin, X, Crosshair } from 'lucide-react';
import { Issue, CATEGORY_CONFIG, STATUS_CONFIG } from '@/types';
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
    <div className="h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Map - NO 3D TRANSFORMS ALLOWED HERE */}
      <div className="absolute inset-0 z-0" style={{ transformStyle: 'flat', perspective: 'none' }}>
        <IssueMap issues={issues} height="100%" showClusters={true} />
      </div>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 px-4 py-3 glass-card bg-[#141414]/80 backdrop-blur-md border border-white/[0.06] rounded-xl text-sm font-medium hover:border-primary/50 text-text-primary shadow-xl transition-all"
        >
          <Filter className="w-4 h-4 text-primary" />
          Filters
        </button>

        <button
          onClick={findNearMe}
          className="flex items-center gap-2 px-4 py-3 glass-card bg-[#141414]/80 backdrop-blur-md border border-white/[0.06] rounded-xl text-sm font-medium hover:border-primary/50 text-text-primary shadow-xl transition-all"
        >
          <Crosshair className="w-4 h-4 text-primary" />
          Near Me
        </button>
      </div>

      {/* Issue count badge */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="glass-card bg-[#0A0A0A]/90 backdrop-blur-md border border-primary/20 px-5 py-2.5 rounded-full flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(232,148,58,0.15)]">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-semibold text-text-primary tracking-wide">{issues.length} <span className="text-text-muted font-normal">issues</span></span>
          {loading && <span className="text-primary/70 animate-pulse ml-2 text-xs">updating...</span>}
        </div>
      </div>

      {/* Sidebar filters */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[999]"
            />
            <motion.div
              initial={{ x: -350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -350, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-80 z-[1000] bg-[#0A0A0A] border-r border-white/[0.06] p-6 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold tracking-tight text-text-primary">Map Filters</h3>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-surface-2 rounded-lg text-text-muted hover:text-text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">
                    Category
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setCategory('')}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium border ${
                        !category ? 'bg-primary/10 text-primary border-primary/20' : 'bg-transparent text-text-muted hover:bg-surface-2 hover:text-text-primary border-transparent'
                      }`}
                    >
                      All Categories
                    </button>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 font-medium border ${
                          category === key ? 'bg-primary/10 text-primary border-primary/20 shadow-[inset_0_0_10px_rgba(232,148,58,0.1)]' : 'bg-transparent text-text-muted hover:bg-surface-2 hover:text-text-primary border-transparent'
                        }`}
                      >
                        <span className="text-lg">{config.icon}</span>
                        <span>{config.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 block">
                    Status
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setStatus('')}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium border ${
                        !status ? 'bg-primary/10 text-primary border-primary/20' : 'bg-transparent text-text-muted hover:bg-surface-2 hover:text-text-primary border-transparent'
                      }`}
                    >
                      All Statuses
                    </button>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setStatus(key)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium border ${
                          status === key ? 'bg-primary/10 text-primary border-primary/20 shadow-[inset_0_0_10px_rgba(232,148,58,0.1)]' : 'bg-transparent text-text-muted hover:bg-surface-2 hover:text-text-primary border-transparent'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => { setCategory(''); setStatus(''); }}
                    className="w-full py-3 text-sm font-semibold text-danger border border-danger/30 rounded-xl hover:bg-danger/10 transition-colors flex justify-center items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
