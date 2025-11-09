"use client";

import { useState, useEffect } from 'react';

interface SatelliteViewerProps {
  data: {
    location: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    satellite_image_url?: string;
    cnn_analysis?: {
      vegetation_analysis: {
        cnn_health_score: number;
        cnn_predicted_ndvi: number;
        vegetation_status: string;
      };
    };
  };
}

export const SatelliteViewer: React.FC<SatelliteViewerProps> = ({ data }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [satelliteUrl, setSatelliteUrl] = useState<string>('');

  useEffect(() => {
    // Generate satellite image URL
    const { latitude, longitude } = data.location;
    
    // If we have a provided URL, use it, otherwise generate ESRI URL
    if (data.satellite_image_url) {
      setSatelliteUrl(data.satellite_image_url);
    } else {
      // ESRI World Imagery Service
      const esriUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&bboxSR=4326&imageSR=4326&size=400,400&format=png&f=image`;
      setSatelliteUrl(esriUrl);
    }
    
    setImageLoading(true);
    setImageError(false);
  }, [data.location, data.satellite_image_url]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      good: '🌱',
      moderate: '🌾',
      poor: '🍂',
      excellent: '🌳'
    };
    return icons[status.toLowerCase() as keyof typeof icons] || '🌿';
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-green-500/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-teal-600/20 p-4 border-b border-green-500/20">
        <h3 className="text-lg font-medium text-green-100 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Satellite Imagery
        </h3>
        <p className="text-green-200/70 text-sm">
          {data.location.name || `${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Satellite Image */}
        <div className="relative bg-slate-800/20 rounded-lg overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-slate-300">Loading satellite image...</p>
              </div>
            </div>
          )}
          
          {imageError ? (
            <div className="h-64 flex items-center justify-center bg-slate-800/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-600/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 mb-2">Satellite image unavailable</p>
                <button 
                  onClick={() => {
                    setImageError(false);
                    setImageLoading(true);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <img
              src={satelliteUrl}
              alt={`Satellite view of ${data.location.name || 'location'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="w-full h-64 object-cover"
            />
          )}
          
          {/* Overlay info */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
            Satellite View
          </div>
          
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
            ESRI World Imagery
          </div>
        </div>

        {/* CNN Analysis Overlay */}
        {data.cnn_analysis && (
          <div className="bg-slate-800/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-200 mb-3 flex items-center">
              <span className="mr-2">👁️</span>
              CNN Vision Analysis
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${getHealthColor(data.cnn_analysis.vegetation_analysis.cnn_health_score)}`}>
                  {data.cnn_analysis.vegetation_analysis.cnn_health_score.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400">Vegetation Health</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">
                  {data.cnn_analysis.vegetation_analysis.cnn_predicted_ndvi.toFixed(3)}
                </div>
                <div className="text-xs text-slate-400">Predicted NDVI</div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">
                  {getStatusIcon(data.cnn_analysis.vegetation_analysis.vegetation_status)}
                </span>
                <span className="text-sm font-medium text-white capitalize">
                  {data.cnn_analysis.vegetation_analysis.vegetation_status} Vegetation
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Satellite Info */}
        <div className="bg-slate-800/20 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-200 mb-3">Image Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Source</span>
              <span className="text-white">ESRI World Imagery</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Coordinates</span>
              <span className="text-white">
                {data.location.latitude.toFixed(4)}, {data.location.longitude.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Resolution</span>
              <span className="text-white">~1m per pixel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Age</span>
              <span className="text-white">Recent imagery</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <button 
            onClick={() => window.open(`https://www.google.com/maps/@${data.location.latitude},${data.location.longitude},15z`, '_blank')}
            className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2 px-3 rounded-lg text-sm transition-colors"
          >
            View in Maps
          </button>
          <button 
            onClick={() => {
              setImageError(false);
              setImageLoading(true);
            }}
            className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 px-3 rounded-lg text-sm transition-colors"
          >
            Refresh Image
          </button>
        </div>
      </div>
    </div>
  );
};