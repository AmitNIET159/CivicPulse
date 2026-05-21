'use client';

import { useState } from 'react';
import { Crosshair, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface GPSLocatorProps {
  onLocationFound: (lat: number, lng: number, address: string) => void;
}

export default function GPSLocator({ onLocationFound }: GPSLocatorProps) {
  const [isLocating, setIsLocating] = useState(false);

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported in your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          onLocationFound(latitude, longitude, data.display_name || '');
        } catch {
          onLocationFound(latitude, longitude, '');
        }
        setIsLocating(false);
        toast.success('Location found!');
      },
      () => {
        toast.error('Could not get your location. Please pin manually on map.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <button
      type="button"
      onClick={getGPSLocation}
      disabled={isLocating}
      className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 text-primary rounded-lg hover:bg-primary/20 transition-all text-sm font-medium disabled:opacity-50"
    >
      {isLocating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Crosshair className="w-4 h-4" />
      )}
      {isLocating ? 'Locating...' : 'Use My GPS'}
    </button>
  );
}
