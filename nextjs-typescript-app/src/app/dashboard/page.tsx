"use client";

import { useState } from 'react';
import { LocationSelector } from '@/components/dashboard/LocationSelector';
import { RealTimeMonitor } from '@/components/dashboard/RealTimeMonitor';
import { SystemStatusIcon } from '@/components/dashboard/SystemStatusIcon';
import { SatelliteImageView } from '@/components/dashboard/SatelliteImageView';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { BackendStatus } from '@/components/ui/BackendStatus';
import { ErrorBoundary } from '@/components/ui/common';
import { AnalysisSummary } from '@/components/dashboard/AnalysisSummary';
import { EnvironmentalDashboard } from '@/components/dashboard/EnvironmentalDashboard';
import { EarthVoiceConversation } from '@/components/dashboard/EarthVoiceConversation';
import { EarthVoice3D } from '@/components/dashboard/EarthVoice3D';
import { WeatherMetrics } from '@/components/dashboard/WeatherMetrics';
import type { AnalysisMode, AnalysisSnapshot } from '@/components/dashboard/types';

type SelectedLocation = {
  lat: number;
  lon: number;
  name?: string;
};

const parseFirstNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const candidate = value.includes('/') ? value.split('/')[0] : value;
    const match = candidate.match(/-?\d+(\.\d+)?/);
    return match ? Number.parseFloat(match[0]) : undefined;
  }
  return undefined;
};

const normaliseActions = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      typeof item === 'string'
        ? { action: item }
        : {
            action: (item && item.action) || 'Action',
            priority: item?.priority,
            source: item?.source,
          }
    )
    .filter((item) => item.action);
};

