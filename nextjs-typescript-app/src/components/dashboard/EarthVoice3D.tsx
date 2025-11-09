"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Geometry, Base, Subtraction} from '@react-three/csg'
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Bloom, N8AO, SMAA, EffectComposer } from '@react-three/postprocessing'
import { useRef, useState, useEffect } from "react";
import { Mesh } from "three";
import { KernelSize } from "postprocessing";
import { AnalysisSnapshot } from './types';

function EarthShape({ isSpeaking, earthVoiceText }: { isSpeaking: boolean; earthVoiceText: string }) {
  const meshRef = useRef<Mesh>(null);
  const innerSphereRef = useRef<Mesh>(null);

  // Analyze text content for dynamic animations
  const getAnimationFromText = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Detect emotions and content
    const isCalm = lowerText.includes('gentle') || lowerText.includes('peaceful') || lowerText.includes('serene') || lowerText.includes('calm');
    const isUrgent = lowerText.includes('urgent') || lowerText.includes('danger') || lowerText.includes('warning') || lowerText.includes('crisis');
    const isSad = lowerText.includes('sorrow') || lowerText.includes('pain') || lowerText.includes('loss') || lowerText.includes('dying');
    const isHappy = lowerText.includes('vibrant') || lowerText.includes('flourish') || lowerText.includes('thrive') || lowerText.includes('renewal');
    const isWater = lowerText.includes('ocean') || lowerText.includes('water') || lowerText.includes('rain') || lowerText.includes('river');
    const isForest = lowerText.includes('forest') || lowerText.includes('tree') || lowerText.includes('leaves') || lowerText.includes('woods');
    const isUrban = lowerText.includes('city') || lowerText.includes('urban') || lowerText.includes('building') || lowerText.includes('concrete');
    
    return {
      speed: isUrgent ? 0.4 : isCalm ? 0.05 : 0.25,
      intensity: isUrgent ? 0.15 : isCalm ? 0.02 : 0.08,
      pulseSpeed: isUrgent ? 15 : isCalm ? 3 : 8,
      coreSpeed: isUrgent ? 20 : isCalm ? 5 : 12,
      color: isWater ? "#0ea5e9" : isForest ? "#16a34a" : isUrban ? "#64748b" : "#22c55e",
      emissive: isWater ? "#0284c7" : isForest ? "#15803d" : isUrban ? "#475569" : "#16a34a",
      emissiveIntensity: isSad ? 0.3 : isHappy ? 2.0 : isUrgent ? 1.8 : 1.2
    };
  };

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isSpeaking) {
        const animation = getAnimationFromText(earthVoiceText);
        
        // Dynamic rotation based on content
        meshRef.current.rotation.x += delta * animation.speed;
        meshRef.current.rotation.y += delta * (animation.speed * 1.5);
        meshRef.current.rotation.z += delta * (animation.speed * 0.5);
        
        // Dynamic pulsing based on text emotion
        const speakingPulse = Math.sin(state.clock.elapsedTime * animation.pulseSpeed) * animation.intensity + 1;
        const breathe = Math.sin(state.clock.elapsedTime * 1.2) * 0.08 + 1;
        const combinedScale = speakingPulse * breathe;
        meshRef.current.scale.set(combinedScale, combinedScale, combinedScale);
      } else {
        // Normal rotation when not speaking
        meshRef.current.rotation.x += delta * 0.1;
        meshRef.current.rotation.y += delta * 0.15;
        meshRef.current.rotation.z += delta * 0.05;
        
        // Normal breathing effect
        const breathe = Math.sin(state.clock.elapsedTime * 0.6) * 0.03 + 1;
        meshRef.current.scale.set(breathe, breathe, breathe);
      }
    }
    
    if (innerSphereRef.current) {
      if (isSpeaking) {
        const animation = getAnimationFromText(earthVoiceText);
        
        // Dynamic core rotation
        innerSphereRef.current.rotation.x += delta * (animation.speed * 1.2);
        innerSphereRef.current.rotation.y += delta * (animation.speed * 1.67);
        innerSphereRef.current.rotation.z += delta * (animation.speed * 0.67);
        
        // Dynamic core pulsing based on text intensity
        const vocalPulse = Math.sin(state.clock.elapsedTime * animation.coreSpeed) * 0.1 + 1;
        const heartbeat = Math.sin(state.clock.elapsedTime * 2.5) * 0.15 + 1;
        const combinedPulse = vocalPulse * heartbeat;
        innerSphereRef.current.scale.set(combinedPulse, combinedPulse, combinedPulse);
      } else {
        // Normal core animation
        innerSphereRef.current.rotation.x += delta * 0.12;
        innerSphereRef.current.rotation.y += delta * 0.2;
        innerSphereRef.current.rotation.z += delta * 0.08;
        
        const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.08 + 1;
        innerSphereRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const animation = isSpeaking ? getAnimationFromText(earthVoiceText) : { color: "#10b981", emissive: "#16a34a", emissiveIntensity: 0.8 };

  return (
    <>
      <mesh ref={meshRef}>
        <meshPhysicalMaterial 
          roughness={isSpeaking ? 0.1 : 0.2}
          metalness={isSpeaking ? 0.8 : 0.6}
          clearcoat={1}
          clearcoatRoughness={isSpeaking ? 0.1 : 0.2}
          color={isSpeaking ? "#064e3b" : "#0f172a"}
        />

        <Geometry>
          <Base>
            <primitive
              object={new RoundedBoxGeometry(1.2, 1.2, 1.2, 6, 0.15)}
            />
          </Base>

          <Subtraction>
            <sphereGeometry args={[0.8, 32, 32]} />
          </Subtraction>
        </Geometry>
      </mesh>
      
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshPhysicalMaterial 
          color={animation.color}
          emissive={animation.emissive}
          emissiveIntensity={animation.emissiveIntensity}
          opacity={isSpeaking ? 0.9 : 1}
          transparent={isSpeaking}
        />
      </mesh>
    </>
  );
}

function EarthEnvironment({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <>
      <ambientLight intensity={isSpeaking ? 1.2 : 0.8} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={isSpeaking ? 2.5 : 1.5} color="#f8fafc" />
      <pointLight position={[-10, -10, -10]} intensity={isSpeaking ? 1.8 : 1.2} color="#e2e8f0" />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={isSpeaking ? 2.0 : 1.3} 
        color="#ffffff"
        castShadow 
      />
    </>
  );
}

function SpeakingRings({ isSpeaking, earthVoiceText }: { isSpeaking: boolean; earthVoiceText: string }) {
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const ring3Ref = useRef<Mesh>(null);

  // Analyze text for ring behavior
  const getRingPattern = (text: string) => {
    const words = text.split(' ').length;
    const hasExclamation = text.includes('!');
    const hasQuestion = text.includes('?');
    const isLong = text.length > 100;
    const isUrgent = text.toLowerCase().includes('urgent') || text.toLowerCase().includes('danger') || text.toLowerCase().includes('warning');
    const isCalm = text.toLowerCase().includes('gentle') || text.toLowerCase().includes('peaceful') || text.toLowerCase().includes('serene');
    
    return {
      frequency: hasExclamation ? 8 : hasQuestion ? 6 : isUrgent ? 10 : isCalm ? 3 : 4,
      amplitude: hasExclamation ? 0.3 : hasQuestion ? 0.2 : isUrgent ? 0.35 : isCalm ? 0.1 : 0.15,
      speed: words > 20 ? 0.8 : words > 10 ? 0.6 : isUrgent ? 1.0 : isCalm ? 0.3 : 0.5,
      opacity: hasExclamation ? 0.8 : hasQuestion ? 0.6 : isUrgent ? 0.9 : isCalm ? 0.4 : 0.7
    };
  };

  useFrame((state, delta) => {
    if (!isSpeaking) return;
    
    const pattern = getRingPattern(earthVoiceText);
    
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * pattern.speed;
      const scale1 = Math.sin(state.clock.elapsedTime * pattern.frequency) * pattern.amplitude + 1.5;
      ring1Ref.current.scale.set(scale1, scale1, 1);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * (pattern.speed * 0.6);
      const scale2 = Math.sin(state.clock.elapsedTime * (pattern.frequency * 1.5) + 1) * (pattern.amplitude * 0.75) + 1.8;
      ring2Ref.current.scale.set(scale2, scale2, 1);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * (pattern.speed * 0.4);
      const scale3 = Math.sin(state.clock.elapsedTime * (pattern.frequency * 2) + 2) * (pattern.amplitude * 0.5) + 2.1;
      ring3Ref.current.scale.set(scale3, scale3, 1);
    }
  });

  if (!isSpeaking) return null;

  const pattern = getRingPattern(earthVoiceText);
  const ringColor = earthVoiceText.toLowerCase().includes('ocean') || earthVoiceText.toLowerCase().includes('water') ? "#0ea5e9" : 
                   earthVoiceText.toLowerCase().includes('forest') || earthVoiceText.toLowerCase().includes('tree') ? "#16a34a" :
                   earthVoiceText.toLowerCase().includes('danger') || earthVoiceText.toLowerCase().includes('warning') ? "#ef4444" : 
                   earthVoiceText.toLowerCase().includes('urban') || earthVoiceText.toLowerCase().includes('city') ? "#64748b" : "#22c55e";

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.5, 0.03, 8, 32]} />
        <meshBasicMaterial 
          color={ringColor}
          transparent 
          opacity={pattern.opacity}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.8, 0.02, 8, 32]} />
        <meshBasicMaterial 
          color={ringColor}
          transparent 
          opacity={pattern.opacity * 0.7}
        />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.1, 0.015, 8, 32]} />
        <meshBasicMaterial 
          color={ringColor}
          transparent 
          opacity={pattern.opacity * 0.4}
        />
      </mesh>
    </>
  );
}

