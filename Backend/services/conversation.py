from datetime import datetime
import uuid
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class ConversationService:
    """
    Advanced Conversation Service for AIVA
    Manages Earth Voice conversations with environmental context integration
    """
    
    def __init__(self, ai_service=None, env_service=None):
        # Import services to avoid circular imports
        try:
            from .gemini import AIModelService
            from .environment import FreeEnvironmentalAPIs
            
            self.ai_service = ai_service or AIModelService()
            self.env_service = env_service or FreeEnvironmentalAPIs()
            
            # Initialize conversation memory
            self.conversation_history: Dict[str, List[Dict]] = {}
            self.max_history_length = 10  # Keep last 10 exchanges per conversation
            
            print("🗣️ AIVA Conversation Service initialized with Earth Voice TTS")
            
        except ImportError as e:
            logger.error(f"Failed to initialize conversation service: {e}")
            self.ai_service = None
            self.env_service = None
    
    def start_conversation(self, user_message: str, location: Optional[Dict] = None, 
                         include_environmental_context: bool = True, 
                         include_tts: bool = True,
                         conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Start or continue a conversation with Earth
        
        Args:
            user_message: The user's message to Earth
            location: Optional location dict with latitude/longitude
            include_environmental_context: Whether to include environmental data
            include_tts: Whether to generate TTS audio
            conversation_id: Optional conversation ID to continue existing conversation
        """
        
        if not self.ai_service:
            return {
                "success": False,
                "error": "AI service not available",
                "earth_voice": {
                    "text": "I'm unable to speak right now. Please check the backend configuration.",
                    "tts_enabled": False,
                    "audio": None,
                    "timestamp": datetime.now().isoformat()
                }
            }
        
        try:
            # Generate or use provided conversation ID
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            # Get environmental context if requested and location provided
            environmental_context = None
            if include_environmental_context and location:
                environmental_context = self._get_environmental_context(
                    location.get('latitude'), 
                    location.get('longitude')
                )
            
            # Get conversation history for context
            conversation_context = self._get_conversation_context(conversation_id)
            
            # Determine sentiment from user message
            sentiment = self._analyze_message_sentiment(user_message)
            
            # Generate Earth's response with all context
            earth_response = self.ai_service.generate_aiva_response(
                user_message=user_message,
                sentiment=sentiment,
                environmental_context=environmental_context,
                include_tts=include_tts
            )
            
            # Store conversation in memory
            self._store_conversation_exchange(
                conversation_id, 
                user_message, 
                earth_response.get('text', ''), 
                environmental_context
            )
            
            # Prepare Earth Voice response structure
            # Support both single and chunked TTS modes transparently
            tts_payload = earth_response.get('tts') if earth_response.get('earth_voice_enabled') else None
            earth_voice_data = {
                "text": earth_response.get('text', ''),
                "original_text": earth_response.get('original_text') or earth_response.get('text', ''),
                "tts_enabled": earth_response.get('earth_voice_enabled', False),
                "audio": tts_payload,
                "tts_mode": (tts_payload or {}).get('mode', 'none') if tts_payload else 'none',
                "total_chunks": (tts_payload or {}).get('total_chunks'),
                "combined_estimated_duration": (tts_payload or {}).get('combined_estimated_duration'),
                "timestamp": earth_response.get('timestamp', datetime.now().isoformat())
            }
            
            return {
                "success": True,
                "conversation_id": conversation_id,
                "earth_voice": earth_voice_data,
                "environmental_context": environmental_context,
                "user_sentiment": sentiment,
                "conversation_length": len(self.conversation_history.get(conversation_id, [])),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Conversation processing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "earth_voice": {
                    "text": f"I'm experiencing some difficulty right now: {str(e)}",
                    "tts_enabled": False,
                    "audio": None,
                    "timestamp": datetime.now().isoformat()
                }
            }
    
    def get_conversation_history(self, conversation_id: str) -> List[Dict]:
        """Get the conversation history for a specific conversation"""
        return self.conversation_history.get(conversation_id, [])
    
    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear a specific conversation history"""
        if conversation_id in self.conversation_history:
            del self.conversation_history[conversation_id]
            return True
        return False
    
    def get_active_conversations(self) -> List[str]:
        """Get list of active conversation IDs"""
        return list(self.conversation_history.keys())
    
    def _get_environmental_context(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Get comprehensive environmental context for the conversation"""
        try:
            if not self.env_service:
                return {"error": "Environmental service not available"}
            
            # Get real environmental data
            air_quality = self.env_service.get_air_quality(latitude, longitude)
            weather = self.env_service.get_weather_data(latitude, longitude)
            vegetation = self.env_service.get_satellite_vegetation(latitude, longitude)
            
            # Get location name if location service available
            location_name = None
            try:
                from .location import LocationService
                location_service = LocationService()
                location_info = location_service.get_location_name(latitude, longitude)
                location_name = location_info.get('name')
            except:
                pass
            
            return {
                "coordinates": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "location_name": location_name,
                "air_quality": air_quality,
                "weather": weather,
                "vegetation": vegetation,
                "summary": {
                    "aqi": air_quality.get('aqi') if air_quality else None,
                    "temperature": weather.get('temperature') if weather else None,
                    "vegetation_health": vegetation.get('vegetation_health') if vegetation else None
                },
                "data_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting environmental context: {e}")
            return {"error": f"Environmental context unavailable: {str(e)}"}
    
    def _get_conversation_context(self, conversation_id: str) -> Dict[str, Any]:
        """Get conversation context for AI to maintain continuity"""
        history = self.conversation_history.get(conversation_id, [])
        
        if not history:
            return {"new_conversation": True}
        
        # Get recent context (last 3 exchanges)
        recent_history = history[-3:] if len(history) > 3 else history
        
        return {
            "new_conversation": False,
            "total_exchanges": len(history),
            "recent_topics": [exchange.get('topic', 'general') for exchange in recent_history],
            "last_sentiment": history[-1].get('sentiment') if history else 'neutral',
            "conversation_summary": self._summarize_conversation(recent_history)
        }
    
    def _analyze_message_sentiment(self, message: str) -> str:
        """Analyze sentiment of user message"""
        message_lower = message.lower()
        
        # Environmental concern keywords
        if any(word in message_lower for word in ['worried', 'concerned', 'afraid', 'scared', 'pollution', 'destroying', 'crisis', 'emergency']):
            return 'concerned'
        
        # Positive environmental keywords  
        elif any(word in message_lower for word in ['beautiful', 'amazing', 'wonderful', 'love', 'protect', 'conservation', 'green', 'renewable']):
            return 'positive'
        
        # Questioning/curious keywords
        elif any(word in message_lower for word in ['how', 'why', 'what', 'where', 'when', 'can you', 'tell me', '?']):
            return 'curious'
        
        # Action/solution oriented
        elif any(word in message_lower for word in ['help', 'fix', 'solve', 'improve', 'action', 'do', 'change']):
            return 'motivated'
        
        else:
            return 'neutral'
    
    def _store_conversation_exchange(self, conversation_id: str, user_message: str, 
                                   earth_response: str, environmental_context: Dict) -> None:
        """Store a conversation exchange in memory"""
        if conversation_id not in self.conversation_history:
            self.conversation_history[conversation_id] = []
        
        exchange = {
            "timestamp": datetime.now().isoformat(),
            "user_message": user_message,
            "earth_response": earth_response,
            "sentiment": self._analyze_message_sentiment(user_message),
            "topic": self._extract_topic(user_message),
            "environmental_context": environmental_context,
            "exchange_id": len(self.conversation_history[conversation_id]) + 1
        }
        
        self.conversation_history[conversation_id].append(exchange)
        
        # Limit history length
        if len(self.conversation_history[conversation_id]) > self.max_history_length:
            self.conversation_history[conversation_id] = self.conversation_history[conversation_id][-self.max_history_length:]
    
    def _extract_topic(self, message: str) -> str:
        """Extract main topic from user message"""
        message_lower = message.lower()
        
        # Environmental topics
        if any(word in message_lower for word in ['air', 'pollution', 'smog', 'quality']):
            return 'air_quality'
        elif any(word in message_lower for word in ['water', 'ocean', 'river', 'lake']):
            return 'water'
        elif any(word in message_lower for word in ['forest', 'tree', 'vegetation', 'plant']):
            return 'vegetation'
        elif any(word in message_lower for word in ['climate', 'weather', 'temperature', 'warming']):
            return 'climate'
        elif any(word in message_lower for word in ['energy', 'renewable', 'solar', 'wind']):
            return 'energy'
        elif any(word in message_lower for word in ['animal', 'wildlife', 'species', 'biodiversity']):
            return 'wildlife'
        else:
            return 'general'
    
    def _summarize_conversation(self, recent_history: List[Dict]) -> str:
        """Create a brief summary of recent conversation"""
        if not recent_history:
            return "Starting new conversation"
        
        topics = [exchange.get('topic', 'general') for exchange in recent_history]
        sentiments = [exchange.get('sentiment', 'neutral') for exchange in recent_history]
        
        most_common_topic = max(set(topics), key=topics.count)
        most_common_sentiment = max(set(sentiments), key=sentiments.count)
        
        return f"Recent discussion about {most_common_topic} with {most_common_sentiment} sentiment"
    
    def get_conversation_analytics(self) -> Dict[str, Any]:
        """Get analytics about all conversations"""
        total_conversations = len(self.conversation_history)
        total_exchanges = sum(len(history) for history in self.conversation_history.values())
        
        if total_exchanges == 0:
            return {"total_conversations": 0, "total_exchanges": 0}
        
        # Analyze topics and sentiments across all conversations
        all_topics = []
        all_sentiments = []
        
        for history in self.conversation_history.values():
            for exchange in history:
                all_topics.append(exchange.get('topic', 'general'))
                all_sentiments.append(exchange.get('sentiment', 'neutral'))
        
        return {
            "total_conversations": total_conversations,
            "total_exchanges": total_exchanges,
            "average_exchanges_per_conversation": total_exchanges / total_conversations if total_conversations > 0 else 0,
            "most_discussed_topics": {topic: all_topics.count(topic) for topic in set(all_topics)},
            "sentiment_distribution": {sentiment: all_sentiments.count(sentiment) for sentiment in set(all_sentiments)},
            "active_conversations": len([c for c in self.conversation_history.values() if c])
        }