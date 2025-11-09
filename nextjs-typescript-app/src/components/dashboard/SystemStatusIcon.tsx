"use client";

import { useEffect, useState } from 'react';

interface SystemStatus {
  backend_online: boolean;
  api_connections: Record<string, boolean>;
  cnn_models: Record<string, boolean>;
  last_update: string;
}

export const SystemStatusIcon = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const normaliseStatus = (incoming: any): SystemStatus => {
    const safeBoolean = (value: unknown) => value === true;
    const apiConnections = incoming?.api_connections ?? {};
    const cnnModels = incoming?.cnn_models ?? {};

    return {
      backend_online: safeBoolean(incoming?.backend_online),
      api_connections: Object.fromEntries(
        Object.entries(apiConnections).map(([key, value]) => [key, safeBoolean(value)])
      ),
      cnn_models: Object.fromEntries(
        Object.entries(cnnModels).map(([key, value]) => [key, safeBoolean(value)])
      ),
      last_update: typeof incoming?.last_update === 'string'
        ? incoming.last_update
        : new Date().toISOString(),
    };
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      const data = await response.json();
      setSystemStatus(normaliseStatus(data));
    } catch (error) {
      console.error('Failed to check system health:', error);
      setSystemStatus(
        normaliseStatus({
          backend_online: false,
          api_connections: {},
          cnn_models: {},
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (loading) return 'bg-gray-500';
    if (!systemStatus?.backend_online) return 'bg-red-500';
    
    const apiEntries = Object.values(systemStatus.api_connections);
    const modelEntries = Object.values(systemStatus.cnn_models);
    const onlineApis = apiEntries.filter(Boolean).length;
    const onlineModels = modelEntries.filter(Boolean).length;
    
    if (onlineApis === apiEntries.length && onlineModels === modelEntries.length) {
      return 'bg-green-500';
    }
    if (onlineApis > 0 || onlineModels > 0) {
      return 'bg-yellow-500';
    }
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (loading) return 'Checking system status...';
    if (!systemStatus?.backend_online) return 'Backend offline';
    
    const apiEntries = Object.values(systemStatus.api_connections);
    const modelEntries = Object.values(systemStatus.cnn_models);
    const onlineApis = apiEntries.filter(Boolean).length;
    const onlineModels = modelEntries.filter(Boolean).length;
    
    return `APIs: ${onlineApis}/${apiEntries.length} • Models: ${onlineModels}/${modelEntries.length}`;
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={checkSystemHealth}
        title="Click to refresh system status"
      >
        <div className={`h-2 w-2 rounded-full ${getStatusColor()} ${loading ? 'animate-pulse' : ''}`} />
        <span className="hidden sm:inline">System</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className={`font-medium ${
                systemStatus?.backend_online ? 'text-green-400' : 'text-red-400'
              }`}>
                {systemStatus?.backend_online ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="text-xs text-slate-300">
              {getStatusText()}
            </div>
            
            {systemStatus?.last_update && (
              <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
                Last checked: {new Date(systemStatus.last_update).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};