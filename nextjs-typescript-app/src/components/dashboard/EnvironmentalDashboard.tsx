"use client";

import { useState, useEffect } from 'react';

interface PollutionData {
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  so2: number;
  aqi: number;
  status: string;
  dominant_pollutant: string;
  health_recommendations: string[];
}

interface WaterQualityData {
  overall_score: number;
  status: string;
  ph: { value: number; status: string; };
  dissolved_oxygen: { value: number; status: string; };
  turbidity: { value: number; status: string; };
  nitrates: { value: number; status: string; };
  phosphates: { value: number; status: string; };
  bacterial_risk: string;
  safety_assessment: string;
}

interface SoilQualityData {
  health_score: number;
  ph: { value: number; status: string; };
  organic_matter: { percentage: number; status: string; };
  fertility: string;
  contamination_risk: { level: number; status: string; };
  erosion_risk: string;
  recommendations: string[];
}

interface NoiseData {
  current_level: number;
  category: string;
  time_period: string;
  health_impact: string;
  sources: string[];
}

interface IndustrialData {
  risk_factor: number;
  risk_level: string;
  facilities_nearby: number;
  emissions: {
    vocs: number;
    particulates: number;
    benzene: number;
    toluene: number;
    methane: number;
  };
  health_risk: string;
}

interface ComprehensiveEnvironmentalData {
  pollution: PollutionData;
  water_quality: WaterQualityData;
  soil_quality: SoilQualityData;
  noise_pollution: NoiseData;
  industrial_emissions: IndustrialData;
}

interface EnvironmentalDashboardProps {
  data: {
    location: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    enhanced_environmental_score: {
      enhanced_score: number;
      traditional_ai_score: number;
      cnn_ai_score: number;
      score_agreement: string;
    };
    fused_vegetation_analysis: {
      fused_ndvi: number;
      fused_health_score: number;
      consensus_status: string;
      fusion_confidence: string;
    };
    combined_risk_assessment: {
      combined_risk_level: string;
      total_risks_detected: number;
      all_detected_risks: Array<{
        type: string;
        severity: string;
        detection_method: string;
      }>;
    };
    traditional_ai_analysis: {
      air_quality: {
        aqi: number;
        quality_level: string;
        main_pollutant: string;
      };
      weather: {
        temperature: number;
        humidity: number;
        wind_speed: number;
        description: string;
      };
      vegetation: {
        vegetation_health: number;
        ndvi_estimate: number;
      };
    };
    fusion_confidence: {
      overall_fusion_confidence: string;
      score_agreement_percentage: number;
    };
  };
}