function EarthScene({ isSpeaking, earthVoiceText }: { isSpeaking: boolean; earthVoiceText: string }) {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ position: [2.5, 2.5, 2.5], fov: 60 }}
    >
      <EarthEnvironment isSpeaking={isSpeaking} />
      <EarthShape isSpeaking={isSpeaking} earthVoiceText={earthVoiceText} />
      <SpeakingRings isSpeaking={isSpeaking} earthVoiceText={earthVoiceText} />
      <EffectComposer multisampling={0}>
        <N8AO halfRes color="black" aoRadius={1.5} intensity={isSpeaking ? 1.2 : 0.8} aoSamples={4} denoiseSamples={3} />
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.3}
          intensity={isSpeaking ? 0.7 : 0.4}
        />
        <Bloom
          kernelSize={KernelSize.LARGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={isSpeaking ? 0.5 : 0.3}
        />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}

interface EarthVoice3DProps {
  snapshot?: AnalysisSnapshot;
  earthVoiceData?: any; // New prop for conversation data
}

// Type for TTS audio data from backend
interface TTSAudioChunk {
  index: number;
  text: string;
  text_length: number;
  audio_base64: string;
  audio_format: string;
  voice_id: string;
  emotion: string;
  estimated_duration: string | number;
  truncated: boolean;
  processed_text?: string;
}

interface TTSAudioData {
  // Mode can be single or chunked
  mode?: 'single' | 'chunked';
  // Single-shot fields
  audio_base64?: string;
  audio_format?: string;
  voice_id?: string;
  emotion?: string;
  estimated_duration?: number | string;
  voice_settings?: any;
  detailed_response?: boolean;
  processing_note?: string;
  text_length?: number;
  truncated?: boolean;
  processed_text?: string;
  // Chunked fields
  chunks?: TTSAudioChunk[];
  total_chunks?: number;
  combined_estimated_duration?: string;
  chunking_strategy?: any;
}

