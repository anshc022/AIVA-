import { NextRequest, NextResponse } from 'next/server';

interface ConversationRequest {
  message: string;
  latitude?: number;
  longitude?: number;
  includeEnvironmentalContext?: boolean;
  includeTTS?: boolean;
}

interface TTSData {
  audio_base64: string;
  audio_format: string;
  voice_id: string;
  emotion: string;
  estimated_duration: string;
  voice_settings: any;
  // Enhanced TTS fields
  detailed_response?: boolean;
  processing_note?: string;
  text_length?: number;
  truncated?: boolean;
}

interface EarthVoiceResponse {
  text: string;
  tts_enabled: boolean;
  audio: TTSData | null;
  timestamp: string;
}

interface ConversationResponse {
  success: boolean;
  earthVoice: EarthVoiceResponse;
  conversationId?: string;
  environmentalContext?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConversationRequest = await request.json();
    
    if (!body.message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message is required' 
        },
        { status: 400 }
      );
    }

    // Prepare request for backend conversation service
    const backendRequest = {
      message: body.message,
      include_tts: body.includeTTS !== false, // Default to true
      location: (body.latitude && body.longitude) ? {
        latitude: body.latitude,
        longitude: body.longitude
      } : null,
      include_environmental_context: body.includeEnvironmentalContext !== false // Default to true
    };

    // Call Python backend conversation service
    const backendResponse = await fetch('http://localhost:5000/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest),
      // Extended timeout for detailed responses with TTS processing
      signal: AbortSignal.timeout(60000) // 60 second timeout for detailed responses
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend responded with status: ${backendResponse.status}, message: ${errorText}`);
    }

    const conversationData = await backendResponse.json();

    // Transform backend response to match our frontend interface
    const earthVoiceResponse: EarthVoiceResponse = {
      text: conversationData.earth_voice?.text || conversationData.response || '',
      tts_enabled: conversationData.earth_voice?.tts_enabled || false,
      audio: conversationData.earth_voice?.audio || null,
      timestamp: conversationData.timestamp || new Date().toISOString()
    };

    const response: ConversationResponse = {
      success: true,
      earthVoice: earthVoiceResponse,
      conversationId: conversationData.conversation_id,
      environmentalContext: conversationData.environmental_context
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Conversation API error:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout - TTS generation may have taken too long',
          earthVoice: {
            text: "I'm experiencing some difficulty speaking right now. Please try again.",
            tts_enabled: false,
            audio: null,
            timestamp: new Date().toISOString()
          }
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
        earthVoice: {
          text: "I'm having trouble connecting to my voice right now. Please check that the backend is running.",
          tts_enabled: false,
          audio: null,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AIVA Conversation API',
    description: 'Connect with Earth through AI-powered conversations',
    features: [
      'Natural language conversations with Gemini AI',
      'Location-aware environmental context',
      'ElevenLabs TTS Earth Voice integration',
      'Real-time environmental data integration'
    ],
    endpoints: {
      POST: {
        description: 'Send a message to Earth and receive an AI response with optional TTS',
        parameters: {
          message: 'string (required) - Your message to Earth',
          latitude: 'number (optional) - Your location latitude',
          longitude: 'number (optional) - Your location longitude', 
          includeEnvironmentalContext: 'boolean (optional) - Include environmental data in conversation',
          includeTTS: 'boolean (optional) - Generate TTS audio for Earth\'s response'
        }
      }
    },
    example: {
      request: {
        message: "How is the environment around me?",
        latitude: 40.7128,
        longitude: -74.0060,
        includeEnvironmentalContext: true,
        includeTTS: true
      },
      response: {
        success: true,
        earthVoice: {
          text: "I feel the pulse of the city around you...",
          tts_enabled: true,
          audio: {
            audio_base64: "...",
            audio_format: "mp3",
            voice_id: "vzov6y10x6nsGNFg883S",
            emotion: "calm"
          },
          timestamp: "2024-01-01T00:00:00Z"
        }
      }
    }
  });
}