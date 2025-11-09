"use client";

import { useState } from 'react';
import { AnalysisSnapshot } from './types';
import { EarthVoice3D } from './EarthVoice3D';

type AnalysisSummaryProps = {
  snapshot: AnalysisSnapshot;
  rawData: unknown;
};

const formatNumber = (value?: number, suffix = ''): string => {
  if (value === undefined || Number.isNaN(value)) {
    return '—';
  }
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted}${suffix}`.trim();
};

export function AnalysisSummary({ snapshot, rawData }: AnalysisSummaryProps) {
  const [showRaw, setShowRaw] = useState(false);

  const scoreCards = [
    {
      label: 'Overall score',
      value: formatNumber(snapshot.overallScore),
      helper: snapshot.overallStatus,
    },
    snapshot.traditionalScore !== undefined || snapshot.cnnScore !== undefined
      ? {
          label: 'Traditional AI',
          value: formatNumber(snapshot.traditionalScore),
          helper: 'Live data APIs',
        }
      : null,
    snapshot.cnnScore !== undefined
      ? {
          label: 'CNN vision',
          value: formatNumber(snapshot.cnnScore),
          helper: 'Satellite imagery',
        }
      : null,
    snapshot.vegetationHealth !== undefined
      ? {
          label: 'Vegetation health',
          value: formatNumber(snapshot.vegetationHealth, '%'),
          helper: snapshot.vegetationStatus,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; helper?: string }>;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {scoreCards.map(({ label, value, helper }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-700 bg-slate-900/70 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
            {helper ? (
              <p className="mt-1 text-xs text-slate-400">{helper}</p>
            ) : null}
          </div>
        ))}
      </section>

      <EarthVoice3D snapshot={snapshot} />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Key metrics</p>
          <dl className="mt-3 space-y-2 text-sm text-slate-100">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
              <dt>Location</dt>
              <dd className="font-mono text-xs text-slate-300">
                {snapshot.locationLabel}
              </dd>
            </div>
            {snapshot.fusionConfidence ? (
              <div className="flex items-center justify-between gap-4">
                <dt>Fusion confidence</dt>
                <dd className="text-sm text-slate-200">{snapshot.fusionConfidence}</dd>
              </div>
            ) : null}
            {snapshot.scoreAgreement !== undefined ? (
              <div className="flex items-center justify-between gap-4">
                <dt>Score agreement</dt>
                <dd>{formatNumber(snapshot.scoreAgreement, '%')}</dd>
              </div>
            ) : null}
            {snapshot.ndvi !== undefined ? (
              <div className="flex items-center justify-between gap-4">
                <dt>NDVI</dt>
                <dd>{formatNumber(snapshot.ndvi)}</dd>
              </div>
            ) : null}
            {snapshot.vegetationConfidence ? (
              <div className="flex items-center justify-between gap-4">
                <dt>Vegetation confidence</dt>
                <dd>{snapshot.vegetationConfidence}</dd>
              </div>
            ) : null}
            {snapshot.satelliteSource ? (
              <div className="flex items-center justify-between gap-4">
                <dt>Satellite source</dt>
                <dd>
                  {snapshot.satelliteSource}{' '}
                  {snapshot.realSatellite ? '• real imagery' : ''}
                </dd>
              </div>
            ) : null}
            {snapshot.extraMetrics.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Risks & actions</p>
          <div className="mt-3 space-y-4 text-sm text-slate-100">
            <div>
              <p className="text-xs text-slate-400">Risk level</p>
              <p className="mt-1 text-base font-semibold">
                {snapshot.riskLevel ? snapshot.riskLevel : 'Not available'}
                {snapshot.totalRisks !== undefined
                  ? ` • ${snapshot.totalRisks} detected`
                  : ''}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {snapshot.riskList.length > 0 ? (
                  snapshot.riskList.map((risk) => (
                    <li key={`${risk.type}-${risk.severity}`.toLowerCase()}>
                      {risk.type}
                      {risk.severity ? ` • ${risk.severity}` : ''}
                    </li>
                  ))
                ) : (
                  <li>No specific risks reported.</li>
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs text-slate-400">Priority actions</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {snapshot.topActions.length > 0 ? (
                  snapshot.topActions.map((action) => (
                    <li key={`${action.action}-${action.priority}`}>
                      <span className="font-medium text-slate-100">{action.action}</span>
                      {action.priority ? ` • ${action.priority}` : ''}
                      {action.source ? ` • ${action.source}` : ''}
                    </li>
                  ))
                ) : (
                  <li>No actions supplied.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <button
          type="button"
          onClick={() => setShowRaw((prev) => !prev)}
          className="text-xs uppercase tracking-wide text-slate-400 hover:text-slate-200"
        >
          {showRaw ? 'Hide raw response' : 'Show raw response'}
        </button>
        {showRaw ? (
          <pre className="mt-3 max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        ) : null}
      </section>
    </div>
  );
}