// Type for Earth Voice data structure from backend
interface EarthVoiceData {
  text: string;
  original_text?: string;
  tts_enabled: boolean;
  audio: TTSAudioData | null;
  tts_mode?: 'single' | 'chunked' | 'none';
  total_chunks?: number;
  combined_estimated_duration?: string;
  timestamp?: string;
}

// Type for conversation messages
interface ConversationMessage {
  id: string;
  type: 'user' | 'earth';
  message: string;
  timestamp: string;
  tts?: TTSAudioData;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export function EarthVoice3D({ snapshot, earthVoiceData }: EarthVoice3DProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false); // default OFF to avoid unexpected autoplay
  const previousTimestampRef = useRef<string | null>(null);
  
  // Conversation state
  const [showConversation, setShowConversation] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [autoTTS, setAutoTTS] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [chunkStatus, setChunkStatus] = useState<{current: number; total: number; est?: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const playbackAbortRef = useRef<boolean>(false);

  // Get the active earth voice data (prioritize conversation data over snapshot)
  const activeEarthVoiceData = earthVoiceData || (snapshot?.earthVoice);

  // Robust base64 normalization for URL-safe variants and stray whitespace
  const normalizeBase64 = (b64: string): string => {
    let s = (b64 || '').trim();
    // Convert URL-safe base64 to standard
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    // Remove non-base64 chars
    s = s.replace(/[^A-Za-z0-9+/=]/g, '');
    // Pad to multiple of 4
    const pad = s.length % 4;
    if (pad === 2) s += '==';
    else if (pad === 3) s += '=';
    else if (pad === 1) s = s.slice(0, -1); // malformed final quantum; trim
    return s;
  };

  // Map MediaError codes to human-readable messages
  const mediaErrorToString = (err: MediaError | null): string => {
    if (!err) return 'Unknown media error (no MediaError instance)';
    switch (err.code) {
      case err.MEDIA_ERR_ABORTED: return 'MEDIA_ERR_ABORTED (fetching process aborted by user)';
      case err.MEDIA_ERR_NETWORK: return 'MEDIA_ERR_NETWORK (error occurred when downloading)';
      case err.MEDIA_ERR_DECODE: return 'MEDIA_ERR_DECODE (error occurred when decoding)';
      case err.MEDIA_ERR_SRC_NOT_SUPPORTED: return 'MEDIA_ERR_SRC_NOT_SUPPORTED (audio/video not supported)';
      default: return `Unknown code ${err.code}`;
    }
  };

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

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Handle escape key to exit fullscreen
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  // Conversation functions
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

  const deriveVolumeFromEmotion = (emotion?: string): number => {
    if (!emotion) return 0.8;
    const e = emotion.toLowerCase();
    if (e.includes('urgent') || e.includes('angry')) return 0.9;
    if (e.includes('calm') || e.includes('peaceful')) return 0.7;
    if (e.includes('sad') || e.includes('melancholy')) return 0.6;
    return 0.8;
  };

  const playSingleAudio = (base64: string, meta: { emotion?: string; voice_id?: string; estimated_duration?: any; chunkIndex?: number; totalChunks?: number }, options?: { sustainSpeaking?: boolean; mimeType?: string }) => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (playbackAbortRef.current) {
          resolve();
          return;
        }

        if (currentAudio) {
          currentAudio.pause();
          currentAudio.src = '';
        }

        const normalized = normalizeBase64(base64);
        if (!normalized) {
          return reject(new Error('Empty audio data'));
        }

        const audioBytes = atob(normalized);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) audioArray[i] = audioBytes.charCodeAt(i);

