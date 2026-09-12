'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Map, Flame } from 'lucide-react';
import { CATEGORY_CONFIG, HeatmapPoint } from '@/types';
import api from '@/lib/api';

export default function HeatmapPage() {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const heatLayerRef = useRef<any>(null);
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [days, setDays] = useState('');
  const [category, setCategory] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet.heat');

      const map = L.map(mapContainerRef.current!, {
        center: [28.6139, 77.209],
        zoom: 12,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'map-tiles-dark',
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    };

    initMap();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Fetch data
  useEffect(() => {
    const params: any = {};
    if (days) params.days = days;
    if (category) params.category = category;
    api.get('/api/stats/heatmap', { params })
      .then((r) => setPoints(r.data.points))
      .catch(() => {});
  }, [days, category]);

  // Render heatmap
  useEffect(() => {
    if (!mapRef.current || !mapReady || points.length === 0) return;
    const L = require('leaflet');

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
    }

    const heatData = points.map((p) => [p.lat, p.lng, p.weight]);
    heatLayerRef.current = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.2: '#60A5FA', 0.4: '#E8943A', 0.6: '#FBBF24', 0.8: '#F87171', 1.0: '#DC2626' },
    }).addTo(mapRef.current);
  }, [points, mapReady]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-text-primary"><Flame className="w-6 h-6 text-primary" /> Heatmap</h1>
          <p className="text-sm text-text-muted mt-1">Problem density visualization. {points.length} data points.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
        >
          <option value="">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.icon} {config.label}</option>
          ))}
        </select>
      </div>

      {/* Map */}
      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
