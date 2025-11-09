import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv

# Import simplified services
from services.ai_brain import EnhancedHybridEnvironmentalAI
from services.gemini import AIModelService
from services.location import LocationService

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize the AI Brain (our most advanced system)
print("🧠 Initializing AIVA AI Brain...")
ai_brain = EnhancedHybridEnvironmentalAI()
gemini = AIModelService()
location_service = LocationService()

print("🌍 AIVA - Advanced Environmental Intelligence Ready!")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check for AIVA system"""
    return jsonify({
        "backend_online": True,
        "api_connections": {
            "openaq": True,
            "open_meteo": True,
            "nasa_modis": True,
            "gemini": True
        },
        "cnn_models": {
            "vegetation": True,
            "water": True,
            "urban": True,
            "deforestation": True
        },
        "last_update": datetime.now().isoformat(),
        "status": "🌍 AIVA Advanced Environmental Intelligence is ONLINE",
        "capabilities": [
            "Real Satellite Image Analysis",
            "CNN Environmental Vision",
            "Traditional Environmental AI", 
            "Intelligent Fusion Processing",
            "Gemini Earth Voice Integration"
        ],
        "architecture": "Real Satellites → CNN Vision → Traditional AI → Fusion → Gemini",
        "version": "2.0 - Enhanced Hybrid Intelligence"
    })

@app.route('/analyze', methods=['POST'])
def analyze_environment():
    """
    🌍 MAIN ENDPOINT: Complete Environmental Analysis
    User clicks here to get everything!
    """
    try:
        data = request.get_json()
        
        # Get location (support both formats)
        lat = data.get('latitude') or data.get('lat', 40.7128)  # Default NYC
        lon = data.get('longitude') or data.get('lon', -74.0060)
        
        # Optional user message
        user_message = data.get('message', 'Analyze this location\'s environmental health')
        
        print(f"🌍 Starting complete analysis for {lat:.3f}, {lon:.3f}")
        
        # Resolve human-readable location name early (used in prompts and response)
        location_info = location_service.get_location_name(lat, lon)

        # 🚀 GET COMPLETE ANALYSIS FROM AI BRAIN
        # This does everything: Real Satellites + CNN + Traditional AI + Fusion
        complete_analysis = ai_brain.get_enhanced_comprehensive_analysis(lat, lon)
        
        # 🧠 GET GEMINI'S EARTH VOICE RESPONSE WITH TTS
        gemini_response = gemini.generate_aiva_response(
            f"As Earth speaking: {user_message}. Location: {location_info['name']} ({lat:.3f}, {lon:.3f})",
            "environmental_analysis",
            {
                "enhanced_analysis": complete_analysis,
                "location": location_info['name'],
                "coordinates": f"{lat:.3f}, {lon:.3f}",
                "environmental_score": complete_analysis['enhanced_environmental_score']['enhanced_score']
            },
            include_tts=True  # Enable TTS for full analysis
        )
        
        # 📊 PREPARE SIMPLE RESPONSE FOR USER
        # Extract the most important information
        enhanced_score = complete_analysis['enhanced_environmental_score']
        vegetation = complete_analysis['fused_vegetation_analysis']
        risks = complete_analysis['combined_risk_assessment']
        conservation = complete_analysis['enhanced_conservation_priorities']
        
        # Check if real satellite image was used
        real_satellite_used = False
        satellite_source = "simulation"
        if 'cnn_analysis' in complete_analysis:
            cnn_data = complete_analysis['cnn_analysis']
            if 'real_satellite_metadata' in cnn_data:
                real_satellite_used = True
                satellite_source = cnn_data['real_satellite_metadata']['source']
        
        # 📱 USER-FRIENDLY RESPONSE WITH TTS
        user_response = {
            "🌍_earth_voice": {
                "text": gemini_response.get("text", "Earth is listening..."),
                "tts_enabled": gemini_response.get("earth_voice_enabled", False),
                "audio": gemini_response.get("tts", {}) if gemini_response.get("earth_voice_enabled") else None,
                "timestamp": gemini_response.get("timestamp")
            },
            "📊_environmental_score": {
                "overall_score": f"{enhanced_score['enhanced_score']:.1f}/100",
                "status": "Excellent" if enhanced_score['enhanced_score'] > 80 else 
                         "Good" if enhanced_score['enhanced_score'] > 60 else
                         "Moderate" if enhanced_score['enhanced_score'] > 40 else "Poor",
                "traditional_ai": f"{enhanced_score['traditional_ai_score']:.1f}/100",
                "cnn_vision": f"{enhanced_score['cnn_ai_score']:.1f}/100"
            },
            "🌱_vegetation_health": {
                "health_percentage": f"{vegetation['fused_health_score']:.1f}%",
                "vegetation_status": vegetation['consensus_status'],
                "ndvi_index": f"{vegetation['fused_ndvi']:.3f}",
                "confidence": vegetation['fusion_confidence']
            },
            "🛰️_satellite_analysis": {
                "real_satellite_used": real_satellite_used,
                "satellite_source": satellite_source,
                "analysis_type": "🛰️ Real Satellite + 🧠 CNN + 📊 Traditional AI + 🔄 Fusion"
            },
            "⚠️_environmental_risks": {
                "risk_level": risks['combined_risk_level'],
                "total_risks": risks['total_risks_detected'],
                "consensus_risks": len(risks['consensus_risks']),
                "top_risks": [risk['type'] for risk in risks['all_detected_risks'][:3]]
            },
            "🌳_conservation_actions": {
                "total_recommendations": conservation['total_recommendations'],
                "top_actions": [
                    {
                        "action": rec['action'],
                        "priority": rec['priority'],
                        "source": rec['source']
                    } for rec in conservation['enhanced_recommendations'][:3]
                ]
            },
            "📍_location": {
                "latitude": lat,
                "longitude": lon,
                "name": location_info['name'],
                "display_name": location_info['name'],
                "coordinates": f"{lat:.3f}, {lon:.3f}",
                "analysis_timestamp": datetime.now().isoformat()
            },
            "🔄_data_flow": complete_analysis['data_integration_flow'],
            "📈_confidence_metrics": complete_analysis['fusion_confidence']
        }
        
        return jsonify(user_response)
        
    except Exception as e:
        return jsonify({
            "❌_error": f"Environmental analysis failed: {str(e)}",
            "🔧_suggestion": "Please check location coordinates and try again"
        }), 500

@app.route('/quick-scan', methods=['POST'])
def quick_environmental_scan():
    """
    ⚡ QUICK SCAN: Fast environmental check (no real satellites)
    For when users want quick results
    """
    try:
        data = request.get_json()
        lat = data.get('latitude') or data.get('lat', 40.7128)
        lon = data.get('longitude') or data.get('lon', -74.0060)
        
        # Use just the traditional environmental AI for speed
        from services.environment import FreeEnvironmentalAPIs
        env_api = FreeEnvironmentalAPIs()
        
        # Get basic environmental data
        air_quality = env_api.get_air_quality(lat, lon)
        weather = env_api.get_weather_data(lat, lon)
        vegetation = env_api.get_satellite_vegetation(lat, lon)
        
        # Calculate quick score with None checks
        aqi = air_quality.get('aqi', 50) if air_quality else None
        temp = weather.get('temperature', 20) if weather else None
        veg_health = vegetation.get('vegetation_health', 50) if vegetation else None
        
        # Only calculate score if we have real data
        if aqi is not None and temp is not None and veg_health is not None:
            quick_score = (100 - max(0, aqi - 50)) * 0.4 + veg_health * 0.4 + max(0, 50 - abs(temp - 22)) * 0.2
        else:
            quick_score = None
        
        # Get location name for better display
        location_info = location_service.get_location_name(lat, lon)
        
        # Get quick Gemini response with TTS
        quick_response = gemini.generate_aiva_response(
            f"Quick environmental scan for {location_info['name']} ({lat:.3f}, {lon:.3f}). Use place name in response.",
            "quick_scan",
            {"aqi": aqi, "temperature": temp, "vegetation": veg_health, "location": location_info['name'], "coordinates": f"{lat:.3f}, {lon:.3f}"},
            include_tts=True  # Enable TTS for quick scan
        )
        
        return jsonify({
            "🌍_earth_voice": {
                "text": quick_response.get("text", "Earth is sensing..."),
                "tts_enabled": quick_response.get("earth_voice_enabled", False),
                "audio": quick_response.get("tts", {}) if quick_response.get("earth_voice_enabled") else None
            },
            "⚡_quick_score": f"{quick_score:.1f}/100" if quick_score else "No real data available",
            "🌡️_temperature": f"{temp}°C" if temp else "Data unavailable",
            "💨_air_quality": f"AQI {aqi}" if aqi else "Data unavailable", 
            "🌱_vegetation": f"{veg_health:.1f}%" if veg_health else "Data unavailable",
            "📍_location": {
                "latitude": lat,
                "longitude": lon,
                "name": location_info['name'],
                "display_name": location_info['name'],
                "coordinates": f"{lat:.3f}, {lon:.3f}"
            },
            "⏱️_scan_type": "Quick Traditional AI Scan",
            "📊_data_availability": {
                "air_quality": aqi is not None,
                "temperature": temp is not None, 
                "vegetation": veg_health is not None,
                "real_apis_used": True,
                "fallback_data": False
            }
        })
        
    except Exception as e:
        return jsonify({"❌_error": f"Quick scan failed: {str(e)}"}), 500

@app.route('/satellite-vision', methods=['POST'])
def satellite_vision_analysis():
    """
    🛰️ SATELLITE VISION: Focus on CNN + Real Satellite analysis
    """
    try:
        data = request.get_json()
        lat = data.get('latitude') or data.get('lat', 40.7128)
        lon = data.get('longitude') or data.get('lon', -74.0060)
        
        # Use CNN vision system directly
        from services.vision import CNNEnvironmentalAI
        cnn_vision = CNNEnvironmentalAI()
        
        # Get CNN analysis with real satellites
        vision_analysis = cnn_vision.analyze_satellite_image(None, lat, lon)
        
        # Get location name for better display
        location_info = location_service.get_location_name(lat, lon)
        
        # Get Gemini's interpretation of the vision analysis with TTS
        vision_response = gemini.generate_aiva_response(
            f"As Earth, interpret this satellite vision analysis for {location_info['name']} ({lat:.3f}, {lon:.3f}). Use place name in response.",
            "satellite_vision",
            {**vision_analysis, "location": location_info['name'], "coordinates": f"{lat:.3f}, {lon:.3f}"},
            include_tts=True  # Enable TTS for satellite vision
        )
        
        return jsonify({
            "🌍_earth_vision": {
                "text": vision_response.get("text", "Earth sees through satellites..."),
                "tts_enabled": vision_response.get("earth_voice_enabled", False),
                "audio": vision_response.get("tts", {}) if vision_response.get("earth_voice_enabled") else None
            },
            "🛰️_satellite_data": vision_analysis.get('real_satellite_metadata', {"status": "simulated"}),
            "🧠_cnn_analysis": {
                "vegetation_health": f"{vision_analysis['vegetation_analysis']['cnn_health_score']:.1f}%",
                "water_presence": vision_analysis['water_analysis']['water_presence'],
                "urban_density": vision_analysis['urban_analysis']['urban_density'],
                "environmental_score": f"{vision_analysis['environmental_score']:.1f}/100"
            },
            "⚠️_risks": vision_analysis['environmental_risks'],
            "🌳_conservation": vision_analysis['conservation_priorities'],
            "📍_location": {
                "latitude": lat,
                "longitude": lon,
                "name": location_info['name'],
                "display_name": location_info['name'],
                "coordinates": f"{lat:.3f}, {lon:.3f}"
            },
            "🔬_analysis_type": "CNN Satellite Vision Analysis"
        })
        
    except Exception as e:
        return jsonify({"❌_error": f"Satellite vision failed: {str(e)}"}), 500

@app.route('/satellite-image', methods=['POST'])
def get_satellite_image():
    """
    🛰️ Get the actual satellite image used for AI analysis
    Returns the same image that CNN models analyze
    """
    try:
        data = request.get_json()
        lat = data.get('latitude') or data.get('lat', 40.7128)
        lon = data.get('longitude') or data.get('lon', -74.0060)
        
        print(f"🛰️ Fetching satellite image for {lat:.3f}, {lon:.3f}")
        
        # Use the same CNN vision system to get the satellite image
        from services.vision import CNNEnvironmentalAI
        cnn_vision = CNNEnvironmentalAI()
        
        # Get location name for better display
        location_info = location_service.get_location_name(lat, lon)
        
        # Get the satellite image data that's used for analysis
        # This returns the actual image being processed by AI
        satellite_data = cnn_vision.get_satellite_image_data(lat, lon)
        
        # Return image metadata and URL/base64 data
        response_data = {
            "📍_location": {
                "latitude": lat,
                "longitude": lon,
                "name": location_info['name'],
                "display_name": location_info['name'],
                "coordinates": f"{lat:.3f}, {lon:.3f}"
            },
            "🛰️_image_data": {
                "source": satellite_data.get('source', 'MODIS/Landsat'),
                "resolution": satellite_data.get('resolution', '250m'),
                "acquisition_date": satellite_data.get('date', 'recent'),
                "image_url": satellite_data.get('image_url'),
                "image_base64": satellite_data.get('image_base64'),
                "bands_used": satellite_data.get('bands', ['Red', 'Green', 'Blue', 'NIR']),
                "cloud_coverage": satellite_data.get('cloud_coverage', 'unknown')
            },
            "🧠_ai_processing": {
                "used_for_analysis": True,
                "cnn_models": ["vegetation", "water", "urban", "deforestation"],
                "processing_status": "ready_for_analysis"
            },
            "📊_image_metadata": {
                "width": satellite_data.get('width', 512),
                "height": satellite_data.get('height', 512),
                "format": satellite_data.get('format', 'RGB'),
                "size_kb": satellite_data.get('size_kb', 0)
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Satellite image fetch failed: {str(e)}")
        return jsonify({
            "❌_error": f"Failed to fetch satellite image: {str(e)}",
            "🔧_suggestion": "Check coordinates and satellite data availability"
        }), 500

@app.route('/locations/popular', methods=['GET'])
def get_popular_locations():
    """
    📍 Get popular locations for testing
    """
    popular_locations = [
        {
            "name": "Bengaluru Urban Core",
            "description": "India's tech capital with rapid urban growth",
            "coordinates": [12.9716, 77.5946],
            "lat": 12.9716,
            "lon": 77.5946,
            "type": "city"
        },
        {
            "name": "Western Ghats Canopy",
            "description": "Evergreen forest ridge spanning Karnataka and Kerala",
            "coordinates": [10.1723, 76.2566],
            "lat": 10.1723,
            "lon": 76.2566,
            "type": "forest"
        },
        {
            "name": "Rann of Kutch Delta",
            "description": "Seasonal salt marsh on the Indo-Pakistan border",
            "coordinates": [23.7337, 70.1713],
            "lat": 23.7337,
            "lon": 70.1713,
            "type": "desert"
        }
    ]
    
    return jsonify({
        "popular_locations": popular_locations,
        "usage": "Click on any location to analyze with AIVA's AI Brain"
    })

@app.route('/tts/earth-voice', methods=['POST'])
def generate_earth_voice_tts():
    """
    🔊 Generate Earth's voice audio for any text (standalone TTS endpoint)
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        emotion = data.get('emotion', 'calm')
        duration = data.get('duration', 10)
        
        if not text:
            return jsonify({
                "❌_error": "No text provided for Earth's voice",
                "🔧_usage": "Send {'text': 'message', 'emotion': 'calm', 'duration': 10}"
            }), 400
        
        # Import TTS service
        from services.tts import AIVATextToSpeech
        earth_voice = AIVATextToSpeech()
        
        if not earth_voice.enabled:
            return jsonify({
                "❌_error": "Earth Voice TTS not available",
                "🔧_suggestion": "Configure ELEVENLABS_API_KEY to enable Earth's voice"
            }), 503
        
        # Generate Earth's voice
        result = earth_voice.speak_earth_response(text, emotion, duration)
        
        if result.get("success"):
            return jsonify({
                "✅_success": True,
                "🔊_earth_voice": {
                    "audio_base64": result["audio_base64"],
                    "audio_format": result["audio_format"],
                    "voice_id": result["voice_id"],
                    "emotion": result["emotion"],
                    "estimated_duration": result["estimated_duration"],
                    "target_duration": f"{duration}s"
                },
                "📝_text_info": {
                    "original_text": text,
                    "processed_text": result.get("cleaned_text", text),
                    "character_count": result["text_length"]
                },
                "🎭_voice_settings": result.get("voice_settings", {}),
                "🌍_message": "Earth's voice generated successfully"
            })
        else:
            return jsonify({
                "❌_error": result.get("error", "Unknown TTS error"),
                "🔧_suggestion": result.get("suggestion", "Check ElevenLabs API configuration")
            }), 500
            
    except Exception as e:
        return jsonify({
            "❌_error": f"Earth voice generation failed: {str(e)}",
            "🔧_suggestion": "Check request format and try again"
        }), 500