const buildRiskList = (blocks: Array<unknown>) => {
  const risks: { type: string; severity?: string }[] = [];
  blocks.forEach((block) => {
    if (!block) return;
    if (Array.isArray((block as any).all_detected_risks)) {
      (block as any).all_detected_risks.forEach((item: any) => {
        if (!item) return;
        risks.push({
          type: String(item.type ?? item),
          severity: item.severity ? String(item.severity) : undefined,
        });
      });
    }
    if (Array.isArray((block as any).detected_risks)) {
      (block as any).detected_risks.forEach((item: any) => {
        if (!item) return;
        risks.push({
          type: String(item.type ?? item),
          severity: item.severity ? String(item.severity) : undefined,
        });
      });
    }
    if (Array.isArray((block as any).top_risks)) {
      (block as any).top_risks.forEach((item: any) => {
        if (!item) return;
        if (typeof item === 'string') {
          risks.push({ type: item });
        } else {
          risks.push({
            type: String(item.type ?? item),
            severity: item.severity ? String(item.severity) : undefined,
          });
        }
      });
    }
  });

  const seen = new Set<string>();
  return risks.filter((risk) => {
    const key = `${risk.type}-${risk.severity ?? ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const makeLocationLabel = (location: SelectedLocation | null) => {
  if (!location) return '';
  if (location.name) return location.name;
  return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
};

const normaliseResponse = (
  raw: any,
  analysisType: AnalysisMode,
  location: SelectedLocation | null
): AnalysisSnapshot => {
  const base = {
    analysisType,
    lat: location?.lat ?? 0,
    lon: location?.lon ?? 0,
    locationLabel: makeLocationLabel(location),
    timestamp:
      raw?.['📍_location']?.analysis_timestamp ?? new Date().toISOString(),
  };

  if (analysisType === 'quick') {
    const quickScore = parseFirstNumber(raw?.['⚡_quick_score']);
    const temperature = raw?.['🌡️_temperature'];
    const aqi = raw?.['💨_air_quality'];
    const vegetation = raw?.['🌱_vegetation'];

    return {
      ...base,
      overallScore: quickScore,
      overallStatus: quickScore !== undefined ? undefined : raw?.status,
      vegetationHealth: parseFirstNumber(vegetation),
      riskList: [],
      topActions: [],
      earthVoice: raw?.['🌍_earth_voice'] || undefined,
      extraMetrics: [
        { label: 'Temperature', value: String(temperature ?? '—') },
        { label: 'Air quality', value: String(aqi ?? '—') },
        { label: 'Vegetation', value: String(vegetation ?? '—') },
      ],
    };
  }

  if (analysisType === 'satellite') {
    const cnnBlock = raw?.['🧠_cnn_analysis'] ?? {};
    const riskBlock = raw?.['⚠️_risks'] ?? {};
    const satelliteBlock = raw?.['🛰️_satellite_data'] ?? {};
    const actionsBlock = raw?.['🌳_conservation'] ?? [];
    const vegetationStatus =
      cnnBlock.vegetation_status ??
      (typeof cnnBlock.vegetation_health === 'string'
        ? cnnBlock.vegetation_health
        : undefined);
    const realSatellite = satelliteBlock.source
      ? satelliteBlock.source !== 'simulated'
      : Boolean(satelliteBlock.real_satellite_used);

    return {
      ...base,
      overallScore: parseFirstNumber(cnnBlock.environmental_score),
      vegetationHealth: parseFirstNumber(cnnBlock.vegetation_health),
      vegetationStatus,
      riskLevel: riskBlock.overall_risk_level,
      totalRisks: Number(riskBlock?.detected_risks?.length ?? 0),
      riskList: buildRiskList([riskBlock]),
      topActions: normaliseActions(actionsBlock),
      satelliteSource: satelliteBlock.source ?? satelliteBlock.status,
      realSatellite,
      earthVoice: raw?.['🌍_earth_vision'] || undefined,
      extraMetrics: [
        { label: 'Water presence', value: String(cnnBlock.water_presence ?? '—') },
        { label: 'Urban density', value: String(cnnBlock.urban_density ?? '—') },
      ],
    };
  }

  const scoreBlock = raw?.['📊_environmental_score'] ?? {};
  const vegetationBlock = raw?.['🌱_vegetation_health'] ?? {};
  const riskBlock = raw?.['⚠️_environmental_risks'] ?? {};
  const actionsBlock = raw?.['🌳_conservation_actions'] ?? {};
  const confidenceBlock = raw?.['📈_confidence_metrics'] ?? {};
  const satelliteBlock = raw?.['🛰️_satellite_analysis'] ?? {};

  return {
    ...base,
    overallScore: parseFirstNumber(scoreBlock.overall_score),
    overallStatus: scoreBlock.status,
    traditionalScore: parseFirstNumber(scoreBlock.traditional_ai),
    cnnScore: parseFirstNumber(scoreBlock.cnn_vision),
    vegetationHealth: parseFirstNumber(vegetationBlock.health_percentage),
    vegetationStatus: vegetationBlock.vegetation_status,
    vegetationConfidence: vegetationBlock.confidence,
    ndvi: parseFirstNumber(vegetationBlock.ndvi_index),
    riskLevel: riskBlock.risk_level,
    totalRisks: Number(riskBlock.total_risks ?? riskBlock.total_risks_detected ?? 0),
    riskList: buildRiskList([riskBlock]),
    topActions: normaliseActions(actionsBlock.top_actions),
    satelliteSource: satelliteBlock.satellite_source,
    realSatellite: Boolean(satelliteBlock.real_satellite_used),
    earthVoice: raw?.['🌍_earth_voice'] || undefined,
    fusionConfidence: confidenceBlock.overall_fusion_confidence,
    scoreAgreement: parseFirstNumber(confidenceBlock.score_agreement_percentage),
    extraMetrics: [],
  };
};

type ProgressStep = {
  text: string;
  icon: string;
  duration: number;
};

const ProgressIcon = ({ name, completed = false }: { name: string; completed?: boolean }) => {
  const baseClasses = `w-4 h-4 ${completed ? 'text-green-400' : 'text-blue-400'}`;
  
  switch (name) {
    case 'brain':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'satellite':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'eye':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg className={`${baseClasses} ${!completed ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'message':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'check':
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'zap':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'thermometer':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'wind':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h6m-7 4h1m4 0h2m-8-8h6m-6 4h1" />
        </svg>
      );
    case 'leaf':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case 'download':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'building':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'droplet':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 12A4.5 4.5 0 0112 7.5 4.5 4.5 0 0116.5 12 4.5 4.5 0 0112 16.5 4.5 4.5 0 017.5 12z" />
        </svg>
      );
    default:
      return (
        <div className={`w-4 h-4 rounded-full ${completed ? 'bg-green-400' : 'bg-blue-400 animate-pulse'}`} />
      );
  }
};

