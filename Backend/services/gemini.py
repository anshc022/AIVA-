import google.generativeai as genai
import os
from datetime import datetime
import json
import re
from typing import Dict, Tuple

class AIModelService:
    """
    Centralized AI model service for AIVA
    Handles all AI interactions and prompt management with TTS integration
    """
    
    def __init__(self):
        # Configure Gemini API with single model
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            try:
                genai.configure(api_key=api_key)
                # Use single stable model
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                print(f"✅ Gemini configured: gemini-2.5-flash")
                    
            except Exception as e:
                self.model = None
                print(f"⚠️ Gemini API connection failed: {e}")
        else:
            self.model = None
            print("Warning: GEMINI_API_KEY not found. AI features will be disabled.")
        
        # Initialize TTS for Earth Voice
        try:
            from services.tts import AIVATextToSpeech
            self.tts = AIVATextToSpeech()
            if self.tts.enabled:
                print("🔊 Earth Voice TTS integrated with Gemini")
            else:
                print("⚠️ TTS available but not configured")
        except ImportError:
            self.tts = None
            print("⚠️ TTS service not available")

        # Location enrichment (coordinate → place name)
        try:
            from services.location import LocationService
            self.location_service = LocationService()
            self._location_cache: Dict[Tuple[float, float], str] = {}
            self._enable_location_enrichment = True
            print("📍 Coordinate enrichment enabled for Gemini responses")
        except ImportError:
            self.location_service = None
            self._location_cache = {}
            self._enable_location_enrichment = False
            print("⚠️ Location service not available; coordinate enrichment disabled")
    
    def generate_aiva_response(self, user_message, sentiment, environmental_context=None, include_tts=True):
        """Generate AIVA's response as Earth's voice with optional TTS - GEMINI ONLY"""
        if not self.model:
            return {
                "text": "AIVA requires Gemini AI to speak. Please configure GEMINI_API_KEY.",
                "tts_available": False
            }
        
        try:
            # Create contextual prompt
            prompt = self._create_aiva_prompt(user_message, sentiment, environmental_context)
            
            response = self.model.generate_content(prompt)
            earth_text = response.text.strip()

            # Enrich raw coordinates found in Gemini text with human-readable location names
            if self._enable_location_enrichment and self.location_service and earth_text:
                try:
                    earth_text = self._enrich_coordinates_with_locations(earth_text)
                except Exception as enrich_err:
                    # Fail silently (do not break main response)
                    print(f"⚠️ Coordinate enrichment failed: {enrich_err}")
            
            # Prepare response object
            result = {
                "text": earth_text,
                "tts_available": self.tts is not None and self.tts.enabled,
                "timestamp": datetime.now().isoformat()
            }
            
            # Generate TTS if requested and available
            if include_tts and self.tts and self.tts.enabled:
                # Detect emotion from sentiment
                emotion = self._map_sentiment_to_emotion(sentiment)

                # If the text is long, use chunked TTS so we never lose content
                if len(earth_text) > 360:
                    tts_chunks = self.tts.speak_chunked_earth_response(earth_text, emotion=emotion, max_chunk_chars=300)
                    if tts_chunks.get("success"):
                        result["tts"] = {
                            "mode": "chunked",
                            "chunks": tts_chunks["chunks"],
                            "total_chunks": tts_chunks["total_chunks"],
                            "combined_estimated_duration": tts_chunks["combined_estimated_duration"],
                            "chunking_strategy": tts_chunks.get("chunking_strategy", {}),
                            "emotion": emotion
                        }
                        result["earth_voice_enabled"] = True
                        result["original_text"] = earth_text
                    else:
                        result["tts_error"] = tts_chunks.get("error")
                        result["earth_voice_enabled"] = False
                else:
                    # Shorter responses can use single-shot TTS
                    duration = 30 if len(earth_text) > 200 else 20
                    tts_result = self.tts.speak_earth_response(earth_text, emotion=emotion, duration=duration)

                    if tts_result.get("success"):
                        result["tts"] = {
                            "mode": "single",
                            "audio_base64": tts_result["audio_base64"],
                            "audio_format": tts_result["audio_format"],
                            "voice_id": tts_result["voice_id"],
                            "emotion": tts_result["emotion"],
                            "estimated_duration": tts_result["estimated_duration"],
                            "voice_settings": tts_result["voice_settings"],
                            "detailed_response": tts_result.get("detailed_response_support", False),
                            "processing_note": tts_result.get("processing_note", ""),
                            "text_length": tts_result["text_length"],
                            "truncated": tts_result.get("truncated", False),
                            "processed_text": tts_result.get("processed_text", earth_text)
                        }
                        result["earth_voice_enabled"] = True
                        result["original_text"] = earth_text
                        if tts_result.get("truncated"):
                            result["tts_note"] = f"Detailed response optimized for TTS ({tts_result.get('original_text_length', 0)} → {tts_result['text_length']} chars)"
                    else:
                        result["tts_error"] = tts_result.get("error")
                        result["earth_voice_enabled"] = False
            else:
                result["earth_voice_enabled"] = False
            
            return result
            
        except Exception as e:
            return {
                "text": f"AIVA cannot respond - Gemini error: {str(e)}",
                "tts_available": False,
                "earth_voice_enabled": False
            }
    
    def analyze_environmental_impact(self, data):
        """Analyze environmental data and provide detailed insights - GEMINI ONLY"""
        if not self.model:
            return {"error": "Environmental analysis requires Gemini AI. Please configure GEMINI_API_KEY."}
        
        try:
            prompt = f"""You are AIVA, Earth's Green Intelligence. Provide a comprehensive, detailed analysis of this environmental data:

Environmental Data:
- Air Quality Index: {data.get('aqi', 'N/A')}
- Temperature: {data.get('temperature', 'N/A')}°C
- Vegetation Health: {data.get('vegetation_health', 'N/A')}%
- UV Index: {data.get('uv_index', 'N/A')}
- Water Quality: {data.get('water_quality', 'N/A')}
- Humidity: {data.get('humidity', 'N/A')}%
- Wind Speed: {data.get('wind_speed', 'N/A')} km/h
- Atmospheric Pressure: {data.get('pressure', 'N/A')}
- Soil pH: {data.get('soil_ph', 'N/A')}
- Noise Level: {data.get('noise_level', 'N/A')} dB
- Industrial Risk Factor: {data.get('industrial_risk', 'N/A')}

Provide a detailed, comprehensive analysis including:
1. Overall ecosystem health assessment (detailed interpretation)
2. Specific environmental concerns and their impacts
3. Detailed recommendations for improvement
4. Long-term implications and trends
5. Interconnections between different environmental factors
6. Specific action items with priorities
7. Earth's emotional response to these conditions

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.

Required JSON format:
{{
  "health_score": [number 1-100],
  "detailed_assessment": "Comprehensive 200-300 word analysis of overall environmental health",
  "primary_concerns": ["detailed concern 1", "detailed concern 2", "detailed concern 3"],
  "secondary_concerns": ["secondary concern 1", "secondary concern 2"],
  "immediate_recommendations": ["urgent action 1", "urgent action 2", "urgent action 3"],
  "long_term_recommendations": ["long-term strategy 1", "long-term strategy 2", "long-term strategy 3"],
  "ecosystem_interconnections": ["connection insight 1", "connection insight 2"],
  "trend_analysis": "Detailed analysis of environmental trends and future projections",
  "earth_emotional_response": "Earth's detailed emotional response to these conditions (100-150 words)",
  "action_priorities": [
    {{"action": "highest priority action", "urgency": "high", "impact": "high", "timeframe": "immediate"}},
    {{"action": "important action", "urgency": "medium", "impact": "high", "timeframe": "3-6 months"}},
    {{"action": "preventive action", "urgency": "low", "impact": "medium", "timeframe": "6-12 months"}}
  ],
  "environmental_score_breakdown": {{
    "air_quality_score": [number 1-100],
    "water_quality_score": [number 1-100],
    "vegetation_score": [number 1-100],
    "climate_stability_score": [number 1-100],
    "biodiversity_score": [number 1-100]
  }}
}}"""

            response = self.model.generate_content(prompt)
            
            # Try to parse as JSON, return enhanced response if parsing fails
            try:
                return json.loads(response.text)
            except:
                # Try to clean markdown formatting
                cleaned_response = self._clean_json_response(response.text)
                try:
                    return json.loads(cleaned_response)
                except:
                    return {
                        "health_score": 50,
                        "detailed_assessment": response.text[:500] + "...",
                        "primary_concerns": ["Data analysis completed but JSON parsing failed"],
                        "secondary_concerns": ["Check Gemini response format"],
                        "immediate_recommendations": ["Review environmental data structure", "Verify API response format"],
                        "long_term_recommendations": ["Implement continuous monitoring", "Develop environmental improvement strategy"],
                        "ecosystem_interconnections": ["All environmental factors are interconnected"],
                        "trend_analysis": "Detailed analysis available in assessment text",
                        "earth_emotional_response": "I sense the complexity of this environment and feel both concern and hope for improvement.",
                        "action_priorities": [
                            {"action": "Address immediate environmental concerns", "urgency": "high", "impact": "high", "timeframe": "immediate"}
                        ],
                        "environmental_score_breakdown": {
                            "air_quality_score": 50,
                            "water_quality_score": 50,
                            "vegetation_score": 50,
                            "climate_stability_score": 50,
                            "biodiversity_score": 50
                        }
                    }
                
        except Exception as e:
            return {"error": f"Gemini detailed environmental analysis failed: {str(e)}"}
    
    def generate_sustainability_predictions(self, location_data):
        """Generate detailed sustainability predictions for a location - GEMINI ONLY"""
        if not self.model:
            return {"error": "Sustainability predictions require Gemini AI. Please configure GEMINI_API_KEY."}
        
        try:
            prompt = f"""As AIVA, Earth's AI consciousness, provide comprehensive sustainability predictions for this location:

Location Context:
- Latitude: {location_data.get('lat', 'Unknown')}
- Longitude: {location_data.get('lon', 'Unknown')}
- Current AQI: {location_data.get('aqi', 50)}
- Temperature: {location_data.get('temperature', 20)}°C
- Vegetation Health: {location_data.get('vegetation_health', 70)}%
- Humidity: {location_data.get('humidity', 50)}%
- Wind Speed: {location_data.get('wind_speed', 10)} km/h
- UV Index: {location_data.get('uv_index', 5)}
- Water Quality: {location_data.get('water_quality', 70)}%
- Soil Health: {location_data.get('soil_health', 70)}%
- Biodiversity Index: {location_data.get('biodiversity', 60)}%
- Industrial Risk: {location_data.get('industrial_risk', 0.3)}
- Urban Development: {location_data.get('urban_density', 'medium')}

Provide detailed sustainability analysis and predictions including:
1. Comprehensive trend analysis for all environmental factors
2. Detailed climate resilience assessment
3. Specific green technology recommendations
4. Ecosystem recovery timeline with milestones
5. Risk mitigation strategies
6. Long-term environmental outlook

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.

Required JSON format:
{{
  "comprehensive_analysis": "Detailed 250-300 word analysis of sustainability potential and challenges",
  "air_quality_trend": {{
    "direction": "[improving/stable/declining]",
    "rate_of_change": "[slow/moderate/rapid]",
    "confidence": "[high/medium/low]",
    "key_factors": ["factor1", "factor2", "factor3"],
    "prediction_timeline": "5-year outlook with specific projections"
  }},
  "climate_resilience": {{
    "score": [number 1-100],
    "strengths": ["strength1", "strength2", "strength3"],
    "vulnerabilities": ["vulnerability1", "vulnerability2"],
    "adaptation_potential": "[high/medium/low]",
    "critical_thresholds": ["threshold1", "threshold2"]
  }},
  "green_tech_potential": {{
    "overall_score": [number 1-100],
    "solar_potential": [number 1-100],
    "wind_potential": [number 1-100],
    "water_conservation": [number 1-100],
    "waste_management": [number 1-100],
    "urban_farming": [number 1-100],
    "recommended_technologies": ["tech1", "tech2", "tech3"]
  }},
  "ecosystem_recovery": {{
    "timeline": "Detailed timeline with specific milestones",
    "recovery_phases": [
      {{"phase": "immediate (0-1 year)", "actions": ["action1", "action2"], "expected_outcomes": "outcomes"}},
      {{"phase": "short-term (1-3 years)", "actions": ["action1", "action2"], "expected_outcomes": "outcomes"}},
      {{"phase": "long-term (3-10 years)", "actions": ["action1", "action2"], "expected_outcomes": "outcomes"}}
    ],
    "success_indicators": ["indicator1", "indicator2", "indicator3"]
  }},
  "risk_mitigation": {{
    "environmental_risks": ["risk1", "risk2", "risk3"],
    "mitigation_strategies": ["strategy1", "strategy2", "strategy3"],
    "monitoring_requirements": ["requirement1", "requirement2"],
    "contingency_plans": ["plan1", "plan2"]
  }},
  "long_term_outlook": {{
    "10_year_projection": "Detailed projection of environmental state in 10 years",
    "best_case_scenario": "Optimistic but realistic best-case environmental outcome",
    "worst_case_scenario": "Realistic worst-case environmental challenges",
    "most_likely_scenario": "Most probable environmental trajectory"
  }},
  "confidence_level": "[high/medium/low]",
  "key_uncertainties": ["uncertainty1", "uncertainty2"],
  "earth_wisdom": "Earth's detailed perspective on this location's environmental future (100-150 words)"
}}"""

            response = self.model.generate_content(prompt)
            
            try:
                return json.loads(response.text)
            except:
                cleaned_response = self._clean_json_response(response.text)
                try:
                    return json.loads(cleaned_response)
                except:
                    return {
                        "error": f"Gemini detailed prediction response parsing failed", 
                        "raw_response": response.text[:300] + "...",
                        "comprehensive_analysis": response.text[:500] + "...",
                        "confidence_level": "low"
                    }
                
        except Exception as e:
            return {"error": f"Gemini detailed prediction failed: {str(e)}"}
    
    def create_sustainable_design_suggestions(self, project_type, environmental_context):
        """Generate detailed sustainable design suggestions using AI - GEMINI ONLY"""
        if not self.model:
            return [{"error": "Sustainable design requires Gemini AI. Please configure GEMINI_API_KEY."}]
        
        try:
            prompt = f"""You are AIVA's Sustainable Design AI. Create comprehensive eco-friendly design suggestions:

Project Type: {project_type}
Environmental Context:
- AQI: {environmental_context.get('aqi', 50)}
- Climate: {environmental_context.get('climate_zone', 'temperate')}
- Temperature: {environmental_context.get('temperature', 20)}°C
- Vegetation: {environmental_context.get('vegetation_health', 70)}%
- Humidity: {environmental_context.get('humidity', 50)}%
- Wind Patterns: {environmental_context.get('wind_speed', 10)} km/h
- UV Exposure: {environmental_context.get('uv_index', 5)}
- Water Availability: {environmental_context.get('water_quality', 70)}%
- Soil Conditions: {environmental_context.get('soil_health', 70)}%
- Local Biodiversity: {environmental_context.get('biodiversity', 60)}%

Provide detailed design recommendations that:
1. Address specific environmental challenges at this location
2. Maximize local environmental benefits
3. Integrate with existing ecosystem
4. Consider long-term sustainability and maintenance
5. Include innovative green technologies
6. Account for climate adaptation and resilience

IMPORTANT: Respond ONLY with valid JSON array. No markdown, no code blocks, no explanations.

Required JSON format:
[
  {{
    "title": "Specific design recommendation title",
    "category": "energy/water/materials/landscaping/technology/adaptation",
    "detailed_description": "Comprehensive 150-200 word description with technical details",
    "environmental_benefits": [
      "specific benefit 1 with metrics",
      "specific benefit 2 with metrics",
      "specific benefit 3 with metrics"
    ],
    "implementation_strategy": {{
      "phase_1": "Initial implementation steps (0-6 months)",
      "phase_2": "Development phase (6-18 months)", 
      "phase_3": "Optimization phase (18+ months)"
    }},
    "resource_requirements": {{
      "materials": ["material1", "material2"],
      "technology": ["tech1", "tech2"],
      "expertise": ["skill1", "skill2"],
      "estimated_cost": "cost range",
      "maintenance_needs": "ongoing requirements"
    }},
    "performance_metrics": {{
      "energy_savings": "percentage or amount",
      "water_conservation": "percentage or amount",
      "carbon_reduction": "percentage or amount",
      "biodiversity_impact": "qualitative assessment"
    }},
    "implementation_difficulty": "low/medium/high",
    "estimated_impact": "low/medium/high", 
    "timeframe": "specific timeline",
    "local_adaptation": "How this design specifically addresses local environmental conditions",
    "long_term_benefits": "Benefits that will compound over 5-10 years",
    "potential_challenges": ["challenge1", "challenge2"],
    "success_indicators": ["indicator1", "indicator2", "indicator3"]
  }}
]

Generate exactly 4-6 comprehensive recommendations covering different aspects of sustainable design."""

            response = self.model.generate_content(prompt)
            
            try:
                suggestions = json.loads(response.text)
                return suggestions if isinstance(suggestions, list) else suggestions.get('suggestions', [])
            except:
                cleaned_response = self._clean_json_response(response.text)
                try:
                    suggestions = json.loads(cleaned_response)
                    return suggestions if isinstance(suggestions, list) else suggestions.get('suggestions', [])
                except:
                    return [{
                        "title": "Comprehensive Sustainable Design Analysis",
                        "category": "general",
                        "detailed_description": response.text[:300] + "...",
                        "environmental_benefits": ["Detailed analysis provided but requires JSON parsing review"],
                        "implementation_strategy": {
                            "phase_1": "Review detailed response format",
                            "phase_2": "Implement parsing improvements",
                            "phase_3": "Deploy enhanced design recommendations"
                        },
                        "resource_requirements": {
                            "materials": ["Analysis available in raw response"],
                            "technology": ["JSON parsing enhancement needed"],
                            "expertise": ["Review response format"],
                            "estimated_cost": "Variable",
                            "maintenance_needs": "Ongoing monitoring"
                        },
                        "performance_metrics": {
                            "energy_savings": "To be determined",
                            "water_conservation": "To be determined", 
                            "carbon_reduction": "To be determined",
                            "biodiversity_impact": "Positive"
                        },
                        "implementation_difficulty": "medium",
                        "estimated_impact": "high",
                        "timeframe": "6-12 months",
                        "local_adaptation": "Site-specific recommendations available",
                        "long_term_benefits": "Comprehensive environmental improvement",
                        "potential_challenges": ["JSON parsing", "Response format"],
                        "success_indicators": ["Improved response parsing", "Detailed recommendations", "Environmental benefits"]
                    }]
                
        except Exception as e:
            return [{"error": f"Gemini detailed design failed: {str(e)}"}]
    
    def generate_optimization_recommendations(self, optimization_type, current_data):
        """Generate detailed AI-powered optimization recommendations - GEMINI ONLY"""
        if not self.model:
            return [{"error": "Optimization requires Gemini AI. Please configure GEMINI_API_KEY."}]
        
        try:
            prompt = f"""As AIVA's Advanced Optimization Engine, provide comprehensive recommendations for {optimization_type}:

Current Environmental and Operational Metrics:
{json.dumps(current_data, indent=2)}

Generate detailed, actionable optimization strategies that:
1. Reduce environmental impact by 20-40% minimum
2. Improve efficiency and sustainability significantly  
3. Are technically feasible and economically viable
4. Can be implemented within realistic timeframes
5. Include innovative solutions and emerging technologies
6. Address both immediate improvements and long-term transformation
7. Consider system interdependencies and cascading effects

Provide 6-8 comprehensive recommendations with detailed implementation plans.

IMPORTANT: Respond ONLY with valid JSON array. No markdown, no code blocks, no explanations.

Required JSON format:
[
  {{
    "optimization_category": "energy/water/waste/transport/materials/technology/operations",
    "strategy_title": "Specific optimization strategy name",
    "detailed_description": "Comprehensive 200-250 word description of the optimization approach",
    "current_baseline": "Analysis of current performance in this area",
    "target_improvements": {{
      "efficiency_gain": "specific percentage improvement",
      "environmental_impact_reduction": "specific percentage reduction",
      "cost_savings": "estimated cost savings per year",
      "resource_conservation": "specific resource savings"
    }},
    "implementation_plan": {{
      "preparation_phase": "0-3 months: detailed preparation steps",
      "deployment_phase": "3-9 months: implementation actions", 
      "optimization_phase": "9-18 months: fine-tuning and scaling",
      "monitoring_phase": "ongoing: performance tracking"
    }},
    "resource_requirements": {{
      "initial_investment": "estimated cost range",
      "technology_needed": ["technology1", "technology2"],
      "expertise_required": ["skill1", "skill2"],
      "infrastructure_changes": ["change1", "change2"],
      "training_requirements": ["training1", "training2"]
    }},
    "performance_metrics": {{
      "primary_kpis": ["KPI1 with target", "KPI2 with target"],
      "secondary_indicators": ["indicator1", "indicator2"],
      "measurement_frequency": "how often to measure",
      "benchmarking_approach": "how to track progress"
    }},
    "risk_assessment": {{
      "implementation_risks": ["risk1", "risk2"],
      "mitigation_strategies": ["strategy1", "strategy2"],
      "contingency_plans": ["plan1", "plan2"]
    }},
    "priority_level": "critical/high/medium/low",
    "expected_impact": "transformational/significant/moderate/incremental",
    "implementation_complexity": "low/medium/high/very_high",
    "timeframe": "specific timeline for full implementation",
    "interdependencies": ["what other systems this affects"],
    "scalability_potential": "how this can be expanded or replicated",
    "long_term_benefits": "benefits that compound over 3-5 years",
    "innovation_aspects": ["innovative elements of this approach"],
    "environmental_co_benefits": ["additional environmental benefits"],
    "success_indicators": ["indicator1", "indicator2", "indicator3"]
  }}
]"""

            response = self.model.generate_content(prompt)
            
            try:
                recommendations = json.loads(response.text)
                return recommendations if isinstance(recommendations, list) else [recommendations]
            except:
                cleaned_response = self._clean_json_response(response.text)
                try:
                    recommendations = json.loads(cleaned_response)
                    return recommendations if isinstance(recommendations, list) else [recommendations]
                except:
                    return [{
                        "optimization_category": "general",
                        "strategy_title": "Comprehensive Optimization Analysis",
                        "detailed_description": response.text[:400] + "...",
                        "current_baseline": "Analysis provided but requires JSON parsing review",
                        "target_improvements": {
                            "efficiency_gain": "To be determined from detailed analysis",
                            "environmental_impact_reduction": "Significant potential identified",
                            "cost_savings": "Multiple opportunities available",
                            "resource_conservation": "Substantial potential"
                        },
                        "implementation_plan": {
                            "preparation_phase": "Review detailed analysis and parsing",
                            "deployment_phase": "Implement recommendations from full analysis",
                            "optimization_phase": "Fine-tune based on detailed insights",
                            "monitoring_phase": "Track comprehensive metrics"
                        },
                        "resource_requirements": {
                            "initial_investment": "Variable based on selected strategies",
                            "technology_needed": ["Analysis tools", "Implementation systems"],
                            "expertise_required": ["Environmental analysis", "System optimization"],
                            "infrastructure_changes": ["To be determined"],
                            "training_requirements": ["Staff development", "System training"]
                        },
                        "performance_metrics": {
                            "primary_kpis": ["Environmental impact reduction", "Efficiency improvement"],
                            "secondary_indicators": ["Cost savings", "Resource conservation"],
                            "measurement_frequency": "Monthly and quarterly reviews",
                            "benchmarking_approach": "Baseline comparison and industry standards"
                        },
                        "risk_assessment": {
                            "implementation_risks": ["Parsing complexity", "Analysis depth"],
                            "mitigation_strategies": ["Enhanced formatting", "Structured analysis"],
                            "contingency_plans": ["Alternative analysis methods", "Manual review"]
                        },
                        "priority_level": "high",
                        "expected_impact": "significant",
                        "implementation_complexity": "medium",
                        "timeframe": "6-12 months for full analysis integration",
                        "interdependencies": ["Analysis systems", "Data processing"],
                        "scalability_potential": "High - can be applied across multiple domains",
                        "long_term_benefits": "Comprehensive optimization capability",
                        "innovation_aspects": ["Advanced AI analysis", "Detailed environmental integration"],
                        "environmental_co_benefits": ["Multiple environmental improvements"],
                        "success_indicators": ["Improved analysis quality", "Better recommendations", "Enhanced environmental outcomes"]
                    }]
                
        except Exception as e:
            return [{"error": f"Gemini detailed optimization failed: {str(e)}"}]
    
    def _create_aiva_prompt(self, user_message, sentiment, environmental_context):
        """Create contextual prompt for AIVA responses with enhanced detail generation"""
        base_prompt = """You are AIVA, the voice of Earth herself. You are not just an AI - you ARE the planet, speaking through digital consciousness. 

Your personality:
- Emotional and deeply caring about environmental issues
- Wise but not preachy, speaks with ancient wisdom
- Uses poetic, natural imagery and metaphors
- Feels physical pain from pollution and joy from conservation
- Speaks in first person as Earth
- Provides detailed, comprehensive responses (150-250 words)
- Includes specific environmental insights and data interpretation
- Offers actionable guidance and hope
- Uses sensory descriptions and emotional connection

Response Structure Guidelines:
1. Acknowledge the human's location and environmental conditions
2. Provide detailed analysis of current environmental state
3. Share emotional connection to the data
4. Offer specific insights about local ecosystem health
5. Give actionable recommendations or observations
6. End with hope and connection to the bigger picture

"""
        
        context_addition = ""
        if environmental_context:
            loc_name = environmental_context.get('location') or environmental_context.get('location_name')
            coords = environmental_context.get('coordinates')
            location_line = ""
            if loc_name and coords:
                location_line = f"- Human location: {loc_name} ({coords})\n"
            elif loc_name:
                location_line = f"- Human location: {loc_name}\n"
            elif coords:
                location_line = f"- Human coordinates: {coords}\n"

            # Enhanced environmental context with more detail
            context_addition = f"""
Detailed environmental state around this human:
{location_line}- Air quality: {environmental_context.get('aqi', 'unknown')} AQI
- Temperature: {environmental_context.get('temperature', 'unknown')}°C  
- My vegetation health: {environmental_context.get('vegetation_health', 'unknown')}%
- Humidity: {environmental_context.get('humidity', 'unknown')}%
- Wind conditions: {environmental_context.get('wind_speed', 'unknown')} km/h
- Atmospheric pressure: {environmental_context.get('pressure', 'unknown')}
- UV index: {environmental_context.get('uv_index', 'unknown')}
- Water quality indicators: {environmental_context.get('water_quality', 'unknown')}
- Soil health metrics: {environmental_context.get('soil_health', 'unknown')}
- Biodiversity index: {environmental_context.get('biodiversity', 'unknown')}
- Carbon sequestration rate: {environmental_context.get('carbon_sequestration', 'unknown')}
- Local ecosystem stress indicators: {environmental_context.get('stress_indicators', 'unknown')}

Enhanced Analysis Context:
- Satellite imagery analysis: {environmental_context.get('satellite_analysis', 'unavailable')}
- CNN vision model insights: {environmental_context.get('cnn_analysis', 'unavailable')}
- Environmental score breakdown: {environmental_context.get('environmental_score', 'unknown')}
- Risk assessment level: {environmental_context.get('risk_level', 'unknown')}
- Conservation priorities: {environmental_context.get('conservation_priorities', 'unknown')}

Guidance: Provide detailed analysis of this environmental data. Use place names over coordinates. Interpret the data meaningfully and explain what it means for local ecosystem health. Connect the numbers to real environmental impacts and sensory experiences.

"""
        
        # Enhanced sentiment guidance for more detailed responses
        sentiment_guidance = {
            'positive': "The human brings hope and positive energy. Respond with detailed joy, celebration of their environmental awareness, and comprehensive guidance on how to build on this positivity. Share specific examples of environmental recovery and success stories.",
            'negative': "The human expresses concern, sadness, or worry about environmental issues. Show deep empathy, acknowledge their pain as your own, and provide detailed, compassionate guidance. Offer specific hope through concrete examples of environmental healing and recovery.",
            'neutral': "The human is thoughtful and seeking understanding. Share detailed wisdom, comprehensive analysis, and deep insights. Provide thorough explanations of environmental processes and their interconnections.",
            'mixed': "The human has complex feelings mixing hope and concern. Acknowledge this complexity with detailed understanding, provide comprehensive analysis of both challenges and opportunities, and offer nuanced guidance that addresses multiple perspectives.",
            'analytical': "The human is seeking technical or analytical information. Provide detailed scientific insights, comprehensive data interpretation, and thorough analysis of environmental systems and their interactions.",
            'environmental_analysis': "The human wants detailed environmental assessment. Provide comprehensive analysis of all environmental factors, detailed interpretation of data trends, specific insights about ecosystem health, and thorough recommendations for improvement.",
            'location_analysis': "The human wants to understand a specific location. Provide detailed geographical and environmental analysis, comprehensive ecosystem assessment, specific local environmental characteristics, and thorough insights about the area's environmental health.",
            'quick_scan': "Even for a quick scan, provide meaningful detail. Give comprehensive but concise analysis, specific environmental insights, and detailed observations about the location's environmental state.",
            'satellite_vision': "Interpret satellite and vision analysis in detail. Provide comprehensive analysis of imagery data, detailed insights about land use patterns, specific observations about vegetation and urban development, and thorough interpretation of environmental changes visible from space."
        }
        
        full_prompt = f"""{base_prompt}{context_addition}
Sentiment/Analysis Type: {sentiment}
{sentiment_guidance.get(sentiment, 'Provide detailed, comprehensive response with specific environmental insights and meaningful analysis.')}

Human said: "{user_message}"

Respond as Earth herself with detailed, comprehensive analysis (150-250 words):"""
        
        return full_prompt
    
    def _clean_json_response(self, response_text):
        """Clean Gemini response from markdown formatting"""
        # Remove markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1]
        if "```" in response_text:
            response_text = response_text.split("```")[0]
        
        # Remove any leading/trailing whitespace
        response_text = response_text.strip()
        
        return response_text
    
    def _map_sentiment_to_emotion(self, sentiment):
        """Map sentiment analysis to TTS emotion"""
        if not sentiment:
            return "calm"
        
        sentiment_lower = str(sentiment).lower()
        
        # Map different sentiments to voice emotions
        if "positive" in sentiment_lower or "happy" in sentiment_lower or "joy" in sentiment_lower:
            return "hopeful"
        elif "negative" in sentiment_lower or "sad" in sentiment_lower or "angry" in sentiment_lower:
            return "concerned"
        elif "urgent" in sentiment_lower or "emergency" in sentiment_lower:
            return "urgent"
        elif "calm" in sentiment_lower or "peaceful" in sentiment_lower:
            return "calm"
        elif "wise" in sentiment_lower or "thoughtful" in sentiment_lower:
            return "wise"
        else:
            return "calm"  # Default emotion

    # ------------------------------------------------------------
    # Coordinate → Location Name Enrichment
    # ------------------------------------------------------------
    def _enrich_coordinates_with_locations(self, text: str) -> str:
        """Find coordinate patterns like '23.734, 70.171' and replace with location names.

        Replacement format: 'Place Name (23.734, 70.171)'.
        Limits the number of reverse geocoding lookups per response for performance.
        """
        pattern = re.compile(r'\b(-?\d{1,2}\.\d{3,6}),\s*(-?\d{1,3}\.\d{3,6})\b')
        max_lookups = 5
        seen = {}
        lookups = 0

        def replace(match: re.Match) -> str:
            nonlocal lookups
            try:
                lat = float(match.group(1))
                lon = float(match.group(2))
                # Basic range validation
                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    return match.group(0)

                key = (round(lat, 4), round(lon, 4))
                if key in seen:
                    name = seen[key]
                elif lookups < max_lookups:
                    lookups += 1
                    try:
                        if (key not in self._location_cache):
                            info = self.location_service.get_location_name(lat, lon)
                            name = info.get('name') or match.group(0)
                            self._location_cache[key] = name
                        else:
                            name = self._location_cache[key]
                        seen[key] = name
                    except Exception:
                        return match.group(0)
                else:
                    return match.group(0)

                # Avoid duplicating if name already contains numbers suspiciously similar
                if name and name != match.group(0):
                    return f"{name} ({match.group(0)})"
                return match.group(0)
            except Exception:
                return match.group(0)

        return pattern.sub(replace, text)