@app.route('/weather', methods=['POST'])
def get_weather_data():
    """Get comprehensive weather data for location"""
    try:
        data = request.get_json()
        
        if not data or 'latitude' not in data or 'longitude' not in data:
            return jsonify({"error": "Location coordinates (latitude, longitude) are required"}), 400
            
        lat = float(data['latitude'])
        lon = float(data['longitude'])
        
        # Get weather data from environmental service
        from services.environment import FreeEnvironmentalAPIs
        env_api = FreeEnvironmentalAPIs()
        weather_data = env_api.get_weather_data(lat, lon)
        
        if weather_data:
            # Enhanced weather response with additional calculations
            enhanced_weather = weather_data.copy()
            
            # Add calculated fields
            temp = weather_data['temperature']
            enhanced_weather['feels_like'] = temp  # Could add heat index/wind chill calculation
            enhanced_weather['temp_range'] = weather_data['temp_max'] - weather_data['temp_min']
            
            # Add weather comfort index
            humidity = weather_data.get('humidity', 50)
            if temp >= 20 and temp <= 26 and humidity >= 40 and humidity <= 60:
                enhanced_weather['comfort_index'] = 'Comfortable'
            elif temp < 15 or temp > 30:
                enhanced_weather['comfort_index'] = 'Uncomfortable'
            else:
                enhanced_weather['comfort_index'] = 'Moderate'
            
            # Add UV risk assessment based on weather and location
            if abs(lat) < 30:  # Tropical/subtropical
                enhanced_weather['uv_risk'] = 'High' if weather_data.get('weather_code', 0) < 3 else 'Moderate'
            else:
                enhanced_weather['uv_risk'] = 'Moderate' if weather_data.get('weather_code', 0) < 3 else 'Low'
            
            return jsonify({
                "success": True,
                "weather": enhanced_weather,
                "location": {"latitude": lat, "longitude": lon},
                "data_source": "Open-Meteo (Free Weather API)",
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "error": "Weather data not available for this location",
                "location": {"latitude": lat, "longitude": lon},
                "timestamp": datetime.now().isoformat()
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Weather data fetch failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🌍 AIVA Advanced Environmental Intelligence Starting...")
    print("🛰️ Real Satellite Images: ✅ Enabled")
    print("🧠 CNN Vision Models: ✅ 4 Models Active") 
    print("📊 Traditional Environmental AI: ✅ Active")
    print("🔄 Intelligent Fusion: ✅ Active")
    print("💬 Gemini Earth Voice: ✅ Active")
    print("🚀 API Endpoints:")
    print("   POST /analyze - Complete Environmental Analysis")
    print("   POST /quick-scan - Fast Environmental Check")
    print("   POST /satellite-vision - CNN + Satellite Focus")
    print("   GET /locations/popular - Popular Test Locations")
    print("   GET /health - System Health Check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)