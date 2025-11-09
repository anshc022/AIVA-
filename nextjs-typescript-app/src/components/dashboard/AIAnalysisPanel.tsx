"use client";

import { useState, useEffect } from 'react';

interface AIAnalysisPanelProps {
  data: {
    cnn_analysis: {
      environmental_score: number;
      vegetation_analysis: {
        cnn_health_score: number;
        cnn_predicted_ndvi: number;
        vegetation_status: string;
        cnn_biomass_estimate: number;
      };
      environmental_risks: {
        detected_risks: Array<{
          type: string;
          severity: string;
          confidence: number;
        }>;
      };
    };
    gemini_insights?: {
      summary: string;
      recommendations: string[];
      sustainability_score: number;
    };
    enhanced_conservation_priorities?: {
      enhanced_recommendations: Array<{
        priority: string;
        action: string;
        source: string;
        enhancement: string;
      }>;
    };
  };
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ data }) => {
  const [activeSection, setActiveSection] = useState<'cnn' | 'gemini' | 'recommendations'>('cnn');
  const [geminiInsights, setGeminiInsights] = useState<any>(null);
  const [loadingGemini, setLoadingGemini] = useState(false);

  useEffect(() => {
    // Only use provided Gemini insights, no fallback fetching
    if (data.gemini_insights) {
      setGeminiInsights(data.gemini_insights);
    } else {
      setGeminiInsights(null);
    }
  }, [data]);

  const fetchGeminiInsights = async () => {
    // Remove mock Gemini insights - only use real backend data
    setLoadingGemini(false);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: 'text-red-400 bg-red-600/20',
      moderate: 'text-yellow-400 bg-yellow-600/20',
      low: 'text-green-400 bg-green-600/20'
    };
    return colors[severity.toLowerCase() as keyof typeof colors] || 'text-gray-400 bg-gray-600/20';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'border-red-400 bg-red-600/10',
      medium: 'border-yellow-400 bg-yellow-600/10',
      low: 'border-green-400 bg-green-600/10'
    };
    return colors[priority.toLowerCase() as keyof typeof colors] || 'border-gray-400 bg-gray-600/10';
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-green-500/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 border-b border-green-500/20">
        <h3 className="text-lg font-medium text-green-100 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Analysis Hub
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-500/20">
        {[
          { key: 'cnn', label: 'CNN Vision', icon: '👁️' },
          { key: 'gemini', label: 'Gemini AI', icon: '✨' },
          { key: 'recommendations', label: 'Actions', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as any)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeSection === tab.key
                ? 'text-green-100 bg-green-600/20 border-b-2 border-green-400'
                : 'text-green-200/70 hover:text-green-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSection === 'cnn' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-green-100">CNN Satellite Analysis</h4>
              <div className="text-sm text-green-400 bg-green-600/20 px-2 py-1 rounded">
                Vision AI
              </div>
            </div>

            {/* CNN Vegetation Analysis */}
            <div className="bg-slate-800/20 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-green-200 mb-3">Vegetation Metrics</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-400">Health Score</div>
                  <div className="text-lg font-bold text-green-400">
                    {data.cnn_analysis.vegetation_analysis.cnn_health_score.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Predicted NDVI</div>
                  <div className="text-lg font-bold text-green-400">
                    {data.cnn_analysis.vegetation_analysis.cnn_predicted_ndvi.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Status</div>
                  <div className="text-sm font-medium text-white capitalize">
                    {data.cnn_analysis.vegetation_analysis.vegetation_status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Biomass Estimate</div>
                  <div className="text-sm font-medium text-green-400">
                    {data.cnn_analysis.vegetation_analysis.cnn_biomass_estimate.toFixed(1)} kg/m²
                  </div>
                </div>
              </div>
            </div>

            {/* CNN Risk Detection */}
            <div className="bg-slate-800/20 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-green-200 mb-3">CNN Risk Detection</h5>
              {data.cnn_analysis.environmental_risks.detected_risks.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-green-400 mb-2">✅</div>
                  <div className="text-sm text-slate-300">No visual risks detected</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.cnn_analysis.environmental_risks.detected_risks.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <div>
                        <div className="text-sm font-medium text-white capitalize">
                          {risk.type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-slate-400">
                          Confidence: {(risk.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CNN Score */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg border border-purple-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {data.cnn_analysis.environmental_score.toFixed(1)}
                </div>
                <div className="text-sm text-slate-300">CNN Environmental Score</div>
                <div className="text-xs text-slate-400 mt-1">Based on satellite imagery analysis</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'gemini' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-green-100">Gemini AI Insights</h4>
              <div className="text-sm text-purple-400 bg-purple-600/20 px-2 py-1 rounded">
                LLM Analysis
              </div>
            </div>

            {loadingGemini ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-300">Gemini AI is analyzing...</p>
              </div>
            ) : geminiInsights ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-slate-800/20 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-green-200 mb-2">AI Summary</h5>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {geminiInsights.summary}
                  </p>
                </div>

                {/* Sustainability Score */}
                <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 p-4 rounded-lg border border-green-500/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {geminiInsights.sustainability_score}
                    </div>
                    <div className="text-sm text-slate-300">Sustainability Score</div>
                    <div className="text-xs text-slate-400 mt-1">Gemini AI Assessment</div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-800/20 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-green-200 mb-3">AI Recommendations</h5>
                  <div className="space-y-2">
                    {geminiInsights.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm text-slate-300">{rec}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                </div>
                <p className="text-slate-300 mb-2">Gemini insights not available</p>
                <p className="text-slate-400 text-sm">Backend must provide Gemini analysis</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-green-100">Action Recommendations</h4>
              <div className="text-sm text-orange-400 bg-orange-600/20 px-2 py-1 rounded">
                Actionable
              </div>
            </div>

            {data.enhanced_conservation_priorities?.enhanced_recommendations ? (
              <div className="space-y-3">
                {data.enhanced_conservation_priorities.enhanced_recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-600/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-green-600/20 text-green-400'
                      }`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="text-xs text-slate-400">{rec.source}</span>
                    </div>
                    <div className="text-sm font-medium text-white mb-1">
                      {rec.action}
                    </div>
                    <div className="text-xs text-slate-400">
                      Enhancement: {rec.enhancement.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-300 mb-2">No recommendations available</p>
                <p className="text-slate-400 text-sm">Backend must provide conservation recommendations</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};