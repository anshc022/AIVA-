#!/usr/bin/env python3

from services.tts import ElevenLabsTTS

def check_indian_voices():
    tts = ElevenLabsTTS()
    voices = tts.get_available_voices()
    
    if voices.get("success"):
        print("🎤 Available ElevenLabs Voices:")
        print("=" * 50)
        
        indian_voices = []
        all_voices = voices.get('voices', {})
        
        for voice_id, info in all_voices.items():
            accent = info.get('accent', '').lower()
            name = info.get('name', '')
            gender = info.get('gender', '')
            
            print(f"🎭 {name} ({gender})")
            print(f"   ID: {voice_id}")
            print(f"   Accent: {accent}")
            print(f"   Description: {info.get('description', '')}")
            print()
            
            # Look for Indian/South Asian voices
            if 'indian' in accent or 'south asian' in accent or 'hindi' in accent.lower():
                indian_voices.append((voice_id, name, gender))
        
        if indian_voices:
            print("🇮🇳 Found Indian Voices:")
            for voice_id, name, gender in indian_voices:
                print(f"   ✅ {name} ({gender}) - ID: {voice_id}")
        else:
            print("🔍 No specific Indian accent voices found in default list.")
            print("💡 We can use any voice and configure it for Indian speech patterns.")
            
            # Recommend good voices for Indian accent
            recommended = {
                "pNInz6obpgDQGcFmaJgB": "Adam (male, clear)",
                "21m00Tcm4TlvDq8ikWAM": "Rachel (female, calm)", 
                "ErXwobaYiN019PkySvjV": "Antoni (male, well-rounded)",
                "EXAVITQu4vr4xnSDxMaL": "Bella (female, soft)"
            }
            
            print("\n🌟 Recommended voices that work well for Indian English:")
            for voice_id, desc in recommended.items():
                if voice_id in all_voices:
                    print(f"   🎤 {desc} - ID: {voice_id}")
    
    else:
        print(f"❌ Error: {voices.get('error')}")

if __name__ == "__main__":
    check_indian_voices()