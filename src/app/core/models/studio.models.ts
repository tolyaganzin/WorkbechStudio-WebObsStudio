export type SourceType = 'camera' | 'screen' | 'text' | 'image' | 'color' | 'alert' | 'browser';

export interface SourceConfig {
  text?: string;
  textColor?: string;
  fontSize?: number;
  bgColor?: string;
  fontBold?: boolean;
  banner?: boolean;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  color?: string;
  gradient?: string;
  alertTitle?: string;
  alertSubtitle?: string;
  alertIcon?: string;
  mirror?: boolean;
  shape?: 'rect' | 'circle' | 'rounded';
  videoFit?: 'cover' | 'contain' | 'fill';
  browserUrl?: string;
  browserTitle?: string;
  chatStyle?: 'compact' | 'bubble';
}

export interface SourceItem {
  id: string;
  name: string;
  type: SourceType;
  visible: boolean;
  locked: boolean;
  x: number; // 0 to 1920 (canvas coordinates)
  y: number; // 0 to 1080
  width: number;
  height: number;
  opacity: number; // 0 to 1
  zIndex: number;
  config: SourceConfig;
  stream?: MediaStream;
}

export interface Scene {
  id: string;
  name: string;
  icon?: string;
  sources: SourceItem[];
}

export interface AudioChannel {
  id: string;
  name: string;
  type: 'mic' | 'desktop' | 'media' | 'alert';
  volume: number; // 0 to 100
  muted: boolean;
  peakLevel: number; // 0 to 100 (for live VU meter)
}

export interface BroadcastState {
  isLive: boolean;
  isRecording: boolean;
  liveDuration: number; // seconds
  recordDuration: number;
  fps: number;
  bitrateKbps: number;
  droppedFrames: number;
  studioMode: boolean; // Preview + Program dual view
  resolution: {
    width: number;
    height: number;
    label: string;
  };
}

export type PresetLayout = 'fullscreen' | 'pip-br' | 'pip-tr' | 'split-h' | 'side-by-side';
