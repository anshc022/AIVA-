"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnalysisSnapshot } from './types';

interface ConversationMessage {
  id: string;
  type: 'user' | 'earth';
  message: string;
  timestamp: string;
  tts?: {
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
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface EarthVoiceConversationProps {
  snapshot?: AnalysisSnapshot;
  onEarthVoiceUpdate?: (earthVoiceData: any) => void;
}

export function EarthVoiceConversation({ snapshot, onEarthVoiceUpdate }: EarthVoiceConversationProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [autoTTS, setAutoTTS] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user location
  useEffect(() => {
    if (includeLocation && !currentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Location access denied or unavailable:', error);
          }
        );
      }
    }
  }, [includeLocation, currentLocation]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const playTTSAudio = useCallback(async (audioData: any) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }

      const audioBytes = atob(audioData.audio_base64);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
      
      // Enhanced logging for detailed responses
      console.log(`🌍 Playing Earth Voice: ${audioData.emotion} emotion, ${audioData.estimated_duration}`);
      if (audioData.detailed_response) {
        console.log(`📝 Detailed Response: ${audioData.text_length} chars, truncated: ${audioData.truncated || false}`);
      }
      if (audioData.processing_note) {
        console.log(`🔧 Processing: ${audioData.processing_note}`);
      }
      
    } catch (error) {
      console.error('Error playing TTS audio:', error);
    }
  }, [currentAudio]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      location: includeLocation ? currentLocation || undefined : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const requestBody = {
        message: userMessage.message,
        latitude: includeLocation ? currentLocation?.latitude : undefined,
        longitude: includeLocation ? currentLocation?.longitude : undefined,
        includeEnvironmentalContext: true,
        includeTTS: autoTTS,
        conversation_id: conversationId
      };

      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update conversation ID if new
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        const earthMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          type: 'earth',
          message: data.earthVoice.text,
          timestamp: data.earthVoice.timestamp,
          tts: data.earthVoice.audio || undefined
        };

        setMessages(prev => [...prev, earthMessage]);

        // Update the parent component with Earth Voice data for 3D visualization
        if (onEarthVoiceUpdate) {
          onEarthVoiceUpdate(data.earthVoice);
        }

        // Auto-play TTS if enabled and available
        if (autoTTS && data.earthVoice.audio && data.earthVoice.tts_enabled) {
          setTimeout(() => {
            playTTSAudio(data.earthVoice.audio);
          }, 500);
        }

      } else {
        throw new Error(data.error || 'Failed to get response from Earth');
      }

    } catch (error) {
      console.error('Conversation error:', error);
      
      const errorMessage: ConversationMessage = {
        id: (Date.now() + 2).toString(),
        type: 'earth',
        message: `I'm having trouble connecting right now: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }
  };

  const replayLastEarthVoice = () => {
    const lastEarthMessage = messages.filter(m => m.type === 'earth' && m.tts).pop();
    if (lastEarthMessage?.tts) {
      playTTSAudio(lastEarthMessage.tts);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-sm border border-slate-700/40 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/40 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-md animate-pulse opacity-30"></div>
            <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🌍</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Conversation with Earth</h3>
            <p className="text-sm text-slate-400">
              {conversationId ? `Active conversation • ${messages.length} messages` : 'Start a new conversation'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Location toggle */}
          <button
            onClick={() => setIncludeLocation(!includeLocation)}
            className={`p-2 rounded-lg transition-all duration-200 text-xs flex items-center gap-1 ${
              includeLocation 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
            title={includeLocation ? 'Location enabled' : 'Location disabled'}
          >
            📍 {includeLocation ? 'Located' : 'No Location'}
          </button>

          {/* TTS toggle */}
          <button
            onClick={() => setAutoTTS(!autoTTS)}
            className={`p-2 rounded-lg transition-all duration-200 text-xs flex items-center gap-1 ${
              autoTTS 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
            title={autoTTS ? 'Auto TTS enabled' : 'Auto TTS disabled'}
          >
            🔊 {autoTTS ? 'Voice On' : 'Voice Off'}
          </button>

          {/* Replay last Earth voice */}
          <button
            onClick={replayLastEarthVoice}
            disabled={!messages.some(m => m.type === 'earth' && m.tts)}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Replay last Earth voice"
          >
            🔄
          </button>

          {/* Clear conversation */}
          <button
            onClick={clearConversation}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            title="Clear conversation"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            <div className="text-4xl mb-4">🌍</div>
            <p className="text-lg mb-2">Welcome to Enhanced Earth Voice Conversation</p>
            <p className="text-sm mb-2">Ask me about the environment, climate, or how I'm feeling today.</p>
            <p className="text-xs text-blue-400 mb-2">✨ Now with detailed responses & enhanced TTS voice</p>
            {autoTTS && (
              <p className="text-xs text-green-400 mb-2">🔊 Voice responses enabled (up to 30 seconds)</p>
            )}
            {includeLocation && currentLocation && (
              <p className="text-xs mt-2 text-green-400">
                📍 Location enabled: {currentLocation.latitude.toFixed(3)}, {currentLocation.longitude.toFixed(3)}
              </p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600/80 text-white'
                  : 'bg-green-900/60 text-green-100 border border-green-700/40'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'earth' && (
                  <span className="text-lg mt-1">🌍</span>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {/* Enhanced TTS indicators */}
                      {message.type === 'earth' && message.tts && (
                        <span className="ml-2">
                          {message.tts.detailed_response && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded ml-1" title="Detailed response with enhanced TTS">
                              📝
                            </span>
                          )}
                          {message.tts.truncated && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded ml-1" title="Response optimized for TTS">
                              ✂️
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                    {message.type === 'earth' && message.tts && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-400/70">
                          {message.tts.estimated_duration} • {message.tts.emotion}
                        </span>
                        <button
                          onClick={() => playTTSAudio(message.tts!)}
                          className="text-xs bg-green-600/40 hover:bg-green-600/60 px-2 py-1 rounded transition-all duration-200 flex items-center gap-1"
                          title={`Play Earth's voice (${message.tts.emotion}, ${message.tts.estimated_duration})`}
                        >
                          🔊 Play
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Processing note for detailed responses */}
                  {message.type === 'earth' && message.tts?.processing_note && (
                    <div className="mt-1 text-xs text-blue-400/70 italic">
                      ℹ️ {message.tts.processing_note}
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <span className="text-lg mt-1">👤</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-green-900/60 text-green-100 border border-green-700/40">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌍</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-sm text-green-300 ml-2">
                      Earth is crafting a detailed response...
                    </span>
                  </div>
                  {autoTTS && (
                    <div className="text-xs text-green-400/70 mt-1">
                      🔊 Generating voice for enhanced response (may take up to 60s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/40 bg-slate-900/40">
        <div className="flex items-end gap-2">
          {/* Voice input button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!recognitionRef.current}
            className={`p-3 rounded-lg transition-all duration-200 ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : recognitionRef.current
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-slate-600/20 text-slate-500 cursor-not-allowed'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            🎤
          </button>

          {/* Text input */}
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Earth about the environment, climate, or anything..."
              className="w-full p-3 bg-slate-800/50 border border-slate-600/40 rounded-lg text-white placeholder-slate-400 resize-none focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
              rows={2}
              disabled={isLoading}
            />
            {isListening && (
              <p className="text-xs text-green-400 mt-1 animate-pulse">🎤 Listening...</p>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            title="Send message to Earth"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}