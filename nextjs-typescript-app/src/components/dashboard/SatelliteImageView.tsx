"use client";

import { useState, useEffect } from 'react';

interface SatelliteImageViewProps {
  lat: number;
  lon: number;
  locationName?: string;
}

interface SatelliteImageData {
  success: boolean;
  source: string;
  image_base64?: string;
  image_url?: string;
  resolution: string;
  date: string;
  bands: string[];
  cloud_coverage?: string;
  width: number;
  height: number;
  format: string;
  error?: string;
  note?: string;
  heatmap_data?: HeatmapData;
}

interface HeatmapData {
  available_layers: string[];
  default_layer: string;
  layers: Record<string, HeatmapLayer>;
  legend: Record<string, LegendInfo>;
  generated_from: string;
}

interface HeatmapLayer {
  data: number[][];
  color_scale: string;
  unit: string;
  description: string;
}

interface LegendInfo {
  colors: string[];
  labels: string[];
  values: number[];
}

export const SatelliteImageView = ({ lat, lon, locationName }: SatelliteImageViewProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [satelliteData, setSatelliteData] = useState<SatelliteImageData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<string>('vegetation_health');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);

  const fetchSatelliteImage = async (latitude: number, longitude: number) => {
    setImageLoading(true);
    setImageError(false);
    setErrorMessage('');

    try {
      console.log(`🛰️ Fetching satellite image from AIVA backend for ${latitude}, ${longitude}`);
      
      const response = await fetch('http://localhost:5000/satellite-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: latitude,
          longitude: longitude
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['❌_error']) {
        throw new Error(data['❌_error']);
      }

      // Extract satellite image data from AIVA response
      const imageData = data['🛰️_image_data'];
      const metadata = data['📊_image_metadata'];
      
      if (imageData) {
        const newSatelliteData = {
          success: true,
          source: imageData.source || 'AIVA Backend',
          image_base64: imageData.image_base64,
          image_url: imageData.image_url,
          resolution: imageData.resolution || '250m',
          date: imageData.acquisition_date || 'recent',
          bands: imageData.bands_used || ['Red', 'Green', 'Blue'],
          cloud_coverage: imageData.cloud_coverage,
          width: metadata?.width || 512,
          height: metadata?.height || 512,
          format: metadata?.format || 'RGB',
          heatmap_data: imageData.heatmap_data
        };
        
        setSatelliteData(newSatelliteData);
        
        // Set default layer if heatmap data is available
        if (newSatelliteData.heatmap_data?.default_layer) {
          setSelectedLayer(newSatelliteData.heatmap_data.default_layer);
        }
      } else {
        throw new Error('No satellite image data received from backend');
      }

    } catch (error) {
      console.error('Failed to fetch satellite image:', error);
      setImageError(true);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setErrorMessage('AIVA backend not running. Please start Flask server.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Unknown error occurred');
      }
      
      setSatelliteData(null);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchSatelliteImage(lat, lon);
  }, [lat, lon]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setErrorMessage('Failed to load satellite image');
  };

  const getImageSrc = () => {
    if (satelliteData?.image_base64) {
      return satelliteData.image_base64;
    } else if (satelliteData?.image_url) {
      return satelliteData.image_url;
    }
    return '';
  };

  const renderHeatmapOverlay = () => {
    if (!showHeatmap || !satelliteData?.heatmap_data || !selectedLayer) {
      return null;
    }

    const layerData = satelliteData.heatmap_data.layers[selectedLayer];
    if (!layerData) return null;

    const gridSize = layerData.data.length;
    const cellSize = 100 / gridSize; // Percentage for CSS grid

    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: heatmapOpacity }}
      >
        <div 
          className="w-full h-full grid"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
          }}
        >
          {layerData.data.flat().map((value, index) => (
            <div
              key={index}
              className="w-full h-full"
              style={{
                backgroundColor: getHeatmapColor(value, layerData.color_scale),
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const getHeatmapColor = (value: number, colorScale: string) => {
    // Convert value (0-1) to color based on scale
    const alpha = Math.min(Math.max(value, 0), 1);
    
    switch (colorScale) {
      case 'green_scale':
        // Red (poor) to Yellow to Green (excellent)
        if (value < 0.5) {
          const r = 255;
          const g = Math.round(255 * (value * 2));
          return `rgba(${r}, ${g}, 0, ${alpha * 0.7})`;
        } else {
          const r = Math.round(255 * (2 - value * 2));
          const g = 255;
          return `rgba(${r}, ${g}, 0, ${alpha * 0.7})`;
        }
      case 'blue_scale':
        // White to Blue
        const blue = Math.round(255 * value);
        return `rgba(0, ${blue}, 255, ${alpha * 0.6})`;
      case 'red_scale':
        // Green to Red (risk)
        const red = Math.round(255 * value);
        const green = Math.round(255 * (1 - value));
        return `rgba(${red}, ${green}, 0, ${alpha * 0.7})`;
      case 'gray_scale':
        // White to Black
        const gray = Math.round(255 * (1 - value));
        return `rgba(${gray}, ${gray}, ${gray}, ${alpha * 0.5})`;
      case 'yellow_scale':
        // Green to Yellow to Red
        if (value < 0.5) {
          return `rgba(0, 255, 0, ${alpha * 0.6})`;
        } else if (value < 0.8) {
          return `rgba(255, 255, 0, ${alpha * 0.6})`;
        } else {
          return `rgba(255, 0, 0, ${alpha * 0.7})`;
        }
      default:
        return `rgba(255, 255, 255, ${alpha * 0.3})`;
    }
  };

  const getLayerDisplayName = (layerKey: string) => {
    return layerKey.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-slate-100">AI Satellite Analysis</h3>
          <p className="text-xs text-slate-400">
            {locationName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}
          </p>
          {satelliteData && (
            <p className="text-xs text-slate-500 mt-1">
              Source: {satelliteData.source} • {satelliteData.resolution}
            </p>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Heatmap Toggle */}
          {satelliteData?.heatmap_data && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1 text-xs rounded border ${
                showHeatmap 
                  ? 'bg-green-600 border-green-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              🔥 Heatmap
            </button>
          )}
          
          {/* Refresh Button */}
          <button
            onClick={() => fetchSatelliteImage(lat, lon)}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded border border-blue-500"
            disabled={imageLoading}
          >
            {imageLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Heatmap Layer Selector */}
      {showHeatmap && satelliteData?.heatmap_data && (
        <div className="mb-3 p-3 bg-slate-800/50 rounded border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Heatmap Layer</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            {satelliteData.heatmap_data.available_layers.map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={`px-2 py-1 text-xs rounded text-left ${
                  selectedLayer === layer
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {getLayerDisplayName(layer)}
              </button>
            ))}
          </div>
          
          {selectedLayer && satelliteData.heatmap_data.layers[selectedLayer] && (
            <p className="text-xs text-slate-400 mt-2">
              {satelliteData.heatmap_data.layers[selectedLayer].description}
            </p>
          )}
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
              <span className="text-sm text-slate-400">Fetching AI satellite imagery...</span>
            </div>
          </div>
        )}

        {imageError ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-800">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-center">
              {errorMessage || 'Satellite imagery unavailable'}
            </p>
            <button
              onClick={() => fetchSatelliteImage(lat, lon)}
              className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Retry
            </button>
          </div>
        ) : satelliteData && getImageSrc() ? (
          <div className="relative">
            <img
              src={getImageSrc()}
              alt={`AI Satellite view of ${locationName || 'selected location'}`}
              className="w-full h-64 object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {/* Heatmap Overlay */}
            {renderHeatmapOverlay()}
            
            {/* AI Analysis Overlay */}
            <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-1">
              <span className="text-xs text-green-400 font-medium">
                🧠 AI Analysis {showHeatmap ? '+ Heatmap' : 'Ready'}
              </span>
            </div>
            
            {/* Heatmap Legend */}
            {showHeatmap && selectedLayer && satelliteData.heatmap_data?.legend && (
              <div className="absolute top-2 right-2 bg-black/80 rounded p-2 text-xs">
                <div className="text-white font-medium mb-1">
                  {getLayerDisplayName(selectedLayer)}
                </div>
                <div className="space-y-1">
                  {satelliteData.heatmap_data.legend[satelliteData.heatmap_data.layers[selectedLayer].color_scale]?.labels.map((label, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ 
                          backgroundColor: satelliteData.heatmap_data?.legend[satelliteData.heatmap_data.layers[selectedLayer].color_scale]?.colors[index] 
                        }}
                      />
                      <span className="text-white text-xs">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Crosshair marker */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4">
                <svg className="w-full h-full text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Satellite Data Info */}
      {satelliteData && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div>
              <span className="font-medium">Coordinates:</span>
              <br />
              {lat.toFixed(6)}, {lon.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Resolution:</span>
              <br />
              {satelliteData.resolution}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div>
              <span className="font-medium">Bands:</span>
              <br />
              {satelliteData.bands.join(', ')}
            </div>
            <div>
              <span className="font-medium">Date:</span>
              <br />
              {satelliteData.date ? new Date(satelliteData.date).toLocaleDateString() : 'Recent'}
            </div>
          </div>

          {satelliteData.cloud_coverage && (
            <div className="text-xs text-slate-400">
              <span className="font-medium">Cloud Coverage:</span> {satelliteData.cloud_coverage}
            </div>
          )}

          {satelliteData.note && (
            <div className="text-xs text-yellow-400">
              ⚠️ {satelliteData.note}
            </div>
          )}
        </div>
      )}

      {/* AI Processing Status */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            🛰️ Same image used for AI analysis
          </span>
          <span className="text-green-400 font-medium">
            ✅ CNN Ready
          </span>
        </div>
      </div>
    </div>
  );
};