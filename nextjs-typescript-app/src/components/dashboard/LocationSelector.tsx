"use client";

import { useState, useEffect } from 'react';

interface PopularLocation {
  name: string;
  coordinates: [number, number];
  description: string;
  type: 'city' | 'forest' | 'ocean' | 'desert' | 'arctic';
}

interface LocationSelectorProps {
  onLocationSelect: (lat: number, lon: number, name?: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSelect }) => {
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    // Fetch popular locations from backend
    const fetchPopularLocations = async () => {
      try {
        const response = await fetch('http://localhost:5000/locations/popular');
        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }
        const data = await response.json();
        setPopularLocations(Array.isArray(data.popular_locations) ? data.popular_locations : []);
      } catch (error) {
        console.error('Failed to fetch popular locations:', error);
        // No fallback - show error state
        setPopularLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularLocations();
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    
    if (isNaN(lat) || isNaN(lon)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90');
      return;
    }
    
    if (lon < -180 || lon > 180) {
      alert('Longitude must be between -180 and 180');
      return;
    }
    
    onLocationSelect(lat, lon, `Custom Location (${lat}, ${lon})`);
  };

  const handleCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Update the input fields
        setCustomLat(lat.toString());
        setCustomLon(lon.toString());
        
        // Automatically analyze current location
        onLocationSelect(lat, lon, `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        alert(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getLocationIcon = (type: string) => {
    const icons = {
      city: '🏙️',
      forest: '🌲',
      ocean: '🌊',
      desert: '🏜️',
      arctic: '🧊'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  return (
    <div className="space-y-6 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-100">Choose where to analyse</h3>
        <p className="mt-2 text-xs text-slate-400">
          Pick a featured area or drop in coordinates to launch a fresh assessment.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCurrentLocation}
          disabled={gettingLocation}
          className="flex w-full items-center justify-center gap-2 rounded border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {gettingLocation ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
              Locating device...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use current position
            </>
          )}
        </button>

        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-green-400 focus:outline-none"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-green-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-medium text-slate-50 transition-colors hover:border-green-500/60"
          >
            Analyse custom coordinates
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">Featured locations</p>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded border border-slate-900 bg-slate-950/40" />
            ))}
          </div>
        ) : popularLocations && popularLocations.length === 0 ? (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-center text-xs text-red-200">
            Backend offline — start the Flask service to load presets.
          </div>
        ) : popularLocations && popularLocations.length > 0 ? (
          <div className="space-y-2">
            {(popularLocations || []).slice(0, 3).map((location, index) => (
              <button
                key={index}
                onClick={() =>
                  onLocationSelect(
                    location.coordinates?.[0] || 0,
                    location.coordinates?.[1] || 0,
                    location.name
                  )
                }
                className={`w-full rounded border border-slate-900 bg-slate-950/40 p-3 text-left transition-colors hover:border-green-500/40`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getLocationIcon(location.type)}</span>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-100">{location.name}</div>
                      <div className="text-xs text-slate-400">{location.description}</div>
                      <div className="text-[11px] text-slate-500">
                        {location.coordinates?.[0]?.toFixed(2) || 0}, {location.coordinates?.[1]?.toFixed(2) || 0}
                      </div>
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded border border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-400">
            No saved locations yet.
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Location Required</p>
        <div className="mt-2 text-xs text-slate-400">
          Please enter coordinates manually or use current location to analyze environmental data.
        </div>
      </div>
    </div>
  );
};