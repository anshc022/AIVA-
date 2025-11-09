"use client";

import { useState } from 'react';

interface QuickActionsPanelProps {
  onQuickAnalysis: (lat: number, lon: number, name: string) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onQuickAnalysis }) => {
  const [showActions, setShowActions] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const quickLocations = [
    { name: "Times Square, NYC", lat: 40.7580, lon: -73.9855, icon: "🏙️" },
    { name: "Golden Gate Park", lat: 37.7749, lon: -122.4194, icon: "🌳" },
    { name: "Amazon Basin", lat: -3.4653, lon: -62.2159, icon: "🌲" },
    { name: "Sahara Desert", lat: 23.8041, lon: 5.5218, icon: "🏜️" }
  ];

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
        onQuickAnalysis(lat, lon, `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        setShowActions(false);
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Actions Menu */}
      {showActions && (
        <div className="mb-4 space-y-2">
          {/* Current Location Button */}
          <button
            onClick={handleCurrentLocation}
            disabled={gettingLocation}
            className="block w-full bg-black/80 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400 text-left p-3 rounded-lg text-white hover:bg-blue-600/20 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-2">
              {gettingLocation ? (
                <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              ) : (
                <span className="text-lg">📍</span>
              )}
              <div>
                <div className="text-sm font-medium">
                  {gettingLocation ? 'Getting Location...' : 'Current Location'}
                </div>
                <div className="text-xs text-blue-400">
                  {gettingLocation ? 'Please wait...' : 'Use GPS coordinates'}
                </div>
              </div>
            </div>
          </button>
          
          {quickLocations.map((location, index) => (
            <button
              key={index}
              onClick={() => {
                onQuickAnalysis(location.lat, location.lon, location.name);
                setShowActions(false);
              }}
              className="block w-full bg-black/80 backdrop-blur-sm border border-green-500/30 hover:border-green-400 text-left p-3 rounded-lg text-white hover:bg-green-600/20 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{location.icon}</span>
                <div>
                  <div className="text-sm font-medium">{location.name}</div>
                  <div className="text-xs text-green-400">
                    {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setShowActions(!showActions)}
        className={`w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform ${
          showActions ? 'rotate-45 scale-110' : 'hover:scale-110'
        }`}
      >
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
      </button>

      {/* Tooltip */}
      {!showActions && (
        <div className="absolute bottom-16 right-0 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Quick Analysis & Current Location
        </div>
      )}
    </div>
  );
};