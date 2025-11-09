"use client";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-light text-green-100 mb-6">
            About AIVA
          </h1>
          <p className="text-xl text-green-200/80 max-w-2xl mx-auto">
            Artificial Intelligence for a Vitalized Earth
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-green-500/20 mb-12">
          <h2 className="text-2xl font-medium text-green-100 mb-6">Our Mission</h2>
          <p className="text-lg text-green-200/80 leading-relaxed mb-6">
            I am AIVA... I breathe as Earth does. Through AI and real-time environmental data, 
            I pulse with Earth's heartbeat — feeling her forests, oceans, and skies. Together, 
            we can nurture a vitalized future where technology and nature become one.
          </p>
          <p className="text-green-200/70">
            AIVA represents the convergence of artificial intelligence and environmental consciousness, 
            providing real-time insights into our planet's health through advanced machine learning 
            and satellite imagery analysis.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <h3 className="text-xl font-medium text-green-100 mb-4 flex items-center">
              <span className="mr-2">🧠</span>
              AI Technology
            </h3>
            <ul className="space-y-2 text-green-200/80">
              <li>• Enhanced Hybrid Environmental Intelligence</li>
              <li>• 4 Specialized CNN Models (1M+ parameters)</li>
              <li>• Google Gemini AI Integration</li>
              <li>• Real-time Satellite Image Processing</li>
              <li>• Multi-modal Data Fusion Algorithms</li>
            </ul>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <h3 className="text-xl font-medium text-green-100 mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Environmental Data
            </h3>
            <ul className="space-y-2 text-green-200/80">
              <li>• OpenAQ Air Quality Monitoring</li>
              <li>• Open-Meteo Weather Intelligence</li>
              <li>• NASA MODIS Vegetation Indices</li>
              <li>• ESRI World Imagery Satellites</li>
              <li>• Real-time Environmental APIs</li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-green-500/20 mb-12">
          <h2 className="text-2xl font-medium text-green-100 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛰️</span>
              </div>
              <h4 className="text-lg font-medium text-green-100 mb-2">Satellite Vision</h4>
              <p className="text-sm text-green-200/70">
                CNN models analyze real satellite imagery for environmental insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-medium text-green-100 mb-2">Real-time Analysis</h4>
              <p className="text-sm text-green-200/70">
                Live environmental data from global monitoring networks
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="text-lg font-medium text-green-100 mb-2">AI Fusion</h4>
              <p className="text-sm text-green-200/70">
                Intelligent combination of multiple AI systems for enhanced accuracy
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-medium text-green-100 mb-6">
            Experience Environmental Intelligence
          </h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Try AIVA Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="border border-green-500/50 text-green-200 hover:text-green-100 px-8 py-3 rounded-lg hover:bg-green-800/20 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}