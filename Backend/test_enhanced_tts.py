#!/usr/bin/env python3
"""
Test script for Enhanced ElevenLabs TTS with Detailed Gemini Responses
Tests the full integration of detailed environmental analysis with TTS
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.tts import AIVATextToSpeech
from services.gemini import AIModelService
import json

def test_detailed_response_tts():
    """Test TTS with detailed Gemini responses"""
    print("🧠 Testing Enhanced TTS with Detailed Gemini Responses")
    print("=" * 60)
    
    # Initialize services
    tts = AIVATextToSpeech()
    gemini = AIModelService()
    
    # Check TTS status
    status = tts.get_voice_status()
    print(f"📊 TTS Status: {json.dumps(status, indent=2)}")
    
    if not status["tts_enabled"]:
        print("⚠️ TTS is disabled. Please configure ELEVENLABS_API_KEY")
        return
    
    # Test detailed environmental response
    detailed_response = """I feel the weight of 65 AQI pressing against my atmosphere here in Central Park, New York. While my vegetation breathes with 85% health—those magnificent oaks and maples working tirelessly to clean the air—the urban pollution creates a complex environmental tapestry. The 22°C temperature speaks of moderate stress on my urban ecosystem, but there's hope in the green corridors that pulse with life. I sense the potential for improvement through targeted air quality management, enhanced urban forestry programs, and community-based environmental monitoring. The resilience of this place amazes me—where concrete meets canopy, where millions of footsteps walk among my ancient trees, where every choice towards sustainability ripples outward like rings in the reservoir. Together, we can nurture this delicate balance between human progress and natural harmony."""
    
    print(f"\n🌍 Testing detailed response ({len(detailed_response)} characters):")
    print(f"Preview: '{detailed_response[:100]}...'")
    
    # Test different emotions with detailed response
    emotions = ["calm", "concerned", "hopeful", "wise"]
    
    for emotion in emotions:
        print(f"\n🎭 Testing emotion: {emotion}")
        print("-" * 30)
        
        result = tts.speak_earth_response(detailed_response, emotion=emotion, duration=30)
        
        if result.get("success"):
            print("✅ TTS Generation Successful!")
            print(f"📝 Original length: {result.get('original_text', '')[:50]}... ({len(result.get('original_text', ''))} chars)")
            print(f"🔧 Processed length: {result['text_length']} characters")
            print(f"⏱️ Estimated duration: {result['estimated_duration']}")
            print(f"🎵 Voice ID: {result['voice_id']}")
            print(f"😊 Emotion: {result['emotion']}")
            print(f"✂️ Truncated: {result.get('truncated', False)}")
            
            if result.get('processing_note'):
                print(f"📋 Processing: {result['processing_note']}")
            
            # Save audio file for testing
            if result.get("audio_base64"):
                try:
                    filename = f"test_detailed_{emotion}.mp3"
                    file_path = tts.elevenlabs.save_audio_file(result["audio_base64"], filename)
                    print(f"💾 Audio saved: {file_path}")
                except Exception as e:
                    print(f"❌ Save error: {e}")
        else:
            print(f"❌ TTS Failed: {result.get('error')}")
    
    # Test Gemini integration with TTS
    print(f"\n🧠 Testing Gemini + Enhanced TTS Integration")
    print("-" * 50)
    
    if gemini.model:
        environmental_context = {
            "location": "Central Park, New York",
            "coordinates": "40.7829, -73.9654",
            "aqi": 65,
            "temperature": 22,
            "vegetation_health": 85,
            "humidity": 60,
            "wind_speed": 12,
            "uv_index": 6,
            "water_quality": 78,
            "soil_health": 70,
            "biodiversity": 75
        }
        
        gemini_result = gemini.generate_aiva_response(
            "Please provide a detailed environmental analysis of this location",
            "environmental_analysis",
            environmental_context,
            include_tts=True
        )
        
        print(f"📝 Gemini Response: {gemini_result.get('text', '')[:100]}...")
        print(f"🔊 TTS Enabled: {gemini_result.get('earth_voice_enabled', False)}")
        
        if gemini_result.get('tts'):
            tts_info = gemini_result['tts']
            print(f"🎵 TTS Duration: {tts_info.get('estimated_duration', 'Unknown')}")
            print(f"📊 TTS Length: {tts_info.get('text_length', 'Unknown')} chars")
            print(f"🎭 TTS Emotion: {tts_info.get('emotion', 'Unknown')}")
            print(f"✂️ TTS Truncated: {tts_info.get('truncated', False)}")
            
            if tts_info.get('audio_base64'):
                try:
                    filename = "test_gemini_detailed_tts.mp3"
                    file_path = tts.elevenlabs.save_audio_file(tts_info["audio_base64"], filename)
                    print(f"💾 Gemini TTS saved: {file_path}")
                except Exception as e:
                    print(f"❌ Gemini TTS save error: {e}")
        
        if gemini_result.get('tts_note'):
            print(f"📋 TTS Note: {gemini_result['tts_note']}")
            
    else:
        print("⚠️ Gemini not configured - skipping integration test")
    
    print(f"\n🎉 Enhanced TTS Testing Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_detailed_response_tts()