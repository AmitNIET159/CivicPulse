'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Issue, CATEGORY_CONFIG, IssueCategory } from '@/types';

interface IssueMapProps {
  issues?: Issue[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (issue: Issue) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: { lat: number; lng: number } | null;
  height?: string;
  showClusters?: boolean;
  interactive?: boolean;
  showUserLocation?: boolean;
  onUserLocationFound?: (lat: number, lng: number) => void;
}

export default function IssueMap({
  issues = [],
  center = [28.6139, 77.209],
  zoom = 12,
  onMarkerClick,
  onMapClick,
  selectedPosition,
  height = '100%',
  showClusters = true,
  interactive = true,
  showUserLocation = true,
  onUserLocationFound,
}: IssueMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any>(null);
  const selectedMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Locate the user and add a blue pulsing dot
  const locateUser = useCallback((panToLocation = true) => {
    if (!navigator.geolocation || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const L = require('leaflet');
        const map = mapRef.current;
        if (!map) return;

        setUserLocation({ lat: latitude, lng: longitude });

        // Remove old user markers
        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        if (userCircleRef.current) map.removeLayer(userCircleRef.current);

        // Accuracy circle
        userCircleRef.current = L.circle([latitude, longitude], {
          radius: Math.min(accuracy, 500),
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.08,
          weight: 1,
          opacity: 0.3,
        }).addTo(map);

        // Pulsing blue dot
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="position:relative;width:20px;height:20px;">
              <div style="
                position:absolute;inset:0;
                background:rgba(59,130,246,0.25);
                border-radius:50%;
                animation:userPulse 2s ease-out infinite;
              "></div>
              <div style="
                position:absolute;top:4px;left:4px;
                width:12px;height:12px;
                background:#3B82F6;
                border:2.5px solid white;
                border-radius:50%;
                box-shadow:0 0 8px rgba(59,130,246,0.6);
              "></div>
            </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([latitude, longitude], {
          icon: userIcon,
          zIndexOffset: 1000,
          interactive: false,
        }).addTo(map);

        userMarkerRef.current.bindPopup(
          `<div style="text-align:center;padding:4px;">
            <strong style="font-size:13px;">📍 You are here</strong><br/>
            <span style="font-size:11px;color:#9CA3AF;">Accuracy: ~${Math.round(accuracy)}m</span>
          </div>`
        );

        if (panToLocation) {
          map.setView([latitude, longitude], 14, { animate: true, duration: 1.2 });
        }

        onUserLocationFound?.(latitude, longitude);
      },
      () => {
        // Silently fail — user denied location or error
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onUserLocationFound]);

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const L = (await import('leaflet')).default;
    await import('leaflet.markercluster');

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      scrollWheelZoom: interactive,
      dragging: interactive,
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    if (onMapClick) {
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Auto-locate user when map is ready
  useEffect(() => {
    if (mapReady && showUserLocation) {
      locateUser(true);
    }
  }, [mapReady, showUserLocation]);

  // Update markers when issues change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const L = require('leaflet');

    // Clear existing markers
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current);
    }

    if (issues.length === 0) return;

    const markerClusterGroup = showClusters
      ? (L as any).markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
        })
      : L.layerGroup();

    issues.forEach((issue) => {
      const [lng, lat] = issue.location.coordinates;
      const catConfig = CATEGORY_CONFIG[issue.category as IssueCategory];

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px; height: 32px;
          background: ${catConfig.color};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "><span style="transform: rotate(45deg); font-size: 14px;">${catConfig.icon}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon });

      const popupContent = `
        <div style="min-width: 200px; padding: 4px;">
          <h4 style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${issue.title}</h4>
          <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 8px;">${issue.address || 'No address'}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: ${catConfig.color};">${catConfig.label}</span>
            <span style="font-size: 12px;">👍 ${issue.voteCount} votes</span>
          </div>
          <a href="/issues/${issue._id}" style="
            display: block; text-align: center; margin-top: 8px;
            padding: 6px 12px; background: #3B82F6; color: white;
            border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 500;
          ">View Details</a>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(issue));
      }

      markerClusterGroup.addLayer(marker);
    });

    mapRef.current.addLayer(markerClusterGroup);
    markersRef.current = markerClusterGroup;
  }, [issues, mapReady, showClusters]);

  // Handle selected position marker (for report form)
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const L = require('leaflet');

    if (selectedMarkerRef.current) {
      mapRef.current.removeLayer(selectedMarkerRef.current);
    }

    if (selectedPosition) {
      const icon = L.divIcon({
        className: 'selected-marker',
        html: `<div style="
          width: 40px; height: 40px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(59,130,246,0.5);
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      selectedMarkerRef.current = L.marker(
        [selectedPosition.lat, selectedPosition.lng],
        { icon }
      ).addTo(mapRef.current);

      mapRef.current.setView([selectedPosition.lat, selectedPosition.lng], 16);
    }
  }, [selectedPosition, mapReady]);

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <div
        ref={mapContainerRef}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl overflow-hidden"
      />

      {/* Locate Me button */}
      {interactive && showUserLocation && (
        <button
          onClick={() => locateUser(true)}
          title="Center on my location"
          style={{
            position: 'absolute',
            bottom: '90px',
            right: '10px',
            zIndex: 1000,
            width: '34px',
            height: '34px',
            background: userLocation ? '#1e293b' : '#1e293b',
            border: '2px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#334155';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#3B82F6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={userLocation ? '#3B82F6' : '#94a3b8'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
