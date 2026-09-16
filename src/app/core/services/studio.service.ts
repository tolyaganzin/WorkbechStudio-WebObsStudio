import { Injectable, signal, computed, inject } from '@angular/core';
import { Scene, SourceItem, SourceType, AudioChannel, BroadcastState, PresetLayout, SourceConfig, RecordingFormat } from '../models/studio.models';
import { BroadcastService } from './broadcast.service';
import { ChannelService } from './channel.service';

const DEFAULT_SCENES: Scene[] = [
  {
    id: 'scene-live',
    name: '🎮 Screen + Facecam',
    icon: 'pi pi-desktop',
    sources: [
      {
        id: 'src-cam',
        name: 'Webcam (PiP)',
        type: 'camera',
        visible: true,
        locked: false,
        x: 1460,
        y: 680,
        width: 420,
        height: 360,
        opacity: 1,
        zIndex: 2,
        config: {
          shape: 'rounded',
          mirror: true,
          videoFit: 'cover'
        }
      },
      {
        id: 'src-banner',
        name: 'Stream Overlay Banner',
        type: 'text',
        visible: true,
        locked: false,
        x: 40,
        y: 40,
        width: 540,
        height: 70,
        opacity: 0.95,
        zIndex: 3,
        config: {
          text: '🔥 LIVE: Web OBS Studio Demo',
          textColor: '#ffffff',
          fontSize: 24,
          bgColor: '#7c3aed',
          fontBold: true,
          banner: true
        }
      },
      {
        id: 'src-alert',
        name: 'Latest Follower Alert',
        type: 'alert',
        visible: true,
        locked: false,
        x: 40,
        y: 980,
        width: 380,
        height: 60,
        opacity: 0.9,
        zIndex: 4,
        config: {
          alertTitle: 'NEW FOLLOWER',
          alertSubtitle: 'CyberKnight99 joined the crew!',
          alertIcon: '⭐'
        }
      },
      {
        id: 'src-bg',
        name: 'Screen',
        type: 'screen',
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        opacity: 1,
        zIndex: 1,
        config: {}
      },
    ]
  },
  {
    id: 'scene-chat',
    name: '💬 Just Chatting',
    icon: 'pi pi-comments',
    sources: [
      {
        id: 'src-cam-large',
        name: 'Main Webcam',
        type: 'camera',
        visible: true,
        locked: false,
        x: 80,
        y: 100,
        width: 1280,
        height: 880,
        opacity: 1,
        zIndex: 2,
        config: {
          shape: 'rounded',
          mirror: true
        }
      },
      {
        id: 'src-chat-overlay',
        name: 'Live Chat Widget',
        type: 'browser',
        visible: true,
        locked: false,
        x: 1400,
        y: 100,
        width: 440,
        height: 880,
        opacity: 0.92,
        zIndex: 3,
        config: {
          browserTitle: 'Live Stream Chat',
          chatStyle: 'bubble'
        }
      },
           {
        id: 'src-backdrop-chat',
        name: 'Studio Gradient Backdrop',
        type: 'color',
        visible: true,
        locked: true,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        opacity: 1,
        zIndex: 1,
        config: {
          gradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
        }
      },
    ]
  },
  {
    id: 'scene-brb',
    name: '☕ Be Right Back',
    icon: 'pi pi-clock',
    sources: [
      {
        id: 'src-brb-text',
        name: 'BRB Message',
        type: 'text',
        visible: true,
        locked: false,
        x: 460,
        y: 440,
        width: 1000,
        height: 200,
        opacity: 1,
        zIndex: 2,
        config: {
          text: 'STREAM WILL RESUME SHORTLY\nGrabbing a quick coffee!',
          textColor: '#f8fafc',
          fontSize: 48,
          bgColor: '#00000088',
          fontBold: true,
          banner: true
        }
      },
          {
        id: 'src-brb-bg',
        name: 'Ambient Motion Background',
        type: 'color',
        visible: true,
        locked: true,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        opacity: 1,
        zIndex: 1,
        config: {
          gradient: 'linear-gradient(45deg, #09090b 0%, #2e1065 50%, #0284c7 100%)'
        }
      },
    ]
  },
  {
    id: 'scene-intro',
    name: '🚀 Starting Soon',
    icon: 'pi pi-play',
    sources: [
      {
        id: 'src-intro-title',
        name: 'Intro Title',
        type: 'text',
        visible: true,
        locked: false,
        x: 360,
        y: 400,
        width: 1200,
        height: 280,
        opacity: 1,
        zIndex: 2,
        config: {
          text: 'STREAM STARTING SOON\nGrab your snacks and get comfortable! 🍿',
          textColor: '#a855f7',
          fontSize: 52,
          fontBold: true,
          bgColor: '#000000aa',
          banner: true
        }
      },
      {
        id: 'src-intro-bg',
        name: 'Cyberpunk Grid',
        type: 'color',
        visible: true,
        locked: true,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        opacity: 1,
        zIndex: 1,
        config: {
          gradient: 'radial-gradient(circle at center, #3b0764 0%, #030712 100%)'
        }
      },
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class StudioService {
  private broadcastService = inject(BroadcastService);
  private channelService = inject(ChannelService);

  // Scenes & Sources State
  readonly scenes = signal<Scene[]>(DEFAULT_SCENES);
  readonly activeSceneId = signal<string>('scene-live');
  readonly selectedSourceId = signal<string | null>('src-cam');

  // Preview Scene for Studio Mode
  readonly previewSceneId = signal<string>('scene-live');

  readonly activeScene = computed(() => {
    return this.scenes().find(s => s.id === this.activeSceneId()) || this.scenes()[0];
  });

  readonly selectedSource = computed(() => {
    const scene = this.activeScene();
    if (!scene) return null;
    return scene.sources.find(src => src.id === this.selectedSourceId()) || null;
  });

  // Audio channels are scoped to the active scene. Inputs are opt-in because
  // browsers only expose usable device streams after an explicit request.
  private readonly sceneAudioChannels = signal<Record<string, AudioChannel[]>>(
    Object.fromEntries(DEFAULT_SCENES.map(scene => [scene.id, []]))
  );
  readonly audioChannels = computed(() => this.sceneAudioChannels()[this.activeSceneId()] || []);
  readonly availableAudioInputs = signal<MediaDeviceInfo[]>([]);
  readonly availableVideoInputs = signal<MediaDeviceInfo[]>([]);

  // Broadcast & Output State
  readonly broadcastState = signal<BroadcastState>({
    isLive: false,
    isRecording: false,
    liveDuration: 0,
    recordDuration: 0,
    fps: 60,
    bitrateKbps: 6000,
    droppedFrames: 0,
    studioMode: false,
    resolution: { width: 1920, height: 1080, label: '1080p 60fps' }
  });

  // Hardware Streams
  readonly isWebcamActive = signal<boolean>(false);
  readonly isScreenActive = signal<boolean>(false);
  private webcamStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private webcamVideoElement: HTMLVideoElement | null = null;
  private screenVideoElement: HTMLVideoElement | null = null;
  private sourceCameraStreams = new Map<string, MediaStream>();
  private sourceCameraVideos = new Map<string, HTMLVideoElement>();
  private sourceScreenStreams = new Map<string, MediaStream>();
  private sourceScreenVideos = new Map<string, HTMLVideoElement>();

  // MediaRecorder for recording
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private liveTimerInterval: any = null;
  private recordTimerInterval: any = null;
  private audioMeterInterval: any = null;

  // Web Audio Context for real mic analysis
  private audioContext: AudioContext | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private micGainNode: GainNode | null = null;
  private screenSourceNode: MediaStreamAudioSourceNode | null = null;
  private screenGainNode: GainNode | null = null;
  private recordingAudioDestination: MediaStreamAudioDestinationNode | null = null;
  private audioInputs = new Map<string, {
    stream: MediaStream;
    source: MediaStreamAudioSourceNode;
    gain: GainNode;
    analyser: AnalyserNode;
  }>();
  private screenAudioChannelId: string | null = null;
  private sourceScreenAudioChannels = new Map<string, string>();
  private audioChannelScenes = new Map<string, string>();

  readonly recordingFormat = signal<RecordingFormat>('webm-vp9');

  // Canvas Reference
  private programCanvas: HTMLCanvasElement | null = null;
  private animFrameId: number | null = null;

  constructor() {
    this.initSimulatedAudioMeters();
    void this.refreshAudioInputs();
  }

  // ==========================================
  // CANVAS COMPOSITOR & PIPELINE
  // ==========================================

  registerProgramCanvas(canvas: HTMLCanvasElement): void {
    this.programCanvas = canvas;
    this.startRenderingLoop();
  }

  private startRenderingLoop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    let lastFrameTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const render = (now: number) => {
      frameCount++;
      if (now - lastFpsUpdate >= 1000) {
        const measuredFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        this.broadcastState.update(s => ({ ...s, fps: Math.min(60, measuredFps) }));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      if (this.programCanvas) {
        this.drawScene(this.programCanvas, this.activeScene(), now);
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  }

  private drawScene(canvas: HTMLCanvasElement, scene: Scene, timestamp: number): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = this.broadcastState().resolution.width;
    const targetH = this.broadcastState().resolution.height;

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    // Clear canvas
    ctx.clearRect(0, 0, targetW, targetH);

    // Default backdrop
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetW, targetH);

    if (!scene) return;

    // Draw the bottom layers first so the first source in the list is topmost.
    const sortedSources = [...scene.sources].reverse();

    for (const src of sortedSources) {
      if (!src.visible) continue;

      ctx.save();
      ctx.globalAlpha = src.opacity;

      switch (src.type) {
        case 'color':
          this.drawColorSource(ctx, src, timestamp);
          break;
        case 'screen':
          this.drawScreenSource(ctx, src, timestamp);
          break;
        case 'camera':
          this.drawCameraSource(ctx, src, timestamp);
          break;
        case 'text':
          this.drawTextSource(ctx, src, timestamp);
          break;
        case 'alert':
          this.drawAlertSource(ctx, src, timestamp);
          break;
        case 'browser':
          this.drawBrowserSource(ctx, src, timestamp);
          break;
        case 'image':
          this.drawImageSource(ctx, src);
          break;
      }

      ctx.restore();
    }
  }

  private drawColorSource(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    if (src.config.gradient) {
      // Dynamic moving gradient effect
      const grad = ctx.createLinearGradient(
        src.x + Math.sin(time * 0.001) * 200,
        src.y,
        src.x + src.width,
        src.y + src.height
      );
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#4338ca');
      grad.addColorStop(1, '#065f46');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = src.config.color || '#18181b';
    }
    ctx.fillRect(src.x, src.y, src.width, src.height);
  }

  private drawScreenSource(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    const video = this.sourceScreenVideos.get(src.id) || this.screenVideoElement;
    if (video && video.readyState >= 2) {
      ctx.drawImage(video, src.x, src.y, src.width, src.height);
    } else {
      // High-quality simulated gaming screen capture
      this.drawSimulatedGameScreen(ctx, src, time);
    }
  }

  private drawSimulatedGameScreen(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    // Futuristic cyber grid background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(src.x, src.y, src.width, src.height);

    // Glowing grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    const gridSize = 80;
    const offset = (time * 0.05) % gridSize;

    ctx.beginPath();
    for (let x = src.x; x <= src.x + src.width; x += gridSize) {
      ctx.moveTo(x, src.y);
      ctx.lineTo(x, src.y + src.height);
    }
    for (let y = src.y + offset; y <= src.y + src.height; y += gridSize) {
      ctx.moveTo(src.x, y);
      ctx.lineTo(src.x + src.width, y);
    }
    ctx.stroke();

    // Central animated game/code scene
    const cx = src.x + src.width / 2;
    const cy = src.y + src.height / 2;

    // Glowing energy ring
    const radius = 180 + Math.sin(time * 0.003) * 20;
    const gradient = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
    gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Game HUD simulated text
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`FPS: 144 | LATENCY: 12ms | VRAM: 4.8GB`, src.x + 60, src.y + 60);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('CYBERPUNK ARENA 2088', cx - 220, cy - 40);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🎮 Real Screen Share available via "Sources -> Share Screen"', cx - 260, cy + 20);

    // Health / Energy bars
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(cx - 200, cy + 60, 400, 16);
    const hp = 0.5 + Math.sin(time * 0.002) * 0.3;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(cx - 200, cy + 60, 400 * hp, 16);
  }

  private drawCameraSource(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    const isRounded = src.config.shape === 'rounded' || src.config.shape === 'circle';
    const videoFit = src.config.videoFit || 'cover';

    // Camera Frame Border / Shadow
    ctx.shadowColor = 'rgba(124, 58, 237, 0.5)';
    ctx.shadowBlur = 18;

    if (isRounded) {
      ctx.beginPath();
      const rad = src.config.shape === 'circle' ? src.width / 2 : 24;
      ctx.roundRect(src.x, src.y, src.width, src.height, rad);
      ctx.clip();
    }

    const video = this.sourceCameraVideos.get(src.id) || this.webcamVideoElement;
    if (video && video.readyState >= 2) {
      this.drawFittedVideo(
        ctx,
        video,
        src.x,
        src.y,
        src.width,
        src.height,
        videoFit,
        !!src.config.mirror
      );
    } else {
      // Simulated Creator Camera Feed with motion
      this.drawSimulatedWebcam(ctx, src, time);
    }

    // Clean glowing border overlay
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    if (isRounded) {
      ctx.beginPath();
      const rad = src.config.shape === 'circle' ? src.width / 2 : 24;
      ctx.roundRect(src.x, src.y, src.width, src.height, rad);
      ctx.stroke();
    } else {
      ctx.strokeRect(src.x, src.y, src.width, src.height);
    }
    ctx.restore();

    // Streamer tag under webcam
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(src.x + 12, src.y + src.height - 38, Math.min(170, Math.max(100, src.width - 24)), 26);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('🔴 ALEX RIVERS', src.x + 22, src.y + src.height - 21);
  }

  private drawFittedVideo(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    fit: 'cover' | 'contain' | 'fill' = 'cover',
    mirror: boolean = false
  ): void {
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    let sx = 0, sy = 0, sw = vw, sh = vh;
    let targetX = dx, targetY = dy, targetW = dw, targetH = dh;

    if (fit === 'cover') {
      // Crop source video to fill destination box without any distortion
      const sourceAspect = vw / vh;
      const destAspect = dw / dh;

      if (destAspect > sourceAspect) {
        // Destination is wider: crop top/bottom of video
        sh = vw / destAspect;
        sy = (vh - sh) / 2;
      } else {
        // Destination is taller: crop left/right of video
        sw = vh * destAspect;
        sx = (vw - sw) / 2;
      }
    } else if (fit === 'contain') {
      // Letterbox / Pillarbox inside destination box without distortion
      const sourceAspect = vw / vh;
      const destAspect = dw / dh;

      if (destAspect > sourceAspect) {
        targetW = dh * sourceAspect;
        targetX = dx + (dw - targetW) / 2;
      } else {
        targetH = dw / sourceAspect;
        targetY = dy + (dh - targetH) / 2;
      }
      ctx.fillStyle = '#000000';
      ctx.fillRect(dx, dy, dw, dh);
    }

    ctx.save();
    if (mirror) {
      ctx.translate(targetX + targetW, targetY);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
    } else {
      ctx.drawImage(video, sx, sy, sw, sh, targetX, targetY, targetW, targetH);
    }
    ctx.restore();
  }

  private drawSimulatedWebcam(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    // Gradient studio lighting backdrop
    const grad = ctx.createLinearGradient(src.x, src.y, src.x + src.width, src.y + src.height);
    grad.addColorStop(0, '#18181b');
    grad.addColorStop(0.5, '#27272a');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(src.x, src.y, src.width, src.height);

    // Neon acoustic foam backdrop lights
    const cx = src.x + src.width / 2;
    const cy = src.y + src.height / 2;

    const lightGlow = ctx.createRadialGradient(src.x + src.width * 0.2, src.y + 60, 5, src.x + src.width * 0.2, src.y + 60, 160);
    lightGlow.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
    lightGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lightGlow;
    ctx.fillRect(src.x, src.y, src.width, src.height);

    // Simulated animated avatar head
    const headBob = Math.sin(time * 0.003) * 6;
    const headY = cy - 20 + headBob;

    // Body / Shoulders
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.ellipse(cx, src.y + src.height + 20, 140, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, headY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Headset
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, headY - 8, 64, Math.PI, 0);
    ctx.stroke();

    // Headset ear cups
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(cx - 72, headY - 18, 14, 40);
    ctx.fillRect(cx + 58, headY - 18, 14, 40);

    // Glasses / Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 36, headY - 10, 24, 16);
    ctx.fillRect(cx + 12, headY - 10, 24, 16);

    // Friendly smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, headY + 16, 18, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Camera prompt overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(src.x, src.y, src.width, 32);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px sans-serif';
    ctx.fillText('📷 Real Webcam: click "Enable Camera"', src.x + 16, src.y + 20);
  }

  private drawTextSource(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    const text = src.config.text || 'Sample Text Overlay';
    const lines = text.split('\n');
    const fontSize = src.config.fontSize || 28;

    if (src.config.banner) {
      // Rounded pill / card banner
      ctx.fillStyle = src.config.bgColor || 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(src.x, src.y, src.width, src.height, 12);
      ctx.fill();

      // Left accent bar
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(src.x, src.y, 6, src.height);
    }

    ctx.fillStyle = src.config.textColor || '#ffffff';
    ctx.font = `${src.config.fontBold ? 'bold ' : ''}${fontSize}px system-ui, sans-serif`;

    lines.forEach((line, index) => {
      ctx.fillText(line, src.x + 24, src.y + (index + 1) * (fontSize * 1.2) + (src.config.banner ? 4 : 0));
    });
  }

  private drawAlertSource(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    // Sliding alert banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(src.x, src.y, src.width, src.height, 14);
    ctx.fill();

    // Gradient accent border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.font = '24px sans-serif';
    ctx.fillText(src.config.alertIcon || '⭐', src.x + 16, src.y + 38);

    // Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(src.config.alertTitle || 'NEW FOLLOWER', src.x + 56, src.y + 26);

    // Subtitle
    ctx.fillStyle = '#f8fafc';
    ctx.font = '14px sans-serif';
    ctx.fillText(src.config.alertSubtitle || 'CyberKnight99 joined the crew!', src.x + 56, src.y + 46);
  }

  private drawBrowserSource(ctx: CanvasRenderingContext2D, src: SourceItem, time: number): void {
    // Simulated sleek Twitch/YouTube chat overlay widget
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(src.x, src.y, src.width, src.height, 16);
    ctx.fill();

    // Header
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(src.x, src.y, src.width, 42);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('💬 LIVE CHAT OVERLAY', src.x + 18, src.y + 26);

    // Chat messages
    const sampleChat = [
      { user: 'PixelWizard', color: '#38bdf8', msg: 'This compositor is so responsive!' },
      { user: 'NovaEcho', color: '#a855f7', msg: 'The scene transition looks clean 🚀' },
      { user: 'GlitchMaster', color: '#34d399', msg: 'Audio levels are balanced perfectly 🎧' },
      { user: 'StreamKing', color: '#fbbf24', msg: 'Let\'s go! High quality broadcast!' }
    ];

    let my = src.y + 70;
    for (const chat of sampleChat) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.beginPath();
      ctx.roundRect(src.x + 12, my, src.width - 24, 48, 8);
      ctx.fill();

      ctx.fillStyle = chat.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(chat.user, src.x + 22, my + 20);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.fillText(chat.msg, src.x + 22, my + 38);

      my += 58;
    }
  }

  private drawImageSource(ctx: CanvasRenderingContext2D, src: SourceItem): void {
    // Placeholder image graphics
    ctx.fillStyle = 'rgba(124, 58, 237, 0.2)';
    ctx.fillRect(src.x, src.y, src.width, src.height);
    ctx.strokeStyle = '#a855f7';
    ctx.strokeRect(src.x, src.y, src.width, src.height);
  }

  // ==========================================
  // HARDWARE MEDIA STREAMS (WEBCAM / SCREEN)
  // ==========================================

  async toggleWebcam(): Promise<boolean> {
    if (this.isWebcamActive()) {
      this.stopWebcam();
      return false;
    } else {
      return await this.startWebcam();
    }
  }

  async startWebcam(): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });

        this.webcamStream = stream;
        this.webcamVideoElement = document.createElement('video');
        this.webcamVideoElement.srcObject = stream;
        this.webcamVideoElement.autoplay = true;
        this.webcamVideoElement.muted = true;
        await this.webcamVideoElement.play();

        this.isWebcamActive.set(true);
        return true;
      }
    } catch (err) {
      console.warn('Could not access webcam, falling back to simulated camera feed:', err);
    }
    // Set to simulated mode if device access not granted
    this.isWebcamActive.set(false);
    return false;
  }

  stopWebcam(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
    }
    if (this.webcamVideoElement) {
      this.webcamVideoElement.srcObject = null;
      this.webcamVideoElement = null;
    }
    this.isWebcamActive.set(false);
  }

  async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenActive()) {
      this.stopScreenShare();
      return false;
    } else {
      return await this.startScreenShare();
    }
  }

  async startScreenShare(): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        this.screenStream = stream;
        this.screenVideoElement = document.createElement('video');
        this.screenVideoElement.srcObject = stream;
        this.screenVideoElement.autoplay = true;
        this.screenVideoElement.muted = true;
        await this.screenVideoElement.play();
        this.connectScreenAudio(stream);

        // Auto cleanup on stop sharing button from browser chrome
        stream.getVideoTracks()[0].onended = () => {
          this.stopScreenShare();
        };

        this.isScreenActive.set(true);
        return true;
      }
    } catch (err) {
      console.warn('Could not access screen share, using simulated game feed:', err);
    }
    this.isScreenActive.set(false);
    return false;
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    if (this.screenVideoElement) {
      this.screenVideoElement.srcObject = null;
      this.screenVideoElement = null;
    }
    this.isScreenActive.set(false);
    this.screenSourceNode?.disconnect();
    this.screenSourceNode = null;
    this.screenGainNode = null;
    if (this.screenAudioChannelId) {
      this.removeAudioChannel(this.screenAudioChannelId);
      this.screenAudioChannelId = null;
    }
  }

  async refreshAudioInputs(): Promise<void> {
  if (!navigator.mediaDevices?.enumerateDevices) return;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioInputs = devices.filter(device => device.kind === 'audioinput');
  const concreteAudioInputs = audioInputs.filter(device => device.deviceId !== 'default' && device.deviceId !== 'communications');
  this.availableAudioInputs.set(concreteAudioInputs.length ? concreteAudioInputs : audioInputs);
  this.availableVideoInputs.set(devices.filter(device => device.kind === 'videoinput'));
  }

  async prepareAudioInputs(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    await this.refreshAudioInputs();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    console.warn('Could not access microphones:', err);
    }
  await this.refreshAudioInputs();
  }

  async addMicrophone(deviceId?: string): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      video: false
    });
    const track = stream.getAudioTracks()[0];
    if (!track) {
      stream.getTracks().forEach(item => item.stop());
      return false;
    }

    const trackSettings = track.getSettings();
    const resolvedDeviceId = trackSettings.deviceId || deviceId;
    const name = track.label || this.availableAudioInputs().find(device => device.deviceId === deviceId)?.label || 'Microphone';
    const duplicate = this.audioChannels().find(channel =>
      channel.type === 'mic' &&
      ((resolvedDeviceId && channel.deviceId === resolvedDeviceId) || channel.name === name)
    );
    if (duplicate) {
      stream.getTracks().forEach(item => item.stop());
      return false;
    }

    const channel: AudioChannel = {
      id: `audio-mic-${Date.now()}`,
      name,
      type: 'mic',
      deviceId: resolvedDeviceId,
      volume: 85,
      muted: false,
      peakLevel: 0
    };
    this.addAudioChannel(channel);
    this.connectAudioInput(channel, stream);
    return true;
  } catch (err) {
    console.warn('Could not access microphone:', err);
    return false;
  }
  }

  async startSourceCapture(sourceId: string, type: 'camera' | 'screen', deviceId?: string): Promise<boolean> {
          if (type === 'camera') {
            if (!navigator.mediaDevices?.getUserMedia) return false;
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: deviceId ? { deviceId: { exact: deviceId } } : true,
                audio: false
              });
              const video = document.createElement('video');
              video.srcObject = stream;
              video.autoplay = true;
              video.muted = true;
              await video.play();
              this.sourceCameraStreams.set(sourceId, stream);
              this.sourceCameraVideos.set(sourceId, video);
              this.updateSource(sourceId, {
                config: {
                  ...this.getSource(sourceId)?.config,
                  deviceId: stream.getVideoTracks()[0]?.getSettings().deviceId
                }
              });
              return true;
            } catch (err) {
              console.warn('Could not access camera source:', err);
              return false;
            }
          }

          if (!navigator.mediaDevices?.getDisplayMedia) return false;
          try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            await video.play();
            this.sourceScreenStreams.set(sourceId, stream);
            this.sourceScreenVideos.set(sourceId, video);
            stream.getVideoTracks()[0].onended = () => this.stopSourceCapture(sourceId);
            if (stream.getAudioTracks().length) this.connectScreenAudio(stream, sourceId);
            return true;
          } catch (err) {
            console.warn('Could not access screen source:', err);
            return false;
          }
  }

  stopSourceCapture(sourceId: string): void {
          this.sourceCameraStreams.get(sourceId)?.getTracks().forEach(track => track.stop());
          this.sourceScreenStreams.get(sourceId)?.getTracks().forEach(track => track.stop());
          this.sourceCameraStreams.delete(sourceId);
          this.sourceScreenStreams.delete(sourceId);
          this.sourceCameraVideos.delete(sourceId);
          this.sourceScreenVideos.delete(sourceId);
          const audioChannelId = this.sourceScreenAudioChannels.get(sourceId);
          if (audioChannelId) {
            this.removeAudioChannel(audioChannelId);
            this.sourceScreenAudioChannels.delete(sourceId);
          }
  }

  private getSource(sourceId: string): SourceItem | null {
    return this.activeScene().sources.find(source => source.id === sourceId) || null;
  }

  removeAudioChannel(channelId: string): void {
        const runtime = this.audioInputs.get(channelId);
        runtime?.stream.getTracks().forEach(track => track.stop());
        runtime?.source.disconnect();
        runtime?.gain.disconnect();
        runtime?.analyser.disconnect();
        this.audioInputs.delete(channelId);
        const sceneId = this.audioChannelScenes.get(channelId);
        if (sceneId) {
          this.sceneAudioChannels.update(scenes => ({
            ...scenes,
            [sceneId]: (scenes[sceneId] || []).filter(channel => channel.id !== channelId)
          }));
          this.audioChannelScenes.delete(channelId);
        }
      }

      private addAudioChannel(channel: AudioChannel): void {
        const sceneId = this.activeSceneId();
        this.audioChannelScenes.set(channel.id, sceneId);
        this.sceneAudioChannels.update(scenes => ({
          ...scenes,
          [sceneId]: [...(scenes[sceneId] || []), channel]
        }));
      }

  private connectAudioInput(channel: AudioChannel, stream: MediaStream): void {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext ??= new AudioCtx();
        this.recordingAudioDestination ??= this.audioContext.createMediaStreamDestination();
        const source = this.audioContext.createMediaStreamSource(stream);
        const gain = this.audioContext.createGain();
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 64;
        gain.gain.value = this.getAudioChannelGain(channel.id);
        source.connect(gain);
        gain.connect(analyser);
        gain.connect(this.recordingAudioDestination);
        this.audioInputs.set(channel.id, { stream, source, gain, analyser });

        const data = new Uint8Array(analyser.frequencyBinCount);
        const updatePeak = () => {
          const runtime = this.audioInputs.get(channel.id);
          if (!runtime) return;
          analyser.getByteFrequencyData(data);
          const average = data.reduce((sum, value) => sum + value, 0) / data.length;
          this.updateAudioChannelPeak(channel.id, Math.min(100, Math.round((average / 128) * 100)));
          requestAnimationFrame(updatePeak);
        };
        requestAnimationFrame(updatePeak);
  }

  private connectScreenAudio(stream: MediaStream, sourceId = 'screen'): void {
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const channel: AudioChannel = {
        id: `audio-screen-${sourceId}-${Date.now()}`,
        name: audioTrack.label || 'Shared screen audio',
        type: 'desktop',
        volume: 70,
        muted: false,
        peakLevel: 0
      };
      if (sourceId === 'screen') this.screenAudioChannelId = channel.id;
      if (sourceId !== 'screen') this.sourceScreenAudioChannels.set(sourceId, channel.id);
      this.addAudioChannel(channel);
      this.connectAudioInput(channel, new MediaStream([audioTrack]));
    } catch (err) {
      console.warn('System audio setup failed:', err);
    }
  }

  // ==========================================
  // SCENE MANAGEMENT
  // ==========================================

  switchScene(sceneId: string): void {
    this.activeSceneId.set(sceneId);
    const scene = this.scenes().find(s => s.id === sceneId);
    if (scene && scene.sources.length > 0) {
      this.selectedSourceId.set(scene.sources[0].id);
    } else {
      this.selectedSourceId.set(null);
    }
  }

  addScene(name: string): void {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name,
      icon: 'pi pi-folder',
      sources: [
        {
          id: `src-${Date.now()}-bg`,
          name: 'Background Color',
          type: 'color',
          visible: true,
          locked: false,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          opacity: 1,
          zIndex: 1,
          config: { color: '#09090b' }
        }
      ]
    };
    this.scenes.update(list => [...list, newScene]);
    this.switchScene(newScene.id);
  }

  duplicateScene(sceneId: string): void {
    const target = this.scenes().find(s => s.id === sceneId);
    if (!target) return;

    const duplicated: Scene = {
      id: `scene-${Date.now()}`,
      name: `${target.name} (Copy)`,
      icon: target.icon,
      sources: target.sources.map(src => ({
        ...src,
        id: `src-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      }))
    };

    this.scenes.update(list => [...list, duplicated]);
    this.switchScene(duplicated.id);
  }

  removeScene(sceneId: string): void {
    if (this.scenes().length <= 1) return; // Keep at least 1 scene
    const scene = this.scenes().find(item => item.id === sceneId);
    if (!scene) return;

    for (const channel of this.sceneAudioChannels()[sceneId] || []) {
      this.removeAudioChannel(channel.id);
    }
    for (const source of scene.sources) {
      this.stopSourceCapture(source.id);
    }
    this.sceneAudioChannels.update(channelsByScene => {
      const { [sceneId]: _removed, ...remaining } = channelsByScene;
      return remaining;
    });

    this.scenes.update(list => list.filter(s => s.id !== sceneId));
    if (this.activeSceneId() === sceneId) {
      this.switchScene(this.scenes()[0].id);
    }
  }

  renameScene(sceneId: string, newName: string): void {
    this.scenes.update(list =>
      list.map(s => (s.id === sceneId ? { ...s, name: newName } : s))
    );
  }

  // ==========================================
  // SOURCE MANAGEMENT
  // ==========================================

  selectSource(sourceId: string | null): void {
    this.selectedSourceId.set(sourceId);
  }

  addSource(type: SourceType, name?: string, customConfig?: Partial<SourceConfig>): string | null {
    const currentScene = this.activeScene();
    if (!currentScene) return null;

    const id = `src-${Date.now()}`;
    let defaultW = 640;
    let defaultH = 360;
    let defaultX = 100;
    let defaultY = 100;

    let config: SourceConfig = customConfig || {};

    if (type === 'camera') {
      name = name || 'Webcam';
      defaultW = 480;
      defaultH = 360;
      defaultX = 1380;
      defaultY = 660;
      config = { shape: 'rounded', mirror: true, ...config };
    } else if (type === 'screen') {
      name = name || 'Display Capture';
      defaultW = 1920;
      defaultH = 1080;
      defaultX = 0;
      defaultY = 0;
    } else if (type === 'text') {
      name = name || 'Text Banner';
      defaultW = 600;
      defaultH = 80;
      config = {
        text: 'Workbench Studio Broadcast',
        textColor: '#ffffff',
        fontSize: 28,
        bgColor: '#7c3aed',
        fontBold: true,
        banner: true,
        ...config
      };
    } else if (type === 'alert') {
      name = name || 'Stream Alert';
      defaultW = 400;
      defaultH = 65;
      config = {
        alertTitle: 'NEW SUBSCRIBER',
        alertSubtitle: 'Welcome to the VIP club!',
        alertIcon: '💎',
        ...config
      };
    } else if (type === 'browser') {
      name = name || 'Chat Box Widget';
      defaultW = 420;
      defaultH = 600;
      defaultX = 1440;
      defaultY = 80;
    }

    const newSource: SourceItem = {
      id,
      name: name || `New ${type} source`,
      type,
      visible: true,
      locked: false,
      x: defaultX,
      y: defaultY,
      width: defaultW,
      height: defaultH,
      opacity: 1,
      zIndex: currentScene.sources.length + 1,
      config
    };

    this.scenes.update(list =>
      list.map(s => {
        if (s.id === currentScene.id) {
          return { ...s, sources: [...s.sources, newSource] };
        }
        return s;
      })
    );

    this.selectedSourceId.set(id);
    return id;
  }

  updateSource(id: string, updates: Partial<SourceItem>): void {
    const currentScene = this.activeScene();
    if (!currentScene) return;

    this.scenes.update(list =>
      list.map(s => {
        if (s.id === currentScene.id) {
          return {
            ...s,
            sources: s.sources.map(src => (src.id === id ? { ...src, ...updates } : src))
          };
        }
        return s;
      })
    );
  }

  updateSourceTransform(id: string, x: number, y: number, width: number, height: number): void {
    const currentScene = this.activeScene();
    if (!currentScene) return;

    this.scenes.update(list =>
      list.map(s => {
        if (s.id === currentScene.id) {
          return {
            ...s,
            sources: s.sources.map(src =>
              src.id === id ? { ...src, x, y, width, height } : src
            )
          };
        }
        return s;
      })
    );
  }

  removeSource(id: string): void {
    const currentScene = this.activeScene();
    if (!currentScene) return;

    this.scenes.update(list =>
      list.map(s => {
        if (s.id === currentScene.id) {
          return { ...s, sources: s.sources.filter(src => src.id !== id) };
        }
        return s;
      })
    );

    if (this.selectedSourceId() === id) {
      this.selectedSourceId.set(null);
    }
    this.stopSourceCapture(id);
  }

  toggleSourceVisibility(id: string): void {
    const src = this.selectedSource();
    const currentScene = this.activeScene();
    if (!currentScene) return;

    this.scenes.update(list =>
      list.map(s => {
        if (s.id === currentScene.id) {
          return {
            ...s,
            sources: s.sources.map(item => (item.id === id ? { ...item, visible: !item.visible } : item))
          };
        }
        return s;
      })
    );
  }

  toggleSourceLock(id: string): void {
    const currentScene = this.activeScene();
    if (!currentScene) return;

    this.scenes.update(list =>
      list.map(s => {
        if (s.id === currentScene.id) {
          return {
            ...s,
            sources: s.sources.map(item => (item.id === id ? { ...item, locked: !item.locked } : item))
          };
        }
        return s;
      })
    );
  }

  reorderSource(id: string, direction: 'up' | 'down'): void {
    const currentScene = this.activeScene();
    if (!currentScene) return;

    const sources = [...currentScene.sources].sort((a, b) => a.zIndex - b.zIndex);
    const index = sources.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < sources.length - 1) {
      const tempZ = sources[index].zIndex;
      sources[index].zIndex = sources[index + 1].zIndex;
      sources[index + 1].zIndex = tempZ;
    } else if (direction === 'down' && index > 0) {
      const tempZ = sources[index].zIndex;
      sources[index].zIndex = sources[index - 1].zIndex;
      sources[index - 1].zIndex = tempZ;
    }

    this.scenes.update(list =>
      list.map(s => (s.id === currentScene.id ? { ...s, sources } : s))
    );
  }

  reorderSourcesList(fromIndex: number, toIndex: number): void {
    const currentScene = this.activeScene();
    if (!currentScene) return;

    const sources = [...currentScene.sources];
    if (fromIndex < 0 || fromIndex >= sources.length || toIndex < 0 || toIndex >= sources.length) {
      return;
    }

    const [moved] = sources.splice(fromIndex, 1);
    sources.splice(toIndex, 0, moved);

    // Reassign z-index so index 0 is topmost
    const total = sources.length;
    sources.forEach((s, idx) => {
      s.zIndex = total - idx;
    });

    this.scenes.update(list =>
      list.map(s => (s.id === currentScene.id ? { ...s, sources } : s))
    );
  }

  // Layout Presets (PiP, Fullscreen, Split)
  applyLayoutPreset(preset: PresetLayout): void {
    const src = this.selectedSource();
    if (!src) return;

    const canvasW = this.broadcastState().resolution.width;
    const canvasH = this.broadcastState().resolution.height;

    switch (preset) {
      case 'fullscreen':
        this.updateSource(src.id, { x: 0, y: 0, width: canvasW, height: canvasH });
        break;
      case 'pip-br':
        this.updateSource(src.id, {
          x: canvasW - 460,
          y: canvasH - 380,
          width: 420,
          height: 340
        });
        break;
      case 'pip-tr':
        this.updateSource(src.id, {
          x: canvasW - 460,
          y: 40,
          width: 420,
          height: 340
        });
        break;
      case 'split-h':
        this.updateSource(src.id, {
          x: 0,
          y: 0,
          width: canvasW / 2,
          height: canvasH
        });
        break;
      case 'side-by-side':
        this.updateSource(src.id, {
          x: canvasW / 2,
          y: 0,
          width: canvasW / 2,
          height: canvasH
        });
        break;
    }
  }

  // ==========================================
  // AUDIO MIXER
  // ==========================================

  updateAudioChannelVolume(channelId: string, volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(100, volume));
    this.updateAudioChannels(channels =>
      channels.map(c => (c.id === channelId ? { ...c, volume: normalizedVolume } : c))
    );
    const channel = this.audioChannels().find(item => item.id === channelId);
    this.getAudioGainNode(channelId)?.gain.setValueAtTime(
      channel?.muted ? 0 : normalizedVolume / 100,
      this.audioContext?.currentTime || 0
    );
  }

  toggleAudioChannelMute(channelId: string): void {
    const channel = this.audioChannels().find(item => item.id === channelId);
    this.updateAudioChannels(channels =>
      channels.map(c => (c.id === channelId ? { ...c, muted: !c.muted } : c))
    );
    const gain = this.getAudioGainNode(channelId);
    if (gain && channel) {
      gain.gain.setValueAtTime(channel.muted ? 0 : channel.volume / 100, this.audioContext?.currentTime || 0);
    }
  }

  updateAudioChannelPeak(channelId: string, peakLevel: number): void {
    const sceneId = this.audioChannelScenes.get(channelId);
    if (!sceneId) return;
    this.sceneAudioChannels.update(scenes => ({
      ...scenes,
      [sceneId]: (scenes[sceneId] || []).map(channel =>
        channel.id === channelId ? { ...channel, peakLevel } : channel
      )
    }));
  }

  private updateAudioChannels(updater: (channels: AudioChannel[]) => AudioChannel[]): void {
    const sceneId = this.activeSceneId();
    this.sceneAudioChannels.update(scenes => ({
      ...scenes,
      [sceneId]: updater(scenes[sceneId] || [])
    }));
  }

  private getAudioChannelGain(channelId: string): number {
    const channel = this.audioChannels().find(item => item.id === channelId);
    return channel && !channel.muted ? channel.volume / 100 : 0;
  }

  private getAudioGainNode(channelId: string): GainNode | null {
    const runtime = this.audioInputs.get(channelId);
    if (runtime) return runtime.gain;
    if (channelId === 'audio-mic') return this.micGainNode;
    if (channelId === 'audio-desktop') return this.screenGainNode;
    return null;
  }

  private initSimulatedAudioMeters(): void {
    if (typeof window === 'undefined') return;

    this.audioMeterInterval = setInterval(() => {
      this.updateAudioChannels(channels =>
        channels.map(c => {
          if (c.muted) return { ...c, peakLevel: 0 };
          // If real mic is active, it updates via requestAnimationFrame
          if (c.id === 'audio-mic' && this.isWebcamActive()) {
            return c;
          }
          // Dynamic simulated fluctuation
          const variance = (Math.random() - 0.45) * 15;
          const target = Math.max(5, Math.min(95, c.volume * 0.7 + variance));
          return { ...c, peakLevel: Math.round(target) };
        })
      );
    }, 120);
  }

  // ==========================================
  // BROADCASTING & RECORDING
  // ==========================================

  toggleGoLive(): void {
    if (this.broadcastState().isLive) {
      this.stopBroadcast();
    } else {
      this.startBroadcast();
    }
  }

  startBroadcast(): void {
    this.broadcastState.update(s => ({
      ...s,
      isLive: true,
      liveDuration: 0,
      bitrateKbps: 6000
    }));

    if (this.programCanvas) {
      try {
        const stream = this.programCanvas.captureStream(60);
        this.broadcastService.setLiveStream(stream, true);
      } catch (err) {
        console.warn('Canvas captureStream error:', err);
      }
    }

    if (this.liveTimerInterval) clearInterval(this.liveTimerInterval);
    this.liveTimerInterval = setInterval(() => {
      this.broadcastState.update(s => ({
        ...s,
        liveDuration: s.liveDuration + 1,
        // Small bitrate jitter for realism
        bitrateKbps: 5800 + Math.round(Math.random() * 400)
      }));
      this.broadcastService.incrementViewers(Math.floor(Math.random() * 3));
    }, 1000);
  }

  stopBroadcast(): void {
    this.broadcastState.update(s => ({ ...s, isLive: false }));
    this.broadcastService.setLiveStream(null, false);
    if (this.liveTimerInterval) {
      clearInterval(this.liveTimerInterval);
      this.liveTimerInterval = null;
    }
  }

  toggleRecording(): void {
    if (this.broadcastState().isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording(): void {
    if (!this.programCanvas) return;

    try {
      const stream = this.programCanvas.captureStream(60);
      if (this.recordingAudioDestination) {
        for (const track of this.recordingAudioDestination.stream.getAudioTracks()) {
          stream.addTrack(track);
        }
      }
      this.recordedChunks = [];

      const requestedMimeTypes: Record<RecordingFormat, string[]> = {
        'webm-vp9': ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm'],
        'webm-vp8': ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'],
        mp4: ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4']
      };
      const mimeType = requestedMimeTypes[this.recordingFormat()].find(type => MediaRecorder.isTypeSupported(type))
        || requestedMimeTypes['webm-vp9'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) {
        throw new Error('This browser does not support a recording format.');
      }
      const fileExtension = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        // Auto trigger browser download
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `workbench-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Add to VODs in Channel service so user can watch it!
        const durationSec = this.broadcastState().recordDuration;
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        this.channelService.addRecordedVOD({
          id: `vod-rec-${Date.now()}`,
          title: `Workbench Session Recording (${new Date().toLocaleDateString()})`,
          duration: durationStr,
          views: 1,
          date: 'Just now',
          thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
          blobUrl,
          category: 'Web Studio Broadcast'
        });
      };

      this.mediaRecorder.start(1000);

      this.broadcastState.update(s => ({ ...s, isRecording: true, recordDuration: 0 }));

      if (this.recordTimerInterval) clearInterval(this.recordTimerInterval);
      this.recordTimerInterval = setInterval(() => {
        this.broadcastState.update(s => ({ ...s, recordDuration: s.recordDuration + 1 }));
      }, 1000);

    } catch (err) {
      console.error('MediaRecorder start failed:', err);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.broadcastState.update(s => ({ ...s, isRecording: false }));
    if (this.recordTimerInterval) {
      clearInterval(this.recordTimerInterval);
      this.recordTimerInterval = null;
    }
  }

  takeSnapshot(): void {
    if (!this.programCanvas) return;
    const dataUrl = this.programCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `workbench-snapshot-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  toggleStudioMode(): void {
    this.broadcastState.update(s => ({ ...s, studioMode: !s.studioMode }));
  }

  setResolution(width: number, height: number, label: string): void {
    this.broadcastState.update(s => ({
      ...s,
      resolution: { width, height, label }
    }));
  }

  setRecordingFormat(format: RecordingFormat): void {
    this.recordingFormat.set(format);
  }
}