export default function Dashboard() {
  const [snapshot, setSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [rawResponse, setRawResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<ProgressStep[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisMode>('complete');
  
  // Add tab management for main dashboard
  const [activeTab, setActiveTab] = useState<'analysis' | 'environmental' | 'conversation'>('analysis');
  const [environmentalData, setEnvironmentalData] = useState<any>(null);
  const [environmentalLoading, setEnvironmentalLoading] = useState(false);
  const [conversationEarthVoice, setConversationEarthVoice] = useState<any>(null);

  const simulateProgressSteps = (analysisType: AnalysisMode) => {
    const steps = {
      complete: [
        { text: "Initializing AIVA Environmental AI Brain...", icon: "brain", duration: 1000 },
        { text: "Fetching real satellite imagery...", icon: "satellite", duration: 1200 },
        { text: "Running CNN vision models on satellite data...", icon: "eye", duration: 1500 },
        { text: "Gathering environmental API data...", icon: "cloud", duration: 900 },
        { text: "Fusing AI systems for comprehensive analysis...", icon: "refresh", duration: 1100 },
        { text: "Generating Earth voice response with Gemini...", icon: "message", duration: 800 },
        { text: "Analysis complete!", icon: "check", duration: 500 }
      ],
      quick: [
        { text: "Starting quick environmental scan...", icon: "zap", duration: 600 },
        { text: "Fetching weather data...", icon: "thermometer", duration: 800 },
        { text: "Checking air quality metrics...", icon: "wind", duration: 700 },
        { text: "Analyzing vegetation indices...", icon: "leaf", duration: 900 },
        { text: "Generating quick Earth response...", icon: "message", duration: 600 },
        { text: "Quick scan complete!", icon: "check", duration: 500 }
      ],
      satellite: [
        { text: "Initializing satellite vision system...", icon: "satellite", duration: 800 },
        { text: "Downloading real satellite imagery...", icon: "download", duration: 1200 },
        { text: "Running CNN environmental models...", icon: "brain", duration: 1400 },
        { text: "Analyzing vegetation patterns...", icon: "leaf", duration: 1000 },
        { text: "Detecting urban development...", icon: "building", duration: 900 },
        { text: "Identifying water bodies...", icon: "droplet", duration: 800 },
        { text: "Interpreting satellite vision with Gemini...", icon: "eye", duration: 700 },
        { text: "Satellite analysis complete!", icon: "check", duration: 500 }
      ]
    };

    const progressSteps = steps[analysisType];
    let currentStep = 0;

    const stepInterval = setInterval(() => {
      if (currentStep < progressSteps.length - 1) {
        const step = progressSteps[currentStep];
        setLoadingProgress(prev => [...prev, step]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, 900); // Base interval, each step can have its own duration

    return stepInterval;
  };

  const handleLocationSelect = async (lat: number, lon: number, name?: string) => {
    setSelectedLocation({ lat, lon, name });
    
    if (activeTab === 'environmental') {
      // For environmental tab, fetch environmental data
      await fetchEnvironmentalData(lat, lon, name);
      return;
    }
    
    // For analysis tab, continue with existing logic
    setLoading(true);
    setLoadingProgress([]);
    
    // Start progress simulation
    const progressInterval = simulateProgressSteps(analysisType);
    
    try {
      const endpoint =
        analysisType === 'complete'
          ? 'analyze'
          : analysisType === 'quick'
          ? 'quick-scan'
          : 'satellite-vision';
      
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon
        })
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data?.error) {
        throw new Error(data.error);
      }

      setRawResponse(data);
      setSnapshot(normaliseResponse(data, analysisType, { lat, lon, name }));
      
      // Clear progress and show completion
      clearInterval(progressInterval);
      setLoadingProgress(prev => [...prev, { text: "Analysis complete!", icon: "check", duration: 500 }]);
      
      // Short delay to show completion message
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress([]);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      
      // Clear progress on error
      clearInterval(progressInterval);
      setLoadingProgress([]);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to analyze location';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Backend server not running. Please start Flask server on http://localhost:5000';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
      setSnapshot(null);
      setRawResponse(null);
    } finally {
      setLoading(false);
      setLoadingProgress([]);
    }
  };

  // Fetch comprehensive environmental data from backend
  const fetchEnvironmentalData = async (lat: number, lon: number, name?: string) => {
    setEnvironmentalLoading(true);
    
    try {
      // Use the real backend comprehensive endpoint (NOTE: backend uses /api/ prefix)
      const response = await fetch('http://localhost:5000/api/environmental/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const backendData = await response.json();
      
      if (backendData?.error) {
        throw new Error(backendData.error);
      }

      // Map the backend response to the EnvironmentalDashboard expected structure
      // Since the component expects comprehensive data, we need to create an object with that structure
      const transformedData = {
        location: { 
          latitude: lat, 
          longitude: lon, 
          name: name || `${lat.toFixed(4)}, ${lon.toFixed(4)}` 
        },
        enhanced_environmental_score: {
          enhanced_score: backendData.environmental_score || 0,
          traditional_ai_score: backendData.traditional_score || 0,
          cnn_ai_score: backendData.cnn_score || 0,
          score_agreement: backendData.score_agreement || 'Unknown'
        },
        fused_vegetation_analysis: {
          fused_ndvi: backendData.vegetation?.ndvi || 0,
          fused_health_score: backendData.vegetation?.health_score || 0,
          consensus_status: backendData.vegetation?.status || 'Unknown',
          fusion_confidence: backendData.vegetation?.confidence || 'Low'
        },
        combined_risk_assessment: {
          combined_risk_level: backendData.risk_assessment?.level || 'Unknown',
          total_risks_detected: backendData.risk_assessment?.total_risks || 0,
          all_detected_risks: backendData.risk_assessment?.risks || []
        },
        traditional_ai_analysis: {
          air_quality: {
            aqi: backendData.pollution?.aqi || 0,
            quality_level: backendData.pollution?.status || 'Unknown',
            main_pollutant: backendData.pollution?.dominant_pollutant || 'N/A'
          },
          weather: {
            temperature: backendData.weather?.temperature || 0,
            humidity: backendData.weather?.humidity || 0,
            wind_speed: backendData.weather?.wind_speed || 0,
            description: backendData.weather?.description || 'Unknown'
          },
          vegetation: {
            vegetation_health: backendData.vegetation?.health_score || 0,
            ndvi_estimate: backendData.vegetation?.ndvi || 0
          }
        },
        fusion_confidence: {
          overall_fusion_confidence: backendData.overall_confidence || 'Low',
          score_agreement_percentage: backendData.agreement_percentage || 0
        },
        // Add the comprehensive data structure that the component expects
        pollution: backendData.pollution || {},
        water_quality: backendData.water_quality || {},
        soil_quality: backendData.soil_quality || {},
        noise_pollution: backendData.noise_pollution || {},
        industrial_emissions: backendData.industrial_emissions || {}
      };

      setEnvironmentalData(transformedData);
    } catch (error) {
      console.error('Environmental data fetch error:', error);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to fetch environmental data';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Backend server not running. Please start Flask server on http://localhost:5000';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
      setEnvironmentalData(null);
    } finally {
      setEnvironmentalLoading(false);
    }
  };

  const handleAnalysisTypeChange = (type: AnalysisMode) => {
    setAnalysisType(type);
    if (selectedLocation) {
      handleLocationSelect(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">AIVA Dashboard</p>
            <h1 className="text-2xl font-semibold">Environmental Intelligence</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-300">
            <SystemStatusIcon />
            <BackendStatus />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              🔍 AI Analysis
            </button>
            <button
              onClick={() => setActiveTab('environmental')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'environmental'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              🌍 Environmental Monitor
            </button>
            <button
              onClick={() => setActiveTab('conversation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'conversation'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              💬 Earth Conversation
            </button>
          </div>
        </div>
      </div>

      <main className="grid gap-6 px-6 py-8 lg:grid-cols-[320px_1fr_400px]">
        {activeTab === 'analysis' && (
          <>
            <section className="space-y-6">
          <ErrorBoundary>
            <LocationSelector onLocationSelect={handleLocationSelect} />
          </ErrorBoundary>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Analysis mode</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-100">How should AIVA inspect this site?</h2>
            <p className="mt-2 text-xs text-slate-400">Select the engine to balance speed, depth, and satellite coverage.</p>
            <div className="mt-4 grid gap-2">
              {(
                [
                  { key: 'complete', title: 'Complete', hint: 'Fusion of all systems' },
                  { key: 'quick', title: 'Quick', hint: 'Fast API-only snapshot' },
                  { key: 'satellite', title: 'Satellite', hint: 'CNN vision focus' },
                ] as const
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleAnalysisTypeChange(option.key)}
                  className={`rounded border px-3 py-2 text-left text-sm transition-colors ${
                    analysisType === option.key
                      ? 'border-green-500/50 bg-green-500/10 text-slate-50 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-medium">{option.title}</span>
                  <span className="text-xs text-slate-400">{option.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {loading ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
                <h3 className="text-lg font-medium text-slate-100">
                  {analysisType === 'complete' ? 'Complete Analysis' : 
                   analysisType === 'quick' ? 'Quick Scan' : 'Satellite Vision'} in Progress
                </h3>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round((loadingProgress.length / (
                    analysisType === 'complete' ? 7 : analysisType === 'quick' ? 6 : 8
                  )) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min((loadingProgress.length / (
                        analysisType === 'complete' ? 7 : analysisType === 'quick' ? 6 : 8
                      )) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                {loadingProgress.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 py-2 transition-all duration-300 ease-in-out">
                    <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                      step.icon === 'check' ? 'bg-green-400/20' : 'bg-blue-400/20'
                    } p-1`}>
                      <ProgressIcon name={step.icon} completed={step.icon === 'check'} />
                    </div>
                    <span className={`text-sm transition-all duration-300 ${
                      step.icon === 'check' ? 'text-green-300 font-medium' : 'text-slate-300'
                    }`}>
                      {step.text}
                    </span>
                    {step.icon !== 'check' && (
                      <div className="ml-auto">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-150" />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-300" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {loadingProgress.length === 0 && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex items-center justify-center bg-blue-400/20 p-1 rounded-full">
                      <div className="w-4 h-4 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                    <span className="text-sm text-slate-300">Connecting to AIVA backend...</span>
                    <div className="ml-auto">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-150" />
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-300" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Location: {selectedLocation?.name || `${selectedLocation?.lat.toFixed(4)}, ${selectedLocation?.lon.toFixed(4)}`}</span>
                  <span>Mode: {analysisType}</span>
                </div>
              </div>
            </div>
          ) : snapshot ? (
            <>
              <AnalysisSummary snapshot={snapshot} rawData={rawResponse} />
              
              {/* Weather Metrics */}
              <div className="mt-6">
                <ErrorBoundary>
                  <WeatherMetrics 
                    latitude={snapshot.lat}
                    longitude={snapshot.lon}
                  />
                </ErrorBoundary>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-10 text-center text-sm text-slate-300">
              Select a location to see real-time intelligence.
            </div>
          )}
        </section>

        {/* Right Sidebar - Satellite Image */}
        <section className="space-y-6">
          {selectedLocation ? (
            <SatelliteImageView 
              lat={selectedLocation.lat} 
              lon={selectedLocation.lon} 
              locationName={selectedLocation.name}
            />
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-10 text-center text-sm text-slate-300">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Select a location to view satellite imagery</p>
              </div>
            </div>
          )}
        </section>
          </>
        )}

        {activeTab === 'environmental' && (
          <div className="col-span-3">
            {environmentalLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-slate-400">Loading environmental data...</p>
                </div>
              </div>
            ) : environmentalData ? (
              <EnvironmentalDashboard 
                data={environmentalData}
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p>Select a location to view environmental data</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
            {/* Left Panel - Conversation Interface */}
            <div className="space-y-4">
              <ErrorBoundary>
                <EarthVoiceConversation 
                  snapshot={snapshot ?? undefined}
                  onEarthVoiceUpdate={setConversationEarthVoice}
                />
              </ErrorBoundary>
            </div>

            {/* Right Panel - Earth Voice 3D Visualization */}
            <div className="space-y-4">
              <ErrorBoundary>
                <EarthVoice3D 
                  snapshot={snapshot ?? undefined}
                  earthVoiceData={conversationEarthVoice}
                />
              </ErrorBoundary>
              
              {/* Conversation Status */}
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌍</span>
                  Earth Voice Status
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">3D Visualization</span>
                    <span className="text-green-400 text-sm">🟢 Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Voice Response</span>
                    <span className={`text-sm ${conversationEarthVoice?.tts_enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                      {conversationEarthVoice?.tts_enabled ? '🔊 TTS Enabled' : '📝 Text Only'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">AI Model</span>
                    <span className="text-blue-400 text-sm">🧠 Gemini 2.5-flash</span>
                  </div>
                  
                  {conversationEarthVoice && (
                    <div className="pt-2 border-t border-slate-700">
                      <div className="text-xs text-slate-400">
                        Last Response: {new Date(conversationEarthVoice.timestamp).toLocaleTimeString()}
                      </div>
                      {conversationEarthVoice.audio && (
                        <div className="text-xs text-green-400 mt-1">
                          Voice: {conversationEarthVoice.audio.emotion} • {conversationEarthVoice.audio.estimated_duration}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <QuickActionsPanel onQuickAnalysis={handleLocationSelect} />
    </div>
  );
}