export const EnvironmentalDashboard: React.FC<EnvironmentalDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'risks' | 'pollution' | 'water' | 'soil' | 'noise' | 'industrial'>('overview');
  const [loading, setLoading] = useState(false);

  // Use comprehensive data from props instead of separate API calls
  // The parent component handles all real backend API calls
  const comprehensiveData = data as any; // Cast to match expected structure

  useEffect(() => {
    // No need to fetch - data comes from parent's real backend API call
    if (data && ['pollution', 'water', 'soil', 'noise', 'industrial'].includes(activeTab)) {
    }
  }, [activeTab]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'from-green-600/20 to-green-800/20 border-green-500/30';
    if (score >= 60) return 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30';
    if (score >= 40) return 'from-orange-600/20 to-orange-800/20 border-orange-500/30';
    return 'from-red-600/20 to-red-800/20 border-red-500/30';
  };

  const getRiskColor = (level: string) => {
    const colors = {
      low: 'text-green-400',
      moderate: 'text-yellow-400',
      high: 'text-red-400'
    };
    return colors[level.toLowerCase() as keyof typeof colors] || 'text-gray-400';
  };

  const getConfidenceColor = (confidence: string) => {
    const colors = {
      high: 'text-green-400',
      medium: 'text-yellow-400',
      low: 'text-red-400'
    };
    return colors[confidence.toLowerCase() as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-green-500/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-6 border-b border-green-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-green-100">Environmental Analysis</h2>
            <p className="text-green-200/70 text-sm">
              {data.location.name || `${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(data.enhanced_environmental_score.enhanced_score)}`}>
              {data.enhanced_environmental_score.enhanced_score.toFixed(1)}
            </div>
            <div className="text-sm text-green-200/70">Environmental Score</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-500/20 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: '🌍' },
          { key: 'details', label: 'Details', icon: '📊' },
          { key: 'risks', label: 'Risk Assessment', icon: '⚠️' },
          { key: 'pollution', label: 'Air Quality', icon: '🏭' },
          { key: 'water', label: 'Water Quality', icon: '💧' },
          { key: 'soil', label: 'Soil Health', icon: '🌱' },
          { key: 'noise', label: 'Noise Levels', icon: '🔊' },
          { key: 'industrial', label: 'Industrial', icon: '🏭' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-green-100 bg-green-600/20 border-b-2 border-green-400'
                : 'text-green-200/70 hover:text-green-100'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg bg-gradient-to-br border ${getScoreBackground(data.enhanced_environmental_score.enhanced_score)}`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(data.enhanced_environmental_score.enhanced_score)}`}>
                    {data.enhanced_environmental_score.enhanced_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-slate-300">Enhanced Score</div>
                  <div className="text-xs text-slate-400 mt-1">AI Fusion Result</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg bg-gradient-to-br border ${getScoreBackground(data.enhanced_environmental_score.traditional_ai_score)}`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(data.enhanced_environmental_score.traditional_ai_score)}`}>
                    {data.enhanced_environmental_score.traditional_ai_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-slate-300">Traditional AI</div>
                  <div className="text-xs text-slate-400 mt-1">Data Analysis</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg bg-gradient-to-br border ${getScoreBackground(data.enhanced_environmental_score.cnn_ai_score)}`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(data.enhanced_environmental_score.cnn_ai_score)}`}>
                    {data.enhanced_environmental_score.cnn_ai_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-slate-300">CNN Vision</div>
                  <div className="text-xs text-slate-400 mt-1">Satellite Analysis</div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/30 p-4 rounded-lg">
                <div className="text-lg font-semibold text-green-400">
                  {(data.fused_vegetation_analysis.fused_ndvi * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-slate-300">Vegetation Index</div>
              </div>

              <div className="bg-slate-800/30 p-4 rounded-lg">
                <div className="text-lg font-semibold text-blue-400">
                  {data.traditional_ai_analysis.air_quality.aqi}
                </div>
                <div className="text-sm text-slate-300">Air Quality Index</div>
              </div>

              <div className="bg-slate-800/30 p-4 rounded-lg">
                <div className="text-lg font-semibold text-purple-400">
                  {data.traditional_ai_analysis.weather.temperature.toFixed(1)}°C
                </div>
                <div className="text-sm text-slate-300">Temperature</div>
              </div>

              <div className="bg-slate-800/30 p-4 rounded-lg">
                <div className={`text-lg font-semibold ${getRiskColor(data.combined_risk_assessment.combined_risk_level)}`}>
                  {data.combined_risk_assessment.combined_risk_level.toUpperCase()}
                </div>
                <div className="text-sm text-slate-300">Risk Level</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Vegetation Analysis */}
            <div className="bg-slate-800/20 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-green-100 mb-3">Vegetation Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-300">Health Score</div>
                  <div className={`text-xl font-bold ${getScoreColor(data.fused_vegetation_analysis.fused_health_score)}`}>
                    {data.fused_vegetation_analysis.fused_health_score.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-300">Status</div>
                  <div className="text-lg font-medium text-green-400 capitalize">
                    {data.fused_vegetation_analysis.consensus_status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-300">NDVI</div>
                  <div className="text-lg font-bold text-green-400">
                    {data.fused_vegetation_analysis.fused_ndvi.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-300">Confidence</div>
                  <div className={`text-lg font-medium ${getConfidenceColor(data.fused_vegetation_analysis.fusion_confidence)}`}>
                    {data.fused_vegetation_analysis.fusion_confidence}
                  </div>
                </div>
              </div>
            </div>

            {/* Weather & Air Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/20 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-green-100 mb-3">Weather Conditions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Temperature</span>
                    <span className="text-white">{data.traditional_ai_analysis.weather.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Humidity</span>
                    <span className="text-white">{data.traditional_ai_analysis.weather.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Wind Speed</span>
                    <span className="text-white">{data.traditional_ai_analysis.weather.wind_speed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Conditions</span>
                    <span className="text-white capitalize">{data.traditional_ai_analysis.weather.description}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/20 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-green-100 mb-3">Air Quality</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">AQI</span>
                    <span className="text-white">{data.traditional_ai_analysis.air_quality.aqi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Quality Level</span>
                    <span className="text-white">{data.traditional_ai_analysis.air_quality.quality_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Main Pollutant</span>
                    <span className="text-white">{data.traditional_ai_analysis.air_quality.main_pollutant}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fusion Confidence */}
            <div className="bg-slate-800/20 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-green-100 mb-3">AI System Confidence</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-300">Overall Confidence</div>
                  <div className={`text-lg font-medium ${getConfidenceColor(data.fusion_confidence.overall_fusion_confidence)}`}>
                    {data.fusion_confidence.overall_fusion_confidence.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-300">Score Agreement</div>
                  <div className="text-lg font-bold text-green-400">
                    {data.fusion_confidence.score_agreement_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-green-100">Risk Assessment</h4>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.combined_risk_assessment.combined_risk_level)} bg-slate-800/30`}>
                {data.combined_risk_assessment.combined_risk_level.toUpperCase()} RISK
              </div>
            </div>

            {data.combined_risk_assessment.all_detected_risks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-100 mb-2">No Significant Risks Detected</h3>
                <p className="text-green-200/70">Environmental conditions appear stable</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.combined_risk_assessment.all_detected_risks.map((risk, index) => (
                  <div key={index} className="bg-slate-800/30 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white capitalize">
                        {risk.type.replace(/_/g, ' ')}
                      </h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.severity === 'high' ? 'bg-red-600/20 text-red-400' :
                        risk.severity === 'moderate' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-green-600/20 text-green-400'
                      }`}>
                        {risk.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300">
                      Detected by: <span className="font-medium">{risk.detection_method.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pollution' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-green-200/70 mt-4">Loading pollution data...</p>
              </div>
            ) : comprehensiveData?.pollution ? (
              <>
                {/* Pollution Overview */}
                <div className={`p-6 rounded-lg bg-gradient-to-br border ${getScoreBackground(100 - comprehensiveData.pollution.aqi)}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(100 - comprehensiveData.pollution.aqi)}`}>
                      {comprehensiveData.pollution.aqi}
                    </div>
                    <div className="text-lg text-white mb-1">Air Quality Index</div>
                    <div className="text-sm text-slate-300 capitalize">{comprehensiveData.pollution.status}</div>
                    <div className="text-xs text-slate-400 mt-2">
                      Dominant: {comprehensiveData.pollution.dominant_pollutant}
                    </div>
                  </div>
                </div>

                {/* Pollutant Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'PM2.5', value: comprehensiveData.pollution.pm25, unit: 'µg/m³', safe: 15 },
                    { name: 'PM10', value: comprehensiveData.pollution.pm10, unit: 'µg/m³', safe: 50 },
                    { name: 'NO₂', value: comprehensiveData.pollution.no2, unit: 'µg/m³', safe: 40 },
                    { name: 'O₃', value: comprehensiveData.pollution.o3, unit: 'µg/m³', safe: 120 },
                    { name: 'CO', value: comprehensiveData.pollution.co, unit: 'mg/m³', safe: 10 },
                    { name: 'SO₂', value: comprehensiveData.pollution.so2, unit: 'µg/m³', safe: 20 }
                  ].map((pollutant) => (
                    <div key={pollutant.name} className="bg-slate-800/30 p-4 rounded-lg">
                      <div className="text-sm text-slate-300 mb-1">{pollutant.name}</div>
                      <div className={`text-xl font-bold ${pollutant.value > pollutant.safe ? 'text-red-400' : 'text-green-400'}`}>
                        {pollutant.value.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">{pollutant.unit}</div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${pollutant.value > pollutant.safe ? 'bg-red-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min((pollutant.value / pollutant.safe) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Health Recommendations */}
                <div className="bg-slate-800/20 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-green-100 mb-3">Health Recommendations</h4>
                  <div className="space-y-2">
                    {comprehensiveData.pollution.health_recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-slate-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No pollution data available for this location
              </div>
            )}
          </div>
        )}

        {activeTab === 'water' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200/70 mt-4">Loading water quality data...</p>
              </div>
            ) : comprehensiveData?.water_quality ? (
              <>
                {/* Water Quality Overview */}
                <div className={`p-6 rounded-lg bg-gradient-to-br border ${getScoreBackground(comprehensiveData.water_quality.overall_score)}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(comprehensiveData.water_quality.overall_score)}`}>
                      {comprehensiveData.water_quality.overall_score.toFixed(1)}
                    </div>
                    <div className="text-lg text-white mb-1">Water Quality Score</div>
                    <div className="text-sm text-slate-300 capitalize">{comprehensiveData.water_quality.status}</div>
                    <div className="text-xs text-slate-400 mt-2">
                      Safety: {comprehensiveData.water_quality.safety_assessment}
                    </div>
                  </div>
                </div>

                {/* Water Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'pH Level', data: comprehensiveData.water_quality.ph, unit: '', optimal: [6.5, 8.5] },
                    { name: 'Dissolved Oxygen', data: comprehensiveData.water_quality.dissolved_oxygen, unit: 'mg/L', optimal: [6, 14] },
                    { name: 'Turbidity', data: comprehensiveData.water_quality.turbidity, unit: 'NTU', optimal: [0, 4] },
                    { name: 'Nitrates', data: comprehensiveData.water_quality.nitrates, unit: 'mg/L', optimal: [0, 3] },
                    { name: 'Phosphates', data: comprehensiveData.water_quality.phosphates, unit: 'mg/L', optimal: [0, 0.3] }
                  ].map((param) => (
                    <div key={param.name} className="bg-slate-800/30 p-4 rounded-lg">
                      <div className="text-sm text-slate-300 mb-1">{param.name}</div>
                      <div className={`text-xl font-bold ${param.data.status === 'Good' ? 'text-green-400' : param.data.status === 'Fair' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {param.data.value.toFixed(1)}{param.unit}
                      </div>
                      <div className={`text-sm font-medium ${param.data.status === 'Good' ? 'text-green-400' : param.data.status === 'Fair' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {param.data.status}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk Assessment */}
                <div className="bg-slate-800/20 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-blue-100 mb-3">Risk Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-300">Bacterial Risk</div>
                      <div className={`text-lg font-medium ${comprehensiveData.water_quality.bacterial_risk === 'Low' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {comprehensiveData.water_quality.bacterial_risk}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-300">Safety Assessment</div>
                      <div className="text-lg font-medium text-blue-400">
                        {comprehensiveData.water_quality.safety_assessment}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No water quality data available for this location
              </div>
            )}
          </div>
        )}

        {activeTab === 'soil' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
                <p className="text-amber-200/70 mt-4">Loading soil quality data...</p>
              </div>
            ) : comprehensiveData?.soil_quality ? (
              <>
                {/* Soil Health Overview */}
                <div className={`p-6 rounded-lg bg-gradient-to-br border ${getScoreBackground(comprehensiveData.soil_quality.health_score)}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(comprehensiveData.soil_quality.health_score)}`}>
                      {comprehensiveData.soil_quality.health_score.toFixed(1)}
                    </div>
                    <div className="text-lg text-white mb-1">Soil Health Score</div>
                    <div className="text-sm text-slate-300">Fertility: {comprehensiveData.soil_quality.fertility}</div>
                  </div>
                </div>

                {/* Soil Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <div className="text-sm text-slate-300 mb-1">pH Level</div>
                    <div className={`text-xl font-bold ${comprehensiveData.soil_quality.ph.status === 'Optimal' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {comprehensiveData.soil_quality.ph.value.toFixed(1)}
                    </div>
                    <div className="text-sm text-amber-400">{comprehensiveData.soil_quality.ph.status}</div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <div className="text-sm text-slate-300 mb-1">Organic Matter</div>
                    <div className={`text-xl font-bold ${comprehensiveData.soil_quality.organic_matter.status === 'Good' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {comprehensiveData.soil_quality.organic_matter.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-amber-400">{comprehensiveData.soil_quality.organic_matter.status}</div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <div className="text-sm text-slate-300 mb-1">Contamination Risk</div>
                    <div className={`text-xl font-bold ${comprehensiveData.soil_quality.contamination_risk.status.includes('Low') ? 'text-green-400' : 'text-yellow-400'}`}>
                      {comprehensiveData.soil_quality.contamination_risk.level.toFixed(0)}%
                    </div>
                    <div className="text-sm text-amber-400">{comprehensiveData.soil_quality.contamination_risk.status}</div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <div className="text-sm text-slate-300 mb-1">Erosion Risk</div>
                    <div className={`text-lg font-bold ${comprehensiveData.soil_quality.erosion_risk === 'Low' ? 'text-green-400' : comprehensiveData.soil_quality.erosion_risk === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {comprehensiveData.soil_quality.erosion_risk}
                    </div>
                  </div>
                </div>

                {/* Soil Recommendations */}
                <div className="bg-slate-800/20 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-amber-100 mb-3">Soil Management Recommendations</h4>
                  <div className="space-y-2">
                    {comprehensiveData.soil_quality.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-slate-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No soil quality data available for this location
              </div>
            )}
          </div>
        )}

        {activeTab === 'noise' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-purple-200/70 mt-4">Loading noise pollution data...</p>
              </div>
            ) : comprehensiveData?.noise_pollution ? (
              <>
                {/* Noise Level Overview */}
                <div className={`p-6 rounded-lg bg-gradient-to-br border ${getScoreBackground(100 - comprehensiveData.noise_pollution.current_level)}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(100 - comprehensiveData.noise_pollution.current_level)}`}>
                      {comprehensiveData.noise_pollution.current_level.toFixed(0)} dB
                    </div>
                    <div className="text-lg text-white mb-1">Current Noise Level</div>
                    <div className="text-sm text-slate-300">{comprehensiveData.noise_pollution.category}</div>
                    <div className="text-xs text-slate-400 mt-2">
                      Time: {comprehensiveData.noise_pollution.time_period}
                    </div>
                  </div>
                </div>

                {/* Noise Impact Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-purple-100 mb-3">Health Impact</h4>
                    <div className={`text-xl font-bold mb-2 ${comprehensiveData.noise_pollution.health_impact === 'No impact' ? 'text-green-400' : comprehensiveData.noise_pollution.health_impact.includes('Minor') ? 'text-yellow-400' : 'text-red-400'}`}>
                      {comprehensiveData.noise_pollution.health_impact}
                    </div>
                    <div className="text-sm text-slate-300">
                      Based on current exposure levels
                    </div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-purple-100 mb-3">Noise Sources</h4>
                    <div className="space-y-2">
                      {comprehensiveData.noise_pollution.sources.map((source, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-slate-300 capitalize">{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Noise Guidelines */}
                <div className="bg-slate-800/20 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-purple-100 mb-3">WHO Guidelines Comparison</h4>
                  <div className="space-y-3">
                    {[
                      { type: 'Residential (Day)', limit: 55, color: 'green' },
                      { type: 'Residential (Night)', limit: 40, color: 'blue' },
                      { type: 'School/Hospital', limit: 35, color: 'yellow' },
                      { type: 'Industrial', limit: 70, color: 'red' }
                    ].map((guideline) => (
                      <div key={guideline.type} className="flex items-center justify-between">
                        <span className="text-slate-300">{guideline.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white">{guideline.limit} dB</span>
                          <div className={`w-3 h-3 rounded-full ${comprehensiveData.noise_pollution.current_level > guideline.limit ? 'bg-red-400' : 'bg-green-400'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No noise pollution data available for this location
              </div>
            )}
          </div>
        )}

        {activeTab === 'industrial' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
                <p className="text-orange-200/70 mt-4">Loading industrial emissions data...</p>
              </div>
            ) : comprehensiveData?.industrial_emissions ? (
              <>
                {/* Industrial Risk Overview */}
                <div className={`p-6 rounded-lg bg-gradient-to-br border ${getScoreBackground(100 - (comprehensiveData.industrial_emissions.risk_factor * 50))}`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${comprehensiveData.industrial_emissions.risk_level === 'Low' ? 'text-green-400' : comprehensiveData.industrial_emissions.risk_level === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {comprehensiveData.industrial_emissions.risk_level.toUpperCase()}
                    </div>
                    <div className="text-lg text-white mb-1">Industrial Risk Level</div>
                    <div className="text-sm text-slate-300">
                      {comprehensiveData.industrial_emissions.facilities_nearby} facilities nearby
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Risk Factor: {comprehensiveData.industrial_emissions.risk_factor.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Emissions Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'VOCs', value: comprehensiveData.industrial_emissions.emissions.vocs, unit: 'ppb', dangerous: 50 },
                    { name: 'Particulates', value: comprehensiveData.industrial_emissions.emissions.particulates, unit: 'µg/m³', dangerous: 25 },
                    { name: 'Benzene', value: comprehensiveData.industrial_emissions.emissions.benzene, unit: 'ppb', dangerous: 1.3 },
                    { name: 'Toluene', value: comprehensiveData.industrial_emissions.emissions.toluene, unit: 'ppb', dangerous: 260 },
                    { name: 'Methane', value: comprehensiveData.industrial_emissions.emissions.methane, unit: 'ppm', dangerous: 5 }
                  ].map((emission) => (
                    <div key={emission.name} className="bg-slate-800/30 p-4 rounded-lg">
                      <div className="text-sm text-slate-300 mb-1">{emission.name}</div>
                      <div className={`text-xl font-bold ${emission.value > emission.dangerous ? 'text-red-400' : 'text-green-400'}`}>
                        {emission.value.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">{emission.unit}</div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${emission.value > emission.dangerous ? 'bg-red-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min((emission.value / emission.dangerous) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Health Risk Assessment */}
                <div className="bg-slate-800/20 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-orange-100 mb-3">Health Risk Assessment</h4>
                  <div className={`text-xl font-bold mb-2 ${comprehensiveData.industrial_emissions.health_risk === 'Low risk' ? 'text-green-400' : comprehensiveData.industrial_emissions.health_risk === 'Moderate risk' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {comprehensiveData.industrial_emissions.health_risk}
                  </div>
                  <p className="text-slate-300">
                    Based on proximity to industrial facilities and estimated emission levels. 
                    Consider air filtration systems if risk levels are moderate to high.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No industrial emissions data available for this location
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};