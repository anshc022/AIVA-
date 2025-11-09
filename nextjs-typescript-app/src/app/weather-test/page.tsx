import { WeatherMetrics } from '@/components/dashboard/WeatherMetrics';

export default function WeatherTestPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Weather Metrics Test</h1>
      
      <div className="space-y-8">
        <div className="bg-slate-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">New York Weather</h2>
          <WeatherMetrics latitude={40.7128} longitude={-74.0060} />
        </div>
        
        <div className="bg-slate-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">London Weather</h2>
          <WeatherMetrics latitude={51.5074} longitude={-0.1278} />
        </div>
        
        <div className="bg-slate-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">No Coordinates (Should show message)</h2>
          <WeatherMetrics />
        </div>
      </div>
    </div>
  );
}