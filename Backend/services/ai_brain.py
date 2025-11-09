from .vision import CNNEnvironmentalAI
from .environment import FreeEnvironmentalAPIs
import numpy as np
from datetime import datetime

class EnhancedHybridEnvironmentalAI:
    """
    Enhanced Hybrid Environmental AI System
    Architecture: Real APIs → Traditional AI + CNN → Fusion → Gemini Integration
    """
    
    def __init__(self):
        # Initialize both AI systems
        self.cnn_ai = CNNEnvironmentalAI()
        self.env_api = FreeEnvironmentalAPIs()
        
        print("🚀 Enhanced Hybrid Environmental AI Initialized:")
        print("   📊 Traditional Environmental AI: Active")
        print("   🧠 CNN Satellite Analysis: Active")
        print("   🔄 Fusion Intelligence: Active")
    
    def get_enhanced_comprehensive_analysis(self, lat, lon, satellite_image_url=None):
        """
        Get comprehensive analysis combining Traditional AI + CNN + Real APIs
        """
        # 1. Get traditional environmental analysis
        traditional_analysis = self._get_traditional_environmental_data(lat, lon)
        
        # 2. Get CNN satellite image analysis
        cnn_analysis = self.cnn_ai.analyze_satellite_image(satellite_image_url, lat, lon)
        
        # 3. Fuse both analyses
        fused_analysis = self._fuse_traditional_and_cnn_analysis(
            traditional_analysis, 
            cnn_analysis, 
            lat, 
            lon
        )
        
        return fused_analysis
    
    def _get_traditional_environmental_data(self, lat, lon):
        """Get traditional environmental data"""
        air_quality = self.env_api.get_air_quality(lat, lon)
        weather = self.env_api.get_weather_data(lat, lon)
        vegetation = self.env_api.get_satellite_vegetation(lat, lon)
        water_quality = self.env_api.get_water_quality(lat, lon)
        uv_data = self.env_api.get_uv_index(lat, lon)
        
        # Calculate environmental score with None checks
        aqi = air_quality.get('aqi', 50) if air_quality else None
        temp = weather.get('temperature', 20) if weather else None
        veg_health = vegetation.get('vegetation_health', 50) if vegetation else None
        
        # Only calculate score if we have real data
        if aqi is not None and temp is not None and veg_health is not None:
            env_score = (100 - max(0, aqi - 50)) * 0.3 + veg_health * 0.5 + max(0, 50 - abs(temp - 22)) * 0.2
        else:
            env_score = None
        
        return {
            'air_quality': air_quality,
            'weather': weather,
            'vegetation': vegetation,
            'water_quality': water_quality,
            'uv_data': uv_data,
            'environmental_score': env_score,
            'coordinates': {'latitude': lat, 'longitude': lon},
            'timestamp': datetime.now().isoformat()
        }
    
    def _fuse_traditional_and_cnn_analysis(self, traditional_data, cnn_data, lat, lon):
        """
        Intelligent fusion of Traditional AI and CNN analysis
        """
        # Combine vegetation analysis
        fused_vegetation = self._fuse_vegetation_analysis(
            traditional_data['vegetation'],
            cnn_data['vegetation_analysis']
        )
        
        # Enhanced environmental score
        enhanced_score = self._calculate_enhanced_environmental_score(
            traditional_data['environmental_score'],
            cnn_data['environmental_score']
        )
        
        # Combined risk assessment
        combined_risks = self._combine_risk_assessments(
            traditional_data,
            cnn_data['environmental_risks']
        )
        
        # Fusion confidence metrics
        fusion_confidence = self._calculate_fusion_confidence(traditional_data, cnn_data)
        
        # Enhanced conservation recommendations
        enhanced_conservation = self._enhance_conservation_recommendations(
            cnn_data['conservation_priorities']
        )
        
        return {
            'enhanced_analysis_type': 'traditional_ai_plus_cnn_fusion',
            'location': {'latitude': lat, 'longitude': lon},
            
            # Fused core analysis
            'fused_vegetation_analysis': fused_vegetation,
            'enhanced_environmental_score': enhanced_score,
            'combined_risk_assessment': combined_risks,
            'enhanced_conservation_priorities': enhanced_conservation,
            
            # Individual system outputs
            'traditional_ai_analysis': traditional_data,
            'cnn_analysis': cnn_data,
            
            # Fusion metrics
            'fusion_confidence': fusion_confidence,
            'data_integration_flow': {
                'step_1': 'Real Environmental APIs (OpenAQ, Open-Meteo)',
                'step_2': 'Traditional Environmental AI Analysis',
                'step_3': 'CNN Satellite Image Analysis',
                'step_4': 'Intelligent Fusion Algorithm',
                'step_5': 'Enhanced Hybrid Intelligence Output',
                'result': 'Multi-Modal Environmental Intelligence'
            },
            
            'timestamp': datetime.now().isoformat()
        }
    
    def _fuse_vegetation_analysis(self, traditional_veg, cnn_veg):
        """
        Intelligently fuse vegetation analysis from both systems
        """
        # Get values from both systems
        traditional_health = traditional_veg.get('vegetation_health', 50)
        cnn_health = cnn_veg.get('cnn_health_score', 50)
        cnn_ndvi = cnn_veg.get('cnn_predicted_ndvi', 0.5)
        
        # Intelligent weighted fusion (CNN gets higher weight for visual analysis)
        cnn_weight = 0.7  # CNN is better at visual analysis
        traditional_weight = 0.3  # Traditional AI is better at environmental context
        
        fused_ndvi = cnn_ndvi  # Use CNN NDVI
        fused_health = (cnn_health * cnn_weight) + (traditional_health * traditional_weight)
        
        # Determine consensus status
        traditional_status = 'good' if traditional_health > 60 else 'moderate' if traditional_health > 30 else 'poor'
        cnn_status = cnn_veg.get('vegetation_status', 'moderate')
        
        # Consensus or weighted decision
        if traditional_status == cnn_status:
            consensus_status = traditional_status
            confidence = 'high'
        else:
            # Use CNN status with medium confidence
            consensus_status = cnn_status
            confidence = 'medium'
        
        return {
            'fused_ndvi': fused_ndvi,
            'fused_health_score': fused_health,
            'consensus_status': consensus_status,
            'fusion_confidence': confidence,
            'traditional_ai_input': {
                'health': traditional_health,
                'status': traditional_status,
                'source': 'environmental_modeling'
            },
            'cnn_ai_input': {
                'ndvi': cnn_ndvi,
                'health': cnn_health,
                'status': cnn_status,
                'biomass': cnn_veg.get('cnn_biomass_estimate', 0),
                'source': 'cnn_satellite_analysis'
            },
            'fusion_method': 'weighted_consensus_algorithm',
            'fusion_weights': {
                'cnn_weight': cnn_weight,
                'traditional_weight': traditional_weight,
                'rationale': 'CNN excels at visual pattern recognition, Traditional AI at environmental context'
            }
        }
    
    def _calculate_enhanced_environmental_score(self, traditional_score, cnn_score):
        """
        Calculate enhanced environmental score combining both AI systems
        """
        # Weighted combination
        enhanced_score = (cnn_score * 0.6) + (traditional_score * 0.4)
        
        # Confidence based on agreement
        score_difference = abs(traditional_score - cnn_score)
        if score_difference < 10:
            confidence = 'high'
        elif score_difference < 20:
            confidence = 'medium'
        else:
            confidence = 'low_agreement'
        
        return {
            'enhanced_score': enhanced_score,
            'traditional_ai_score': traditional_score,
            'cnn_ai_score': cnn_score,
            'score_agreement': confidence,
            'score_difference': score_difference,
            'fusion_method': 'weighted_ensemble'
        }
    
    def _combine_risk_assessments(self, traditional_data, cnn_risks):
        """
        Combine risk assessments from both AI systems
        """
        # Traditional risks based on data
        traditional_risks = []
        aqi = traditional_data['air_quality'].get('aqi', 50)
        temp = traditional_data['weather'].get('temperature', 20)
        veg_health = traditional_data['vegetation'].get('vegetation_health', 50)
        
        if aqi > 100:
            traditional_risks.append({
                'type': 'air_pollution',
                'severity': 'high' if aqi > 150 else 'moderate',
                'detection_method': 'traditional_environmental_ai'
            })
        
        if temp > 35 or temp < -10:
            traditional_risks.append({
                'type': 'temperature_stress',
                'severity': 'high' if temp > 40 or temp < -20 else 'moderate',
                'detection_method': 'traditional_environmental_ai'
            })
        
        if veg_health < 30:
            traditional_risks.append({
                'type': 'vegetation_decline',
                'severity': 'high' if veg_health < 15 else 'moderate',
                'detection_method': 'traditional_environmental_ai'
            })
        
        # Combine all risks
        all_risks = traditional_risks + cnn_risks.get('detected_risks', [])
        
        # Calculate combined risk level
        risk_count = len(all_risks)
        combined_level = 'high' if risk_count > 2 else 'moderate' if risk_count > 0 else 'low'
        
        return {
            'all_detected_risks': all_risks,
            'traditional_ai_risks': traditional_risks,
            'cnn_ai_risks': cnn_risks.get('detected_risks', []),
            'combined_risk_level': combined_level,
            'total_risks_detected': risk_count,
            'consensus_risks': []  # Simplified for now
        }
    
    def _enhance_conservation_recommendations(self, cnn_recs):
        """
        Enhance conservation recommendations
        """
        enhanced_recommendations = []
        
        # Add CNN-specific recommendations
        for rec in cnn_recs:
            enhanced_rec = rec.copy()
            enhanced_rec['source'] = 'cnn_satellite_analysis'
            enhanced_rec['enhancement'] = 'visual_pattern_based'
            enhanced_recommendations.append(enhanced_rec)
        
        # Add some general recommendations
        enhanced_recommendations.extend([
            {
                'priority': 'medium',
                'action': 'Implement environmental monitoring system',
                'source': 'hybrid_intelligence',
                'enhancement': 'multi_modal_analysis'
            },
            {
                'priority': 'low',
                'action': 'Establish community environmental awareness program',
                'source': 'hybrid_intelligence',
                'enhancement': 'stakeholder_engagement'
            }
        ])
        
        return {
            'enhanced_recommendations': enhanced_recommendations[:5],  # Top 5
            'total_recommendations': len(enhanced_recommendations),
            'fusion_approach': 'multi_modal_conservation_strategy'
        }
    
    def _calculate_fusion_confidence(self, traditional_data, cnn_data):
        """
        Calculate confidence metrics for the fusion process
        """
        # Agreement between systems
        traditional_score = traditional_data['environmental_score']
        cnn_score = cnn_data['environmental_score']
        score_agreement = 100 - abs(traditional_score - cnn_score)
        score_agreement = max(0, min(100, score_agreement))

        cnn_confidence = cnn_data.get('cnn_confidence') or {}
        if isinstance(cnn_confidence, dict) and cnn_confidence:
            cnn_confidence_summary = ", ".join(
                f"{key.replace('_', ' ')}: {value}" for key, value in cnn_confidence.items()
            )
        else:
            cnn_confidence_summary = 'unavailable'
            cnn_confidence = {}

        return {
            'overall_fusion_confidence': 'high' if score_agreement > 80 else 'medium' if score_agreement > 60 else 'low',
            'score_agreement_percentage': score_agreement,
            'traditional_ai_data_quality': 'real_apis',
            'cnn_analysis_confidence': {
                'summary': cnn_confidence_summary,
                'by_model': cnn_confidence
            },
            'fusion_algorithm_reliability': 'high',
            'multi_modal_validation': 'enabled'
        }
    
    def get_ai_architecture_summary(self):
        """Get summary of the enhanced AI architecture"""
        return {
            'architecture_type': 'Enhanced Hybrid Environmental AI',
            'components': {
                'traditional_environmental_ai': {
                    'capabilities': ['Environmental data integration', 'NDVI/NDMI modeling', 'Ecosystem health analysis'],
                    'data_sources': ['OpenAQ', 'Open-Meteo', 'NASA MODIS'],
                    'analysis_type': 'Environmental context and numerical modeling'
                },
                'cnn_satellite_ai': {
                    'capabilities': ['Visual pattern recognition', 'Satellite image analysis', 'Biomass estimation'],
                    'models': list(self.cnn_ai.models.keys()),
                    'analysis_type': 'Computer vision and image processing'
                },
                'fusion_intelligence': {
                    'capabilities': ['Multi-modal data fusion', 'Consensus analysis', 'Enhanced predictions'],
                    'fusion_methods': ['Weighted ensemble', 'Consensus algorithms', 'Intelligent combination'],
                    'analysis_type': 'Integrated environmental intelligence'
                }
            },
            'data_flow': 'Real APIs → Traditional AI + CNN → Fusion → Enhanced Intelligence',
            'advantages': [
                'Multi-modal environmental analysis',
                'Visual and numerical data integration',
                'Higher accuracy through consensus',
                'Comprehensive risk assessment',
                'Enhanced conservation recommendations'
            ]
        }