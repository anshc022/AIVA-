export type AnalysisMode = 'complete' | 'quick' | 'satellite';

export interface RiskSnapshot {
  type: string;
  severity?: string;
}

export interface ActionSnapshot {
  action: string;
  priority?: string;
  source?: string;
}

// TTS audio data from ElevenLabs
export interface TTSAudioData {
  audio_base64: string;
  audio_format: string;
  voice_id: string;
  emotion: string;
  estimated_duration: number;
  voice_settings: any;
}

// Enhanced Earth Voice with TTS support
export interface EarthVoiceData {
  text: string;
  tts_enabled: boolean;
  audio: TTSAudioData | null;
  timestamp?: string;
}

export interface AnalysisSnapshot {
  analysisType: AnalysisMode;
  lat: number;
  lon: number;
  locationLabel: string;
  timestamp?: string;
  overallScore?: number;
  overallStatus?: string;
  traditionalScore?: number;
  cnnScore?: number;
  vegetationHealth?: number;
  vegetationStatus?: string;
  ndvi?: number;
  vegetationConfidence?: string;
  riskLevel?: string;
  totalRisks?: number;
  riskList: RiskSnapshot[];
  topActions: ActionSnapshot[];
  satelliteSource?: string;
  realSatellite?: boolean;
  // Earth Voice can be either string (legacy) or enhanced object with TTS
  earthVoice?: string | EarthVoiceData;
  fusionConfidence?: string;
  scoreAgreement?: number;
  extraMetrics: Array<{ label: string; value: string }>;
}