        const mimeType = options?.mimeType || 'audio/mpeg';
        const audioBlob = new Blob([audioArray], { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        audio.volume = deriveVolumeFromEmotion(meta.emotion);

        const cleanup = () => {
          URL.revokeObjectURL(audioUrl);
          setCurrentAudio(null);
          if (!options?.sustainSpeaking) {
            setIsSpeaking(false);
          }
        };

        audio.onplay = () => {
          setIsSpeaking(true);
          if (meta.chunkIndex && meta.totalChunks) {
            console.log(`🔊 Playing chunk ${meta.chunkIndex}/${meta.totalChunks}`);
          }
        };

        audio.onended = () => {
          cleanup();
          resolve();
        };

        audio.onpause = () => {
          if (playbackAbortRef.current) {
            cleanup();
            resolve();
          }
        };

        audio.onerror = (event) => {
          cleanup();
          const err = (event as any)?.error || new Error('Audio playback error');
          if (playbackAbortRef.current) {
            resolve();
          } else {
            reject(err);
          }
        };

        setCurrentAudio(audio);
        audio.play().catch(err => {
          cleanup();
          if (playbackAbortRef.current) {
            resolve();
          } else {
            reject(err);
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error(String(error)));
        }
      }
    });
  };

  // Queue-based playback for chunked TTS
  const playChunkedAudio = async (audioData: TTSAudioData) => {
    if (!audioData.chunks || audioData.chunks.length === 0) return;
    setIsSpeaking(true);
    setIsFullscreen(true);
    for (const chunk of audioData.chunks) {
      if (playbackAbortRef.current) break;
      setChunkStatus({ current: chunk.index, total: audioData.chunks.length, est: audioData.combined_estimated_duration });
      try {
        await playSingleAudio(chunk.audio_base64, {
          emotion: chunk.emotion,
          voice_id: chunk.voice_id,
          estimated_duration: chunk.estimated_duration,
          chunkIndex: chunk.index,
          totalChunks: audioData.chunks.length
        }, { sustainSpeaking: true });
      } catch (err) {
        if (!playbackAbortRef.current) {
          console.error(`Chunk ${chunk.index} playback failed:`, err);
        }
        break;
      }

      if (playbackAbortRef.current) break;
      // Natural gap between segments
      await new Promise(res => setTimeout(res, 350));
    }

    if (!playbackAbortRef.current) {
      setIsSpeaking(false);
    }
    setChunkStatus(null);
    playbackAbortRef.current = false;
  };

  const playTTSAudio = async (audioData: TTSAudioData) => {
    try {
      playbackAbortRef.current = false;
      setIsFullscreen(true);
  setChunkStatus(null);
      if ((audioData.mode === 'chunked' || Array.isArray(audioData.chunks)) && audioData.chunks?.length) {
        console.log(`🎧 Starting chunked playback (${audioData.chunks.length} segments, est ${audioData.combined_estimated_duration})`);
        await playChunkedAudio(audioData);
      } else if (audioData.audio_base64) {
        await playSingleAudio(audioData.audio_base64, { emotion: audioData.emotion, voice_id: audioData.voice_id, estimated_duration: audioData.estimated_duration });
      } else {
        console.warn('No audio data provided');
      }
    } catch (error) {
      console.error('Error playing TTS audio:', error);
      setChunkStatus(null);
    }
  };

  // Auto-start speaking when new TTS audio arrives (if enabled) - FIXED VERSION
  useEffect(() => {
    if (!activeEarthVoiceData || typeof activeEarthVoiceData !== 'object') return;
    
    const ts = activeEarthVoiceData.timestamp;
    const hasChunks = Array.isArray(activeEarthVoiceData.audio?.chunks) && activeEarthVoiceData.audio?.chunks.length > 0;
    const hasAudio = activeEarthVoiceData.tts_enabled === true && activeEarthVoiceData.audio && (
      Boolean(activeEarthVoiceData.audio.audio_base64) || hasChunks
    );
    if (!hasAudio || !ts) return;
    
    // Avoid re-triggering for same timestamp
    if (previousTimestampRef.current === ts) return;
    previousTimestampRef.current = ts;
    
    // Only auto-speak if enabled, not currently speaking, and not currently playing any audio
    if (autoSpeak && !isSpeaking && !currentAudio) {
      // Delay slightly to allow UI to render
      const timeoutId = setTimeout(() => {
        try {
          handleSpeak();
        } catch (e) {
          console.error('AutoSpeak failed:', e);
        }
      }, 300); // Increased delay to prevent rapid firing
      
      // Cleanup timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [activeEarthVoiceData, autoSpeak, isSpeaking, currentAudio]);

  const handleSpeak = () => {
    if (isSpeaking) {
      // Stop speaking (single or chunked)
      playbackAbortRef.current = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.src = '';
      }
      setIsSpeaking(false);
      setCurrentAudio(null);
      setChunkStatus(null);
      return;
    }

    try {
      playbackAbortRef.current = false;
      // Check if we have enhanced TTS audio from backend
      let hasElevenLabsAudio = false;
      let audioData: TTSAudioData | null = null;

      // Check if earthVoice is the new structure with TTS
      if (typeof activeEarthVoiceData === 'object' && activeEarthVoiceData !== null) {
        hasElevenLabsAudio = activeEarthVoiceData.tts_enabled === true && activeEarthVoiceData.audio;
        audioData = activeEarthVoiceData.audio;
      }

      if (hasElevenLabsAudio && audioData) {
  if ((audioData.mode === 'chunked' || Array.isArray(audioData.chunks)) && audioData.chunks?.length) {
          console.log(`🎧 Chunked TTS detected (${audioData.chunks.length} segments)`);
          setIsFullscreen(true);
          void playTTSAudio(audioData);
          return;
        }
        // Use ElevenLabs TTS audio from backend
        // Enhanced base64 validation and conversion
        console.log('🎵 Processing ElevenLabs audio:', {
          format: audioData.audio_format,
          hasBase64: !!audioData.audio_base64,
          base64Length: audioData.audio_base64?.length || 0,
          emotion: audioData.emotion
        });
        
  const normalized = normalizeBase64(audioData.audio_base64 || '');
        
        // Validate base64 length (MP3 audio should be substantial)
        if (normalized.length < 100) {
          console.error('🚨 Audio data too short, likely corrupted');
          console.warn('Audio processing failed. User can manually retry if needed.');
          return;
        }
        
        let audioBytes, audioArray;
        try {
          audioBytes = atob(normalized);
          audioArray = new Uint8Array(audioBytes.length);
          for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i);
          }
        } catch (decodeError) {
          console.error('🚨 Base64 decode failed:', decodeError);
          console.warn('Audio decoding failed. User can manually retry if needed.');
          return;
        }
        
        // Validate MP3 file signature (first 3 bytes should be ID3 or start with 0xFF for MP3)
        const header = Array.from(audioArray.slice(0, 4));
        const isID3 = header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33; // "ID3"
        const isMPEG = (header[0] & 0xFF) === 0xFF && (header[1] & 0xE0) === 0xE0; // MPEG sync
        
        if (!isID3 && !isMPEG) {
          console.error('🚨 Invalid MP3 header detected:', header);
          console.warn('Audio format validation failed. Backend may be generating corrupted audio.');
          return;
        }
        
        console.log('✅ Valid MP3 audio detected:', { 
          isID3, 
          isMPEG, 
          size: audioArray.length,
          header: header.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ')
        });
        
        // Enhanced MIME type detection with browser compatibility check
        let mimeType = 'audio/mpeg'; // Default to MP3 for best compatibility
        let audioFormat = audioData.audio_format?.toLowerCase() || 'mp3';
        
        // Check browser support and adjust format accordingly
        const testAudio = document.createElement('audio');
        const canPlayMp3 = testAudio.canPlayType('audio/mpeg');
        const canPlayWav = testAudio.canPlayType('audio/wav');
        const canPlayM4a = testAudio.canPlayType('audio/mp4');
        
        console.log('🔍 Browser audio support:', {
          mp3: canPlayMp3,
          wav: canPlayWav,
          m4a: canPlayM4a,
          originalFormat: audioFormat
        });
        
        // Set MIME type based on format and browser support
        if (audioFormat === 'mp3' && canPlayMp3) {
          mimeType = 'audio/mpeg';
        } else if (audioFormat === 'wav' && canPlayWav) {
          mimeType = 'audio/wav';
        } else if (audioFormat === 'm4a' && canPlayM4a) {
          mimeType = 'audio/mp4';
        } else if (audioFormat === 'mp4' && canPlayM4a) {
          mimeType = 'audio/mp4';
        } else {
          // Fallback to MP3 if unsupported format
          console.warn(`⚠️ Format ${audioFormat} may not be supported, using MP3 fallback`);
          mimeType = 'audio/mpeg';
        }
        
  const audioBlob = new Blob([audioArray], { type: mimeType });
  const audioUrl = URL.createObjectURL(audioBlob);
  const dataUrl = `data:${mimeType};base64,${normalized}`;
        
        const audio = new Audio(audioUrl);
        audio.crossOrigin = 'anonymous';
        
        // Set audio properties for better playback
        audio.preload = 'auto';
        audio.volume = 0.8; // Set default volume
        
        // Set up event handlers with better error handling
        audio.onloadstart = () => {
          // Log magic bytes for quick header validation
          const sigBytes = Array.from(audioArray.slice(0, 4));
          const sigText = String.fromCharCode(sigBytes[0] || 0, sigBytes[1] || 0, sigBytes[2] || 0);
          console.log('🎵 Loading ElevenLabs Earth Voice audio...');
          console.log('Header bytes:', sigBytes, 'Text:', JSON.stringify(sigText));
        };
        
        audio.oncanplay = () => {
          console.log('🌍 ElevenLabs Earth Voice ready to play');
        };
        
        audio.onplay = () => {
          setIsSpeaking(true);
          setIsFullscreen(true); // Auto-switch to fullscreen when speaking starts
          console.log(`🎤 Playing ElevenLabs voice (${audioData.voice_id}) with emotion: ${audioData.emotion}`);
        };
        
        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl); // Clean up blob URL
          console.log('🌍 ElevenLabs Earth Voice finished');
          
          // Reset auto-speak to prevent immediate restart
          if (autoSpeak) {
            console.log('🔄 Audio finished - preventing auto-restart loop');
          }
        };
        
        audio.onerror = () => {
          const errStr = mediaErrorToString(audio.error as MediaError | null);
          console.error('🚨 ElevenLabs audio error:', errStr);
          console.error('📊 Audio details:', {
            format: audioFormat,
            mimeType: mimeType,
            blobSize: audioBlob.size,
            readyState: audio.readyState,
            networkState: audio.networkState,
            canPlayMp3: canPlayMp3,
            canPlayWav: canPlayWav
          });
          
          // Clean up immediately and stop any further attempts
          setIsSpeaking(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
          
          // Provide helpful troubleshooting info
          if (errStr.includes('SRC_NOT_SUPPORTED')) {
            console.error('💡 Troubleshooting: Audio format not supported by browser');
            console.error('🔧 Suggestion: Check backend TTS service to ensure MP3 output');
            console.error('🌐 Browser support:', { mp3: canPlayMp3, wav: canPlayWav, m4a: canPlayM4a });
          }
        };
        
        // Set volume based on emotion (if available)
        const emotion = audioData.emotion?.toLowerCase() || 'neutral';
        if (emotion.includes('urgent') || emotion.includes('angry')) {
          audio.volume = 0.9;
        } else if (emotion.includes('calm') || emotion.includes('peaceful')) {
          audio.volume = 0.7;
        } else if (emotion.includes('sad') || emotion.includes('melancholy')) {
          audio.volume = 0.6;
        } else {
          audio.volume = 0.8; // Default Earth voice volume
        }
        
        setCurrentAudio(audio);
        
        // Play the audio with user interaction handling
        audio.play().catch((err) => {
          console.error('🚨 Failed to play ElevenLabs audio:', err);
          setIsSpeaking(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
          
          // Simple error message without aggressive retries
          if ((err as any).name === 'NotAllowedError') {
            console.warn('Audio playback was blocked by browser. User can manually retry.');
          } else if ((err as any).name === 'NotSupportedError') {
            console.warn(`Audio format not supported: ${audioData.audio_format}`);
          } else {
            console.warn(`Audio playback failed: ${(err as any).message || 'Unknown error'}`);
          }
        });
        
      } else {
        // No ElevenLabs audio available
        console.warn('No ElevenLabs TTS audio available for this response');
      }
    } catch (error) {
      console.error('🚨 Error in handleSpeak:', error);
      setIsSpeaking(false);
      setCurrentAudio(null);
      // Don't show alert to user, just log the error
      console.warn('Audio processing failed. User can manually retry if needed.');
    }
  };

  // Auto-start speaking when new TTS audio arrives (if enabled)
  useEffect(() => {
    if (!activeEarthVoiceData || typeof activeEarthVoiceData !== 'object') return;
    
    const ts = activeEarthVoiceData.timestamp;
    const hasAudio = activeEarthVoiceData.tts_enabled === true && activeEarthVoiceData.audio && (
      Boolean(activeEarthVoiceData.audio.audio_base64) ||
      (activeEarthVoiceData.audio.mode === 'chunked' && Array.isArray(activeEarthVoiceData.audio.chunks) && activeEarthVoiceData.audio.chunks.length > 0)
    );
    if (!hasAudio || !ts) return;
    // Avoid re-triggering for same timestamp
    if (previousTimestampRef.current === ts) return;
    previousTimestampRef.current = ts;
    if (autoSpeak && !isSpeaking) {
      // Delay slightly to allow UI to render
      setTimeout(() => {
        try {
          handleSpeak();
        } catch (e) {
          console.error('AutoSpeak failed:', e);
        }
      }, 150);
    }
  }, [activeEarthVoiceData, autoSpeak, isSpeaking]);

  // Extract text and check for audio availability
  const getEarthVoiceText = (): string => {
    if (typeof activeEarthVoiceData === 'object' && activeEarthVoiceData !== null) {
      // Always return the original full text, not the TTS-truncated version
      return activeEarthVoiceData.text || activeEarthVoiceData.original_text || '';
    } else if (typeof activeEarthVoiceData === 'string') {
      return activeEarthVoiceData;
    }
    
    return '';
  };

  // Get TTS-specific text for audio processing
  const getTTSText = (): string => {
    if (typeof activeEarthVoiceData === 'object' && activeEarthVoiceData !== null) {
      if (Array.isArray(activeEarthVoiceData.audio?.chunks) && activeEarthVoiceData.audio?.chunks.length) {
        const chunks = activeEarthVoiceData.audio.chunks as TTSAudioChunk[];
        return chunks
          .map((chunk) => chunk.processed_text || chunk.text)
          .filter(Boolean)
          .join(' ');
      }
      // Use processed_text for TTS if available, otherwise fall back to full text
      return activeEarthVoiceData.audio?.processed_text || activeEarthVoiceData.text || '';
    }
    return getEarthVoiceText();
  };

  const getAudioAvailability = (): { hasElevenLabsAudio: boolean; hasText: boolean } => {
    if (typeof activeEarthVoiceData === 'object' && activeEarthVoiceData !== null) {
      const audioPayload = activeEarthVoiceData.audio;
  const hasChunks = Array.isArray(audioPayload?.chunks) && (audioPayload?.chunks.length ?? 0) > 0;
      const hasPayloadData = Boolean(audioPayload && (audioPayload.audio_base64 || hasChunks));
      const hasElevenLabsAudio = activeEarthVoiceData.tts_enabled === true && hasPayloadData;
      const hasText = Boolean(activeEarthVoiceData.text);
      return { hasElevenLabsAudio, hasText };
    } else if (typeof activeEarthVoiceData === 'string') {
      return { hasElevenLabsAudio: false, hasText: Boolean(activeEarthVoiceData) };
    }
    
    return { hasElevenLabsAudio: false, hasText: false };
  };

  const earthVoiceText = getEarthVoiceText();
  const ttsText = getTTSText();
  const { hasElevenLabsAudio, hasText } = getAudioAvailability();

  // Check if TTS text was truncated from original
  let chunkList: TTSAudioChunk[] = [];
  if (typeof activeEarthVoiceData === 'object' && activeEarthVoiceData !== null) {
    const possibleChunks = activeEarthVoiceData.audio?.chunks;
    if (Array.isArray(possibleChunks)) {
      chunkList = possibleChunks as TTSAudioChunk[];
    }
  }
  const chunkTruncation = chunkList.some((chunk) => chunk.truncated);
  const isTTSTruncated = Boolean(activeEarthVoiceData?.audio?.truncated || chunkTruncation || 
    (earthVoiceText && ttsText && earthVoiceText.length > ttsText.length));

  const chunkedAudioInfo = (() => {
    if (typeof activeEarthVoiceData === 'object' && activeEarthVoiceData !== null) {
      const audio = activeEarthVoiceData.audio;
      if (chunkList.length > 0 && audio) {
        return {
          hasChunked: true,
          total: chunkList.length,
          duration: audio.combined_estimated_duration || activeEarthVoiceData.combined_estimated_duration || undefined
        };
      }
    }
    return { hasChunked: false, total: 0, duration: undefined as string | undefined };
  })();

  const audioMeta = (typeof activeEarthVoiceData === 'object' && activeEarthVoiceData !== null)
    ? activeEarthVoiceData.audio
    : null;

  if (!hasText) return null;

  return (
    <>
      {/* Normal component view */}
      <section className={`relative group ${isFullscreen ? 'hidden' : 'block'}`}>
        {/* Clean animated border */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-xl blur transition-all duration-500 ${
          isSpeaking 
            ? 'opacity-40 animate-pulse' 
            : 'opacity-15 group-hover:opacity-25 animate-pulse'
        }`}></div>
        
        {/* Main container */}
        <div className="relative bg-slate-950/80 backdrop-blur-sm border border-slate-700/40 rounded-xl overflow-hidden shadow-2xl">
          
          {/* 3D Earth Scene Background */}
          <div className={`absolute inset-0 transition-all duration-700 ${isSpeaking ? 'opacity-100' : 'opacity-40'}`}>
            <EarthScene isSpeaking={isSpeaking} earthVoiceText={earthVoiceText} />
          </div>
          
          {/* Content overlay */}
          <div className={`relative z-10 p-6 transition-all duration-700 ${isSpeaking ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className={`absolute inset-0 bg-green-400 rounded-full blur-md animate-pulse transition-opacity duration-300 ${
                  isSpeaking ? 'opacity-50' : 'opacity-30'
                }`}></div>
                <div className="relative z-10 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🌍</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isSpeaking ? 'text-emerald-300 animate-pulse' : 'text-white'
                }`}>
                  Earth Voice {isSpeaking && <span className="text-sm font-normal text-emerald-400">- Speaking...</span>}
                </h3>
                <p className="text-sm text-slate-400">Experience the voice of our planet in immersive 3D</p>
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center gap-2">
                {/* Conversation toggle */}
                <button
                  onClick={() => setShowConversation(!showConversation)}
                  className={`p-2 rounded-lg transition-all duration-200 text-xs flex items-center gap-1 ${
                    showConversation 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                  title={showConversation ? 'Hide conversation' : 'Show conversation'}
                >
                  💬 {showConversation ? 'Hide Chat' : 'Chat'}
                </button>
                
                {/* Voice input button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!recognitionRef.current}
                  className={`p-2 rounded-lg transition-all duration-200 ${
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
                
                {/* Auto speak toggle */}
                <button
                  onClick={() => setAutoSpeak(a => !a)}
                  className={`p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 text-xs flex items-center gap-1 ${autoSpeak ? 'text-emerald-400' : 'text-slate-400'}`}
                  title={autoSpeak ? 'Auto-speak is ON. Click to turn OFF.' : 'Auto-speak is OFF. Click to turn ON.'}
                >
                  {autoSpeak ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 12h.01" /></svg>
                      Auto
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 opacity-70">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M9 9v6m4-8v10m4-6v2" /></svg>
                      Manual
                    </span>
                  )}
                </button>
                {/* Fullscreen button */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200 group"
                  title="Open in fullscreen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                
                {/* Voice control button */}
                <button
                  onClick={handleSpeak}
                  disabled={!hasElevenLabsAudio}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isSpeaking 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                      : hasElevenLabsAudio
                        ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                        : 'bg-gray-500/20 text-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={
                    hasElevenLabsAudio 
                      ? (isSpeaking ? 'Stop ElevenLabs Earth Voice' : 'Play ElevenLabs Earth Voice') 
                      : 'ElevenLabs voice not available - ensure backend is configured'
                  }
                >
                  {isSpeaking ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {chunkStatus && chunkStatus.current > 0 && (
              <div className="mt-2 flex items-center gap-3 text-xs text-emerald-300">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l-2 2m0 0l-2-2m2 2h6a2 2 0 012 2v11" />
                  </svg>
                  Segment {chunkStatus.current}/{chunkStatus.total}
                </span>
                {chunkStatus.est && (
                  <span className="text-emerald-200/80">• ~{chunkStatus.est}</span>
                )}
                <button
                  onClick={handleSpeak}
                  className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 transition"
                  type="button"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Text Content */}
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
              {/* Full response display with proper formatting */}
              <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap break-words">
                {earthVoiceText}
              </div>
              
              {/* TTS truncation indicator */}
              {isTTSTruncated && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      📖 <strong>Full Response Above</strong> • 🎵 Audio version is optimized for speech ({ttsText.length} chars)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Response metadata */}
              <div className="mt-3 pt-2 border-t border-slate-700/30">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">
                      📊 {earthVoiceText.length} characters
                    </span>
                    {hasElevenLabsAudio && audioMeta && (
                      <>
                        {chunkedAudioInfo.hasChunked ? (
                          <>
                            <span className="text-green-400">
                              🔊 ~{chunkedAudioInfo.duration || 'multi-segment playback'}
                            </span>
                            <span className="text-emerald-300">
                              🎧 {chunkedAudioInfo.total} segments
                            </span>
                          </>
                        ) : (
                          <span className="text-green-400">
                            🔊 {audioMeta.estimated_duration}
                          </span>
                        )}
                        {audioMeta.emotion && (
                          <span className="text-blue-400">
                            😊 {audioMeta.emotion}
                          </span>
                        )}
                        {audioMeta.detailed_response && !chunkedAudioInfo.hasChunked && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            📝 Enhanced Detail
                          </span>
                        )}
                        {isTTSTruncated && (
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                            ✂️ Audio Optimized
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Enhanced TTS status */}
                {hasElevenLabsAudio ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343a8 8 0 000 11.314m2.829-9.9a5 5 0 000 7.072M9 9a3 3 0 006 0v5a3 3 0 01-6 0V9z" />
                    </svg>
                    <span>
                      {chunkedAudioInfo.hasChunked
                        ? `Segmented ElevenLabs playback • Full Gemini Response Displayed${chunkedAudioInfo.duration ? ` • ~${chunkedAudioInfo.duration}` : ''}`
                        : 'Enhanced with ElevenLabs Indian Voice • Full Gemini Response Displayed'}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>ElevenLabs voice not available - configure backend with API key • Full text displayed</span>
                  </div>
                )}
                
                {/* Processing notes for detailed responses */}
                {activeEarthVoiceData?.audio?.processing_note && (
                  <div className="mt-2 text-xs text-purple-400 italic">
                    ⚙️ {activeEarthVoiceData.audio.processing_note}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Interface */}
          {showConversation && (
            <div className="mt-4 border-t border-slate-700/40 pt-4">
              {/* Messages */}
              <div className="max-h-96 overflow-y-auto mb-4 space-y-3 bg-slate-900/30 rounded-lg p-3">
                {messages.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <div className="text-2xl mb-2">🌍</div>
                    <p className="text-sm mb-1">Start a conversation with Earth</p>
                    <p className="text-xs text-blue-400">Ask about environment, climate, or anything</p>
                    <p className="text-xs text-green-400 mt-2">✨ Full detailed responses from Gemini AI</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600/80 text-white'
                          : 'bg-green-900/60 text-green-100 border border-green-700/40'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === 'earth' && <span className="text-sm">🌍</span>}
                        <div className="flex-1 min-w-0">
                          {/* Full message display with proper word wrapping */}
                          <div className="leading-relaxed whitespace-pre-wrap break-words">
                            {message.message}
                          </div>
                          
                          {/* Enhanced info for Earth messages */}
                          {message.type === 'earth' && (
                            <div className="mt-2 text-xs text-green-400/80">
                              <span>📊 Response length: {message.message.length} characters</span>
                              {message.tts?.text_length && message.tts.text_length !== message.message.length && (
                                <span className="ml-2">🔊 TTS optimized: {message.tts.text_length} chars</span>
                              )}
                              {Array.isArray(message.tts?.chunks) && (message.tts?.chunks?.length ?? 0) > 0 && (
                                <span className="ml-2">🎧 {message.tts?.chunks?.length} segments</span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                              {message.type === 'earth' && message.tts && (
                                <span className="ml-2">
                                  {message.tts.detailed_response && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded ml-1" title="Detailed Gemini response">
                                      📝 Detailed
                                    </span>
                                  )}
                                  {message.tts.truncated && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded ml-1" title="TTS optimized for speech">
                                      ✂️ TTS Optimized
                                    </span>
                                  )}
                                  {message.tts.processing_note && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded ml-1" title={message.tts.processing_note}>
                                      ⚙️ Enhanced
                                    </span>
                                  )}
                                </span>
                              )}
                            </span>
                            {message.type === 'earth' && message.tts && (
                              <button
                                onClick={() => playTTSAudio(message.tts!)}
                                className="text-xs bg-green-600/40 hover:bg-green-600/60 px-1 py-0.5 rounded transition-all duration-200"
                                title={`Play Earth's voice (${message.tts.emotion})`}
                              >
                                🔊
                              </button>
                            )}
                          </div>
                        </div>
                        {message.type === 'user' && <span className="text-sm">👤</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-2 rounded-lg bg-green-900/60 text-green-100 border border-green-700/40">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌍</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <span className="text-xs text-green-300 ml-1">
                              Earth is responding...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Earth anything..."
                      className="w-full p-2 bg-slate-800/50 border border-slate-600/40 rounded-lg text-white placeholder-slate-400 resize-none focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200 text-sm"
                      rows={2}
                      disabled={isLoading}
                    />
                    {isListening && (
                      <div className="absolute top-1 right-1 text-xs text-green-400 animate-pulse bg-slate-900 px-1 rounded">
                        🎤 Listening...
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  title="Send message to Earth"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
                
                {messages.length > 0 && (
                  <button
                    onClick={clearConversation}
                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all duration-200"
                    title="Clear conversation"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Settings */}
              <div className="flex items-center justify-between mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIncludeLocation(!includeLocation)}
                    className={`px-2 py-1 rounded transition-all duration-200 ${
                      includeLocation 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    📍 {includeLocation ? 'Location ON' : 'Location OFF'}
                  </button>
                  
                  <button
                    onClick={() => setAutoTTS(!autoTTS)}
                    className={`px-2 py-1 rounded transition-all duration-200 ${
                      autoTTS 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    🔊 {autoTTS ? 'Voice ON' : 'Voice OFF'}
                  </button>
                </div>
                
                {conversationId && (
                  <span className="text-slate-400">
                    {messages.length} messages
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
          {/* Fullscreen header */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`absolute inset-0 bg-green-400 rounded-full blur-md animate-pulse transition-opacity duration-300 ${
                  isSpeaking ? 'opacity-50' : 'opacity-30'
                }`}></div>
                <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🌍</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">Earth Voice - Immersive Experience</h2>
              {isSpeaking && (
                <span className="text-lg text-blue-400 animate-pulse">Speaking...</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Quick voice input in fullscreen */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!recognitionRef.current}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : recognitionRef.current
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop voice input' : 'Quick voice input'}
              >
                🎤
              </button>
              
              {/* Voice control in fullscreen */}
              <button
                onClick={handleSpeak}
                disabled={!hasElevenLabsAudio}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isSpeaking 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : hasElevenLabsAudio
                      ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                      : 'bg-gray-500/20 text-gray-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={
                  hasElevenLabsAudio 
                    ? (isSpeaking ? 'Stop ElevenLabs Earth Voice' : 'Play ElevenLabs Earth Voice') 
                    : 'ElevenLabs voice not available - ensure backend is configured'
                }
              >
                {isSpeaking ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
              
              {/* Exit fullscreen */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
                title="Exit fullscreen (ESC)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Fullscreen 3D Earth */}
          <div className="flex-1 mt-20 mb-8 mx-4">
            <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black">
              <EarthScene isSpeaking={isSpeaking} earthVoiceText={earthVoiceText} />
            </div>
          </div>

          {/* Fullscreen text content - only when not speaking */}
          {!isSpeaking && (
            <div className="absolute bottom-8 left-8 right-8">
              {/* Current Earth message */}
              {earthVoiceText && (
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-4 max-h-64 overflow-y-auto">
                  {/* Full response with proper formatting */}
                  <div className="text-slate-200 leading-relaxed text-lg whitespace-pre-wrap break-words">
                    {earthVoiceText}
                  </div>
                  
                  {/* Response metadata in fullscreen */}
                  <div className="mt-4 pt-3 border-t border-slate-600/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">
                          📊 {earthVoiceText.length} characters
                        </span>
                        {hasElevenLabsAudio && activeEarthVoiceData?.audio && (
                          <>
                            <span className="text-green-300">
                              🔊 {activeEarthVoiceData.audio.estimated_duration}
                            </span>
                            <span className="text-blue-300">
                              😊 {activeEarthVoiceData.audio.emotion}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {hasElevenLabsAudio ? (
                      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343a8 8 0 000 11.314m2.829-9.9a5 5 0 000 7.072M9 9a3 3 0 006 0v5a3 3 0 01-6 0V9z" />
                        </svg>
                        <span>
                          {chunkedAudioInfo.hasChunked
                            ? `Segmented ElevenLabs playback • Full Gemini Response Available${chunkedAudioInfo.duration ? ` • ~${chunkedAudioInfo.duration}` : ''}`
                            : 'Enhanced with ElevenLabs Indian Voice • Full Gemini Response Available'}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>ElevenLabs voice not available - configure backend with API key • Full text displayed</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Quick conversation input */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Earth anything in fullscreen..."
                      className="w-full p-3 bg-slate-800/50 border border-slate-600/40 rounded-lg text-white placeholder-slate-400 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      disabled={isLoading}
                    />
                    {isListening && (
                      <p className="text-xs text-green-400 mt-1 animate-pulse">🎤 Listening for voice input...</p>
                    )}
                  </div>
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
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 text-slate-400 text-sm">
            Press ESC to exit fullscreen • Use 🎤 for voice input
          </div>
        </div>
      )}
    </>
  );
}