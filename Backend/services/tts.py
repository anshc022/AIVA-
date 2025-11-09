import os
import requests
import base64
import tempfile
from typing import Optional, Dict, Any
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class ElevenLabsTTS:
    """
    ElevenLabs Text-to-Speech Service for AIVA Earth Voice
    Converts Earth's responses into natural speech
    """
    
    def __init__(self):
        self.api_key = os.getenv('ELEVENLABS_API_KEY')
        self.base_url = "https://api.elevenlabs.io/v1"
        
        # Indian voice options (using your specified voice ID)
        self.indian_voices = {
            "male_indian": "vzov6y10x6nsGNFg883S",    # Your specified Indian voice
            "female_indian": "vzov6y10x6nsGNFg883S",  # Your specified Indian voice
            "wise_indian": "vzov6y10x6nsGNFg883S",     # Your specified Indian voice
            "gentle_indian": "vzov6y10x6nsGNFg883S"   # Your specified Indian voice
        }
        
        # Default to your specified Indian voice
        self.default_voice_id = "vzov6y10x6nsGNFg883S"
        
        # Indian Earth Voice specific settings (tuned for Indian accent)
        self.earth_voice_settings = {
            "stability": 0.80,      # Higher stability for clear Indian pronunciation
            "similarity_boost": 0.85, # Higher similarity for consistent Indian accent
            "style": 0.60,          # Moderate style for natural Indian speech
            "use_speaker_boost": True
        }
        
        if not self.api_key:
            logger.warning("ElevenLabs API key not found. TTS will be disabled.")
    
    def get_available_voices(self) -> Dict[str, Any]:
        """Get list of available voices from ElevenLabs"""
        if not self.api_key:
            return {"error": "API key not configured"}
        
        try:
            headers = {
                "Accept": "application/json",
                "xi-api-key": self.api_key
            }
            
            response = requests.get(f"{self.base_url}/voices", headers=headers)
            
            if response.status_code == 200:
                voices_data = response.json()
                
                # Format for easy selection
                formatted_voices = {}
                for voice in voices_data.get('voices', []):
                    formatted_voices[voice['voice_id']] = {
                        'name': voice['name'],
                        'gender': voice.get('labels', {}).get('gender', 'unknown'),
                        'age': voice.get('labels', {}).get('age', 'unknown'),
                        'accent': voice.get('labels', {}).get('accent', 'unknown'),
                        'description': voice.get('labels', {}).get('description', ''),
                        'use_case': voice.get('labels', {}).get('use case', ''),
                        'preview_url': voice.get('preview_url', '')
                    }
                
                return {
                    "success": True,
                    "voices": formatted_voices,
                    "recommended_for_earth": {
                        "calm_female": "21m00Tcm4TlvDq8ikWAM",  # Rachel
                        "wise_male": "pNInz6obpgDQGcFmaJgB",    # Adam
                        "gentle_female": "EXAVITQu4vr4xnSDxMaL" # Bella
                    }
                }
            else:
                return {"error": f"Failed to fetch voices: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"Error fetching voices: {e}")
            return {"error": str(e)}
    
    def generate_earth_voice(self, text: str, voice_id: Optional[str] = None, 
                           emotion: str = "calm", duration_limit: int = 30) -> Dict[str, Any]:
        """
        Generate Earth's voice for AIVA responses with support for long detailed responses
        
        Args:
            text: The text to convert to speech
            voice_id: ElevenLabs voice ID (defaults to Earth voice)
            emotion: Emotion style ('calm', 'concerned', 'hopeful', 'urgent')
            duration_limit: Target duration in seconds (increased default to 30 for detailed responses)
        """
        if not self.api_key:
            return {
                "success": False,
                "error": "ElevenLabs API key not configured",
                "suggestion": "Add ELEVENLABS_API_KEY to your .env file"
            }
        
        if not text or len(text.strip()) == 0:
            return {"success": False, "error": "No text provided"}
        
        # Enhanced text processing for detailed responses
        # Increased character limit for detailed Gemini responses (approximately 12 chars per second for natural detailed speech)
        max_chars = duration_limit * 12
        original_text = text
        
        if len(text) > max_chars:
            # Smart truncation with multiple strategies for detailed responses
            truncated = text[:max_chars]
            
            # Try different sentence ending markers in order of preference
            sentence_endings = ['. ', '! ', '? ', '; ', ': ']
            best_cut = -1
            
            for ending in sentence_endings:
                last_ending = truncated.rfind(ending)
                if last_ending > max_chars * 0.6:  # Keep at least 60% and end properly
                    best_cut = last_ending + len(ending) - 1
                    break
            
            if best_cut > 0:
                text = truncated[:best_cut + 1]
            else:
                # Fallback: cut at last complete word
                words = truncated.split()
                if len(words) > 1:
                    words.pop()  # Remove last incomplete word
                    text = ' '.join(words) + "..."
                else:
                    text = truncated + "..."
        
        # Log truncation for detailed responses
        if len(original_text) > len(text):
            logger.info(f"Detailed response truncated from {len(original_text)} to {len(text)} characters for optimal TTS")
        
        # Select voice based on emotion or use default
        if not voice_id:
            voice_id = self._select_voice_for_emotion(emotion)
        
        # Adjust voice settings based on emotion
        voice_settings = self._get_emotion_settings(emotion)
        
        try:
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",  # Best model for natural speech
                "voice_settings": voice_settings
            }
            
            response = requests.post(
                f"{self.base_url}/text-to-speech/{voice_id}",
                json=data,
                headers=headers,
                timeout=60  # Increased timeout for longer detailed responses
            )
            
            if response.status_code == 200:
                # Convert audio to base64 for easy frontend transmission
                audio_base64 = base64.b64encode(response.content).decode('utf-8')
                
                # More accurate duration estimation for detailed speech
                estimated_duration = len(text) / 12  # 12 chars per second for detailed natural speech
                
                return {
                    "success": True,
                    "audio_base64": audio_base64,
                    "audio_format": "mp3",
                    "voice_id": voice_id,
                    "emotion": emotion,
                    "text_length": len(text),
                    "original_text_length": len(original_text),
                    "truncated": len(original_text) > len(text),
                    "estimated_duration": f"{estimated_duration:.1f}s",
                    "target_duration": f"{duration_limit}s",
                    "voice_settings": voice_settings,
                    "processed_text": text,
                    "message": f"🌍 Earth's detailed voice generated successfully ({len(text)} characters, ~{estimated_duration:.1f}s)"
                }
            else:
                error_msg = f"ElevenLabs API error: {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail.get('detail', 'Unknown error')}"
                except:
                    pass
                
                return {"success": False, "error": error_msg}
                
        except requests.exceptions.Timeout:
            return {"success": False, "error": "Request timeout - detailed response processing took too long"}
        except Exception as e:
            logger.error(f"Error generating detailed speech: {e}")
            return {"success": False, "error": str(e)}
    
    def save_audio_file(self, audio_base64: str, filename: Optional[str] = None) -> str:
        """Save base64 audio to file and return file path"""
        try:
            if not filename:
                filename = f"earth_voice_{os.urandom(8).hex()}.mp3"
            
            # Create temp directory if it doesn't exist
            temp_dir = os.path.join(os.getcwd(), "temp_audio")
            os.makedirs(temp_dir, exist_ok=True)
            
            file_path = os.path.join(temp_dir, filename)
            
            # Decode and save audio
            audio_data = base64.b64decode(audio_base64)
            with open(file_path, 'wb') as f:
                f.write(audio_data)
            
            return file_path
            
        except Exception as e:
            logger.error(f"Error saving audio file: {e}")
            raise
    
    def _select_voice_for_emotion(self, emotion: str) -> str:
        """Select appropriate Indian voice based on emotion"""
        indian_emotion_voices = {
            "calm": self.indian_voices["female_indian"],     # Rachel - calm female (Indian style)
            "concerned": self.indian_voices["wise_indian"],  # Antoni - expressive (Indian style)
            "hopeful": self.indian_voices["gentle_indian"],  # Bella - gentle female (Indian style)
            "urgent": self.indian_voices["male_indian"],     # Adam - clear male (Indian style)
            "wise": self.indian_voices["wise_indian"],       # Antoni - wise (Indian style)
            "gentle": self.indian_voices["gentle_indian"]    # Bella - soft female (Indian style)
        }
        
        return indian_emotion_voices.get(emotion, self.default_voice_id)
    
    def _get_emotion_settings(self, emotion: str) -> Dict[str, Any]:
        """Get voice settings optimized for Indian accent with different emotions"""
        base_settings = self.earth_voice_settings.copy()
        
        # Indian accent optimized emotion adjustments
        indian_emotion_adjustments = {
            "calm": {"stability": 0.85, "similarity_boost": 0.80, "style": 0.40},      # Clear, stable Indian speech
            "concerned": {"stability": 0.70, "similarity_boost": 0.85, "style": 0.75}, # Expressive Indian concern
            "hopeful": {"stability": 0.75, "similarity_boost": 0.85, "style": 0.65},   # Optimistic Indian tone
            "urgent": {"stability": 0.60, "similarity_boost": 0.90, "style": 0.80},    # Urgent but clear Indian speech
            "wise": {"stability": 0.90, "similarity_boost": 0.75, "style": 0.45},      # Wise, measured Indian speech
            "gentle": {"stability": 0.85, "similarity_boost": 0.80, "style": 0.35}     # Soft, gentle Indian tone
        }
        
        if emotion in indian_emotion_adjustments:
            base_settings.update(indian_emotion_adjustments[emotion])
        
        return base_settings

