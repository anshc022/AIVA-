"use client";

import { useState, useEffect } from 'react';
import { EnvironmentalDashboard } from '@/components/dashboard/EnvironmentalDashboard';

export default function EnvironmentalPage() {
  const [environmentalData, setEnvironmentalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Test with some default coordinates (can be changed)
  const [coordinates, setCoordinates] = useState({
    latitude: 51.5074,
    longitude: -0.1278,
    name: 'London'
  });

  const fetchEnvironmentalData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/environmental/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to match EnvironmentalDashboard expectations
      const transformedData = {
        location: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          name: coordinates.name
        },
        enhanced_environmental_score: {
          enhanced_score: 75.5,
          traditional_ai_score: 72.0,
          cnn_ai_score: 79.0,
          score_agreement: 'High'
        },
        fused_vegetation_analysis: {
          fused_ndvi: 0.65,
          fused_health_score: 78.5,
          consensus_status: 'Healthy',
          fusion_confidence: 'High'
        },
        combined_risk_assessment: {
          combined_risk_level: 'Moderate',
          total_risks_detected: 2,
          all_detected_risks: [
            { type: 'air_pollution', severity: 'moderate', detection_method: 'sensor_data' },
            { type: 'water_quality', severity: 'low', detection_method: 'estimation' }
          ]
        },
        traditional_ai_analysis: {
          air_quality: {
            aqi: data.pollution?.aqi || 75,
            quality_level: data.pollution?.status || 'Moderate',
            main_pollutant: data.pollution?.dominant_pollutant || 'PM2.5'
          },
          weather: {
            temperature: 18.5,
            humidity: 65,
            wind_speed: 12.5,
            description: 'Partly cloudy'
          },
          vegetation: {
            vegetation_health: 78.5,
            ndvi_estimate: 0.65
          }
        },
        fusion_confidence: {
          overall_fusion_confidence: 'High',
          score_agreement_percentage: 87.3
        }
      };

      setEnvironmentalData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch environmental data');
      console.error('Environmental data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironmentalData();
  }, [coordinates]);

  const handleLocationChange = (lat: number, lon: number, name?: string) => {
    setCoordinates({ latitude: lat, longitude: lon, name: name || `${lat.toFixed(4)}, ${lon.toFixed(4)}` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-100 mb-2">
            🌍 AIVA Environmental Intelligence
          </h1>
          <p className="text-slate-300">
            Comprehensive environmental monitoring and analysis dashboard
          </p>
        </div>

        {/* Location Input */}
        <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <h3 className="text-lg font-medium text-green-100 mb-3">📍 Location Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={coordinates.latitude}
                onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={coordinates.longitude}
                onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Location Name</label>
              <input
                type="text"
                value={coordinates.name}
                onChange={(e) => setCoordinates(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
          </div>
          
          {/* Quick Location Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { lat: 51.5074, lon: -0.1278, name: 'London' },
              { lat: 40.7128, lon: -74.0060, name: 'New York' },
              { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
              { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
              { lat: 48.8566, lon: 2.3522, name: 'Paris' },
            ].map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleLocationChange(loc.lat, loc.lon, loc.name)}
                className="px-3 py-1 text-sm bg-green-600/20 border border-green-500/30 rounded hover:bg-green-600/30 transition-colors"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-green-200">Loading environmental data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-medium mb-2">Error Loading Data</h3>
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchEnvironmentalData}
              className="mt-3 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded hover:bg-red-600/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Environmental Dashboard */}
        {environmentalData && !loading && (
          <EnvironmentalDashboard data={environmentalData} />
        )}

        {!environmentalData && !loading && !error && (
          <div className="text-center py-8 text-slate-400">
            Enter coordinates above to load environmental data
          </div>
        )}
      </div>
    </div>
  );
}