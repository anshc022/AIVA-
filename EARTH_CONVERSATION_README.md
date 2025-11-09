# AIVA Earth Voice Conversation System

## Overview

The AIVA Earth Voice Conversation system allows users to have natural conversations with Earth using AI-powered responses that include:

- **Natural Language Processing**: Powered by Google Gemini 2.5-flash
- **Environmental Context**: Real-time environmental data integration
- **Text-to-Speech**: ElevenLabs Indian voice for Earth's responses
- **3D Visualization**: Dynamic Earth visualization that responds to conversation
- **Location Awareness**: Incorporates user location for contextual responses

## System Architecture

```
Frontend (Next.js) → API Routes → Backend (Flask) → Services
                                                  ├── Gemini AI (Conversation)
                                                  ├── ElevenLabs TTS (Voice)
                                                  ├── Environmental APIs (Context)
                                                  └── Location Service (Places)
```

## Key Components

### 1. Backend Services

- **`conversation.py`**: Main conversation management
- **`gemini.py`**: AI response generation with TTS integration
- **`tts.py`**: ElevenLabs voice synthesis
- **`location.py`**: Coordinate to place name conversion
- **`environment.py`**: Real environmental data fetching

### 2. Frontend Components

- **`EarthVoiceConversation.tsx`**: Chat interface with voice input/output
- **`EarthVoice3D.tsx`**: Dynamic 3D Earth visualization
- **API Routes**: `/api/conversation` for backend communication

### 3. API Endpoints

#### POST `/api/conversation`
Sends a message to Earth and receives AI response with optional TTS.

**Request:**
```json
{
  "message": "How is the environment around me?",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "includeEnvironmentalContext": true,
  "includeTTS": true
}
```

**Response:**
```json
{
  "success": true,
  "earthVoice": {
    "text": "I feel the pulse of the city around you...",
    "tts_enabled": true,
    "audio": {
      "audio_base64": "...",
      "audio_format": "mp3",
      "voice_id": "vzov6y10x6nsGNFg883S",
      "emotion": "calm",
      "estimated_duration": "8.2s"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "conversationId": "uuid",
  "environmentalContext": { ... }
}
```

## Features

### 1. Conversation Interface
- **Text Input**: Type messages to Earth
- **Voice Input**: Use speech recognition to speak to Earth
- **Message History**: Full conversation tracking
- **Auto-TTS**: Automatic voice playback of Earth's responses

### 2. Earth Voice 3D Visualization
- **Dynamic Animation**: Earth changes based on conversation content
- **Emotion-Based Effects**: Visual effects match Earth's emotional state
- **Speaking Indicators**: Visual cues when Earth is speaking
- **Fullscreen Mode**: Immersive 3D experience

### 3. Environmental Integration
- **Location Context**: Includes real environmental data for user's location
- **Air Quality**: Current AQI and pollution levels
- **Weather**: Temperature, humidity, conditions
- **Vegetation**: Satellite-derived vegetation health

### 4. Voice Features
- **ElevenLabs TTS**: High-quality Indian English voice
- **Emotion Mapping**: Voice tone matches conversation sentiment
- **Audio Playback**: Browser-based audio with fallback support
- **Voice Controls**: Play, pause, replay Earth's responses

## Usage

### 1. Start the Backend
```bash
cd Backend
python app.py
```

### 2. Start the Frontend
```bash
cd nextjs-typescript-app
npm run dev
```

### 3. Open Dashboard
- Navigate to `http://localhost:3000/dashboard`
- Click on "💬 Earth Conversation" tab
- Start chatting with Earth!

## Configuration

### Environment Variables (.env)

```bash
# Required for AI responses
GEMINI_API_KEY=your_gemini_api_key

# Required for Earth Voice TTS
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Optional for enhanced environmental data
OPENAQ_API_KEY=your_openaq_key
```

### Voice Configuration

The system uses voice ID `vzov6y10x6nsGNFg883S` (Indian English) by default. You can customize this in `services/tts.py`.

## Sample Conversations

### Environmental Questions
- "How is the air quality where I am?"
- "Tell me about the vegetation health in my area"
- "What's the environmental situation around me?"

### General Earth Conversations
- "How are you feeling today, Earth?"
- "What should I do to help the environment?"
- "I'm worried about climate change"

### Location-Specific
- "What's special about this place environmentally?"
- "How healthy is the ecosystem here?"
- "What environmental challenges does this area face?"

## Troubleshooting

### No Voice Response
1. Check ELEVENLABS_API_KEY is set
2. Verify backend is running on port 5000
3. Check browser console for audio errors

### Backend Connection Issues
1. Ensure Flask server is running: `python app.py`
2. Check port 5000 is not blocked
3. Verify CORS is enabled

### Environment Data Missing
1. Check internet connection for API calls
2. Verify location permissions in browser
3. Check backend logs for API errors

## API Integration

The conversation system integrates with:
- **Google Gemini 2.5-flash**: For AI responses
- **ElevenLabs**: For text-to-speech
- **OpenStreetMap Nominatim**: For location names
- **OpenAQ**: For air quality data
- **Open-Meteo**: For weather data

All APIs used are either free or use free tiers.