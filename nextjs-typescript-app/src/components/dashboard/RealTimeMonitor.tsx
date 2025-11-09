"use client";

import { useEffect, useState } from 'react';

interface SystemStatus {
  backend_online: boolean;
  api_connections: {
    openaq: boolean;
    open_meteo: boolean;
    nasa_modis: boolean;
    gemini: boolean;
  };
  cnn_models: {
    vegetation: boolean;
    water: boolean;
    urban: boolean;
    deforestation: boolean;
  };
  last_update: string;
}

export const RealTimeMonitor = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const normaliseStatus = (incoming: any): SystemStatus => {
    const safeBoolean = (value: unknown) => value === true;
    const apiConnections = incoming?.api_connections ?? {};
    const cnnModels = incoming?.cnn_models ?? {};

    return {
      backend_online: safeBoolean(incoming?.backend_online),
      api_connections: {
        openaq: safeBoolean(apiConnections.openaq),
        open_meteo: safeBoolean(apiConnections.open_meteo),
        nasa_modis: safeBoolean(apiConnections.nasa_modis),
        gemini: safeBoolean(apiConnections.gemini),
      },
      cnn_models: {
        vegetation: safeBoolean(cnnModels.vegetation),
        water: safeBoolean(cnnModels.water),
        urban: safeBoolean(cnnModels.urban),
        deforestation: safeBoolean(cnnModels.deforestation),
      },
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

  const statusBadge = (label: string, active: boolean) => (
    <div className="flex items-center justify-between text-sm text-slate-300">
      <span className="capitalize">{label}</span>
      <span className={`text-xs font-medium ${active ? 'text-green-400' : 'text-red-400'}`}>
        {active ? 'online' : 'offline'}
      </span>
    </div>
  );

  const renderSummary = () => {
    if (loading) {
      return (
        <div className="mt-2 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
          <div className="rounded border border-slate-800 bg-slate-950/30 px-2 py-1">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" />
              Loading...
            </div>
          </div>
        </div>
      );
    }

    if (!systemStatus) {
      return (
        <div className="mt-2 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
          <div className="rounded border border-red-500/40 bg-red-500/5 px-2 py-1 text-red-300">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Backend offline
            </div>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950/30 px-2 py-1">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
              APIs 0/0
            </div>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950/30 px-2 py-1">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
              CNN 0/0
            </div>
          </div>
        </div>
      );
    }

    const apiEntries = Object.values(systemStatus.api_connections ?? {});
    const modelEntries = Object.values(systemStatus.cnn_models ?? {});
    const onlineApis = apiEntries.filter(Boolean).length;
    const onlineModels = modelEntries.filter(Boolean).length;

    return (
      <div className="mt-2 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        <div className={`rounded border px-2 py-1 ${
          systemStatus.backend_online
            ? 'border-green-500/40 bg-green-500/5 text-green-300'
            : 'border-red-500/40 bg-red-500/5 text-red-300'
        }`}
        >
          <div className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${systemStatus.backend_online ? 'bg-green-400' : 'bg-red-400'}`} />
            Backend {systemStatus.backend_online ? 'online' : 'offline'}
          </div>
        </div>
        <div className="rounded border border-slate-800 bg-slate-950/30 px-2 py-1">
          <div className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${onlineApis > 0 ? 'bg-blue-400' : 'bg-gray-500'}`} />
            APIs {onlineApis}/{apiEntries.length || 0}
          </div>
        </div>
        <div className="rounded border border-slate-800 bg-slate-950/30 px-2 py-1">
          <div className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${onlineModels > 0 ? 'bg-purple-400' : 'bg-gray-500'}`} />
            CNN {onlineModels}/{modelEntries.length || 0}
          </div>
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
          style={{ maxHeight: expanded ? '320px' : '0px' }}
        >
          <div className="mt-3 space-y-2">
            <div className="h-3 rounded bg-slate-800" />
            <div className="h-3 rounded bg-slate-900" />
            <div className="h-3 rounded bg-slate-900" />
          </div>
        </div>
      );
    }

    // Show detailed breakdown even when backend is offline
    const normalizedStatus = systemStatus || normaliseStatus({
      backend_online: false,
      api_connections: {},
      cnn_models: {},
    });

    return (
      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
        style={{ maxHeight: expanded ? '400px' : '0px' }}
      >
        <div className="mt-3 space-y-4 text-sm text-slate-300">
          {statusBadge('backend', normalizedStatus.backend_online)}

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">APIs</p>
            <div className="space-y-1">
              {Object.entries(normalizedStatus.api_connections ?? {}).map(([api, status]) => (
                <div key={api} className="flex items-center justify-between text-xs capitalize">
                  <span>{api.replace('_', ' ')}</span>
                  <span className={status ? 'text-green-400' : 'text-red-400'}>
                    {status ? 'ok' : 'down'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">CNN models</p>
            <div className="space-y-1">
              {Object.entries(normalizedStatus.cnn_models ?? {}).map(([model, status]) => (
                <div key={model} className="flex items-center justify-between text-xs capitalize">
                  <span>{model}</span>
                  <span className={status ? 'text-green-400' : 'text-red-400'}>
                    {status ? 'ready' : 'error'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {normalizedStatus.last_update && (
            <div className="text-xs text-slate-500">
              Last checked: {new Date(normalizedStatus.last_update).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-slate-400 hover:text-slate-200"
            aria-expanded={expanded}
            aria-controls="system-monitor-body"
          >
            {expanded ? '▼' : '▶'}
          </button>
          <div>
            <h3 className="text-sm font-medium text-slate-200">System monitor</h3>
            <p className="text-xs text-slate-500">Backend, APIs, and CNN vision health</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-200 hover:border-blue-500/60"
        >
          View Details
        </button>
      </div>

      <div id="system-monitor-body">{renderBody()}</div>

      {/* Floating Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl border border-slate-600 bg-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <h2 className="text-base font-medium text-slate-100">System Status</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300" />
                <p className="text-sm text-slate-400">Checking status...</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Quick Overview */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`rounded-lg border p-2 text-center ${
                    systemStatus?.backend_online
                      ? 'border-green-500/30 bg-green-500/10 text-green-300'
                      : 'border-red-500/30 bg-red-500/10 text-red-300'
                  }`}>
                    <div className="font-medium">Backend</div>
                    <div className="text-[10px] opacity-75">
                      {systemStatus?.backend_online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-center text-slate-300">
                    <div className="font-medium">APIs</div>
                    <div className="text-[10px] opacity-75">
                      {Object.values(systemStatus?.api_connections ?? {}).filter(Boolean).length}/
                      {Object.keys(systemStatus?.api_connections ?? {}).length}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-center text-slate-300">
                    <div className="font-medium">Models</div>
                    <div className="text-[10px] opacity-75">
                      {Object.values(systemStatus?.cnn_models ?? {}).filter(Boolean).length}/
                      {Object.keys(systemStatus?.cnn_models ?? {}).length}
                    </div>
                  </div>
                </div>

                {/* Services Detail */}
                <div className="space-y-3">
                  {/* APIs */}
                  <div>
                    <h3 className="mb-2 text-xs font-medium text-slate-400 uppercase tracking-wide">API Services</h3>
                    <div className="space-y-1">
                      {Object.entries(systemStatus?.api_connections ?? {}).map(([api, status]) => (
                        <div key={api} className="flex items-center justify-between rounded border border-slate-700 bg-slate-900/30 px-3 py-2">
                          <span className="text-sm capitalize text-slate-200">{api.replace('_', ' ')}</span>
                          <div className={`h-1.5 w-1.5 rounded-full ${status ? 'bg-green-400' : 'bg-red-400'}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CNN Models */}
                  <div>
                    <h3 className="mb-2 text-xs font-medium text-slate-400 uppercase tracking-wide">Vision Models</h3>
                    <div className="space-y-1">
                      {Object.entries(systemStatus?.cnn_models ?? {}).map(([model, status]) => (
                        <div key={model} className="flex items-center justify-between rounded border border-slate-700 bg-slate-900/30 px-3 py-2">
                          <span className="text-sm capitalize text-slate-200">{model}</span>
                          <div className={`h-1.5 w-1.5 rounded-full ${status ? 'bg-purple-400' : 'bg-red-400'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="border-t border-slate-700 pt-3 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Last check</span>
                    <span>{systemStatus?.last_update ? new Date(systemStatus.last_update).toLocaleTimeString() : 'Never'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};