class AIVATextToSpeech:
    """
    Main TTS service for AIVA system
    Integrates with Earth Voice AI responses
    """
    
    def __init__(self):
        self.elevenlabs = ElevenLabsTTS()
        self.enabled = bool(self.elevenlabs.api_key)
        
        if self.enabled:
            logger.info("🔊 ElevenLabs TTS initialized for AIVA Earth Voice")
        else:
            logger.warning("⚠️ TTS disabled - ElevenLabs API key not found")
    
    def speak_earth_response(self, earth_response: str, emotion: str = "calm", duration: int = 30) -> Dict[str, Any]:
        """
        Convert Earth's detailed response to speech with appropriate emotion and extended duration
        
        Args:
            earth_response: Earth's detailed text response from Gemini
            emotion: Detected or specified emotion
            duration: Target duration in seconds (increased default to 30 for detailed responses)
        """
        if not self.enabled:
            return {
                "success": False,
                "error": "TTS not available",
                "suggestion": "Configure ELEVENLABS_API_KEY to enable Earth's voice"
            }
        
        # Enhanced text cleaning for detailed responses
        cleaned_text = self._clean_text_for_detailed_speech(earth_response)
        
        # Generate speech with extended duration for detailed responses
        result = self.elevenlabs.generate_earth_voice(cleaned_text, emotion=emotion, duration_limit=duration)
        
        if result.get("success"):
            result["original_text"] = earth_response
            result["cleaned_text"] = cleaned_text
            result["earth_voice_enabled"] = True
            result["detailed_response_support"] = True
            
            # Add information about text processing for detailed responses
            if result.get("truncated"):
                result["processing_note"] = f"Detailed response optimized for TTS: {result['original_text_length']} → {result['text_length']} characters"
            else:
                result["processing_note"] = "Full detailed response converted to speech"
        
        return result

    # -------------------- NEW CHUNKED TTS SUPPORT --------------------
    def speak_chunked_earth_response(self, earth_response: str, emotion: str = "calm",
                                     max_chunk_chars: int = 300) -> Dict[str, Any]:
        """Generate multi-segment speech without losing any of the original text.

        Splits the full response into sentence-aware chunks (<= max_chunk_chars) so that
        per-chunk generation does not trigger truncation inside generate_earth_voice.

        Returns a structure with an array of chunks plus aggregate metadata.
        """
        if not self.enabled:
            return {
                "success": False,
                "error": "TTS not available",
                "suggestion": "Configure ELEVENLABS_API_KEY to enable Earth's voice"
            }

        full_text = earth_response.strip()
        if not full_text:
            return {"success": False, "error": "Empty text"}

        # Sentence splitting keeping delimiters
        import re
        sentences = re.findall(r'[^\n.!?]*[\n.!?]|[^\n.!?]+$', full_text)
        # Merge sentences into chunks respecting max_chunk_chars
        chunks: list[str] = []
        current = ""
        for s in sentences:
            s_clean = s.strip()
            if not s_clean:
                continue
            # If adding this sentence exceeds limit, push current and start new
            if current and len(current) + 1 + len(s_clean) > max_chunk_chars:
                chunks.append(current.strip())
                current = s_clean
            else:
                joiner = " " if current else ""
                current = f"{current}{joiner}{s_clean}".strip()
        if current:
            chunks.append(current.strip())

        # Safety: ensure no chunk exceeds limit; if so, force hard split
        normalized_chunks: list[str] = []
        for c in chunks:
            if len(c) <= max_chunk_chars:
                normalized_chunks.append(c)
            else:
                # Hard wrap by words
                words = c.split()
                acc = []
                buf = ""
                for w in words:
                    if len(buf) + 1 + len(w) > max_chunk_chars:
                        acc.append(buf.strip())
                        buf = w
                    else:
                        buf = f"{buf} {w}".strip()
                if buf:
                    acc.append(buf.strip())
                normalized_chunks.extend(acc)

        # Generate audio per chunk
        audio_chunks = []
        total_duration_est = 0.0
        for idx, chunk_text in enumerate(normalized_chunks, start=1):
            # Duration per chunk: approximate chars/12, clamp 8-30 seconds for stability
            est = max(8.0, min(30.0, len(chunk_text) / 12.0 + 2.0))
            tts_result = self.elevenlabs.generate_earth_voice(chunk_text, emotion=emotion, duration_limit=int(est))
            if not tts_result.get("success"):
                return {"success": False, "error": f"Chunk {idx} TTS failed: {tts_result.get('error')}"}
            # Accumulate duration (use estimated_duration parsed)
            try:
                dur_val = float(tts_result.get("estimated_duration", "0s").replace("s", ""))
            except:
                dur_val = len(chunk_text) / 12.0
            total_duration_est += dur_val
            audio_chunks.append({
                "index": idx,
                "text": chunk_text,
                "text_length": len(chunk_text),
                "audio_base64": tts_result["audio_base64"],
                "audio_format": tts_result["audio_format"],
                "voice_id": tts_result["voice_id"],
                "emotion": tts_result["emotion"],
                "estimated_duration": f"{dur_val:.1f}s",
                "truncated": False,  # By construction we chose chunk sizes under limit
                "processed_text": tts_result.get("processed_text", chunk_text)
            })

        return {
            "success": True,
            "chunks": audio_chunks,
            "total_chunks": len(audio_chunks),
            "original_text_length": len(full_text),
            "combined_estimated_duration": f"{total_duration_est:.1f}s",
            "earth_voice_enabled": True,
            "chunking_strategy": {
                "max_chunk_chars": max_chunk_chars,
                "avg_chunk_chars": int(sum(len(c['text']) for c in audio_chunks) / len(audio_chunks)) if audio_chunks else 0
            }
        }
    
    def get_voice_status(self) -> Dict[str, Any]:
        """Get current TTS service status"""
        return {
            "tts_enabled": self.enabled,
            "service": "ElevenLabs" if self.enabled else "Disabled",
            "api_configured": bool(self.elevenlabs.api_key),
            "earth_voice_ready": self.enabled,
            "available_emotions": ["calm", "concerned", "hopeful", "urgent", "wise", "gentle"]
        }
    
    def _clean_text_for_speech(self, text: str) -> str:
        """Clean text for better Indian English speech synthesis"""
        import re
        
        # Remove emoji and unicode symbols that might cause issues
        text = re.sub(r'[^\w\s\.,!?;:\'"()-]', ' ', text)
        
        # Fix common speech issues for Indian English
        text = text.replace("°C", " degrees Celsius")
        text = text.replace("°F", " degrees Fahrenheit")
        text = text.replace("%", " percent")
        text = text.replace("&", " and ")
        text = text.replace("@", " at ")
        text = text.replace("#", " number ")
        
        # Indian English pronunciation helpers
        text = text.replace("schedule", "shed-yool")  # Indian pronunciation
        text = text.replace("laboratory", "lab-or-a-tree")  # Indian pronunciation
        text = text.replace("vitamin", "vy-ta-min")  # Indian pronunciation
        
        # Add slight pauses for better Indian speech rhythm
        text = re.sub(r'([.!?])\s*', r'\1 ', text)  # Ensure pauses after sentences
        
        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Ensure proper sentence endings for natural Indian speech pauses
        if text and not text.endswith(('.', '!', '?')):
            text += '.'
        
        return text

    def _clean_text_for_detailed_speech(self, text: str) -> str:
        """Enhanced text cleaning specifically for detailed Gemini responses"""
        import re
        
        # First apply standard cleaning
        text = self._clean_text_for_speech(text)
        
        # Enhanced cleaning for detailed environmental responses
        
        # Scientific terms and abbreviations
        replacements = {
            "AQI": "Air Quality Index",
            "PM2.5": "PM 2.5 particles",
            "PM10": "PM 10 particles", 
            "CO2": "carbon dioxide",
            "O3": "ozone",
            "NO2": "nitrogen dioxide",
            "SO2": "sulfur dioxide",
            "UV": "ultraviolet",
            "NDVI": "vegetation index",
            "NDMI": "moisture index",
            "km/h": "kilometers per hour",
            "m/s": "meters per second",
            "μg/m³": "micrograms per cubic meter",
            "ppm": "parts per million",
            "pH": "pH level",
            "dB": "decibels",
            "kWh": "kilowatt hours",
            "GHG": "greenhouse gas"
        }
        
        for abbrev, full_form in replacements.items():
            text = re.sub(r'\b' + re.escape(abbrev) + r'\b', full_form, text, flags=re.IGNORECASE)
        
        # Coordinate format handling for place names
        # Replace coordinate patterns with more speech-friendly versions
        coord_pattern = r'(\d{1,3}\.\d{3,6}),?\s*(-?\d{1,3}\.\d{3,6})'
        text = re.sub(coord_pattern, r'coordinates \1 by \2', text)
        
        # Environmental data formatting
        # Handle number ranges better
        text = re.sub(r'(\d+)-(\d+)', r'\1 to \2', text)
        
        # Handle percentages in detailed analysis
        text = re.sub(r'(\d+)%', r'\1 percent', text)
        
        # Add natural pauses for complex sentences in detailed responses
        # Add slight pause after environmental terms
        env_terms = ['vegetation', 'ecosystem', 'biodiversity', 'sustainability', 'environmental', 'atmosphere']
        for term in env_terms:
            text = re.sub(f'({term})', r'\1,', text, flags=re.IGNORECASE)
        
        # Improve sentence flow for detailed responses
        # Add pauses after introductory phrases
        text = re.sub(r'(However|Additionally|Furthermore|Moreover|Nevertheless|Meanwhile),?\s*', r'\1, ', text)
        
        # Break up very long sentences (common in detailed responses)
        # Add pauses before 'and' in long sentences
        text = re.sub(r'(\w+),?\s+and\s+(\w+)', r'\1, and \2', text)
        
        # Ensure proper punctuation for speech rhythm
        text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', text)  # Ensure space after sentence endings
        
        # Clean up any double punctuation introduced
        text = re.sub(r'[,]{2,}', ',', text)
        text = re.sub(r'[.]{2,}', '.', text)
        
        # Final cleanup
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

# Test function
def test_elevenlabs_tts():
    """Test ElevenLabs TTS functionality"""
    print("🔊 Testing ElevenLabs TTS for AIVA Earth Voice...")
    
    tts = AIVATextToSpeech()
    
    # Test voice status
    status = tts.get_voice_status()
    print(f"TTS Status: {status}")
    
    if status["tts_enabled"]:
        # Test Earth voice generation
        earth_message = "Hello, I am Earth speaking through AIVA. I feel the gentle winds and the warmth of the sun. Let us work together to protect our beautiful planet."
        
        print(f"\n🌍 Generating Earth's voice for: '{earth_message[:50]}...'")
        
        result = tts.speak_earth_response(earth_message, emotion="calm")
        
        if result.get("success"):
            print("✅ Earth's voice generated successfully!")
            print(f"📊 Audio details: {result['audio_format']}, {result['text_length']} characters")
            print(f"🎭 Voice ID: {result['voice_id']}, Emotion: {result['emotion']}")
            
            # Save audio file for testing
            if result.get("audio_base64"):
                try:
                    file_path = tts.elevenlabs.save_audio_file(result["audio_base64"], "test_earth_voice.mp3")
                    print(f"💾 Audio saved to: {file_path}")
                except Exception as e:
                    print(f"❌ Error saving audio: {e}")
        else:
            print(f"❌ Error generating Earth's voice: {result.get('error')}")
    else:
        print("⚠️ TTS is disabled. Add ELEVENLABS_API_KEY to .env file to enable.")
        print("🔗 Get your API key from: https://elevenlabs.io/")

if __name__ == "__main__":
    test_elevenlabs_tts()
