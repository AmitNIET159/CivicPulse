'use client';

import { useEffect, useRef } from 'react';

interface HeatmapLayerProps {
  points: { lat: number; lng: number; weight: number }[];
  mapInstance: any;
}

export default function HeatmapLayer({ points, mapInstance }: HeatmapLayerProps) {
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapInstance || points.length === 0) return;

    const initHeatmap = async () => {
      await import('leaflet.heat');
      const L = require('leaflet');

      if (heatLayerRef.current) {
        mapInstance.removeLayer(heatLayerRef.current);
      }

      const heatData = points.map((p) => [p.lat, p.lng, p.weight]);
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: '#3B82F6',
          0.4: '#8B5CF6',
          0.6: '#F59E0B',
          0.8: '#EF4444',
          1.0: '#DC2626',
        },
      }).addTo(mapInstance);
    };

    initHeatmap();

    return () => {
      if (heatLayerRef.current && mapInstance) {
        mapInstance.removeLayer(heatLayerRef.current);
      }
    };
  }, [points, mapInstance]);

  return null;
}
