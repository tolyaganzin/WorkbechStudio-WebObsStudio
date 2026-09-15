import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CdkDragDrop, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { StudioService } from '../../core/services/studio.service';
import { BroadcastService } from '../../core/services/broadcast.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SourceItem, SourceType, PresetLayout, RecordingFormat } from '../../core/models/studio.models';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CdkDrag,
    CdkDropList,
    ButtonModule,
    TooltipModule,
    DialogModule,
    SliderModule,
    ToggleSwitchModule
  ],
  templateUrl: "./studio.component.html"
})
export class StudioComponent implements OnInit, AfterViewInit, OnDestroy {
  studio = inject(StudioService);
  broadcast = inject(BroadcastService);
  auth = inject(AuthService);
  theme = inject(ThemeService);

  @ViewChild('programCanvas') programCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('viewportContainer') viewportRef?: ElementRef<HTMLDivElement>;

  readonly Math = Math;
  showInspector = true;
  showAddSourceModal = false;
  showNewSceneModal = false;
  showSettingsModal = false;
  showStreamKey = false;
  newSceneName = '';
  selectedAudioDeviceId = '';
  selectedVideoDeviceId = '';

  // ==========================================
  // FREE PAN & ZOOM VIEWPORT STATE
  // ==========================================
  readonly zoomLevel = signal<number>(0.75);
  readonly panOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  readonly activeTool = signal<'select' | 'pan'>('select');
  readonly lockAspectRatio = signal<boolean>(false);

  isPanning = false;
  private panStart = { x: 0, y: 0 };
  private panOffsetStart = { x: 0, y: 0 };
  isSpacePressed = false;

  // ==========================================
  // 8-POINT DIRECT RESIZE, RESHAPE & DRAG STATE
  // ==========================================
  isDraggingItem = false;
  isResizingItem = false;
  activeResizeHandle: ResizeHandle | null = null;
  private interactionStartMouse = { x: 0, y: 0 };
  private interactionStartSource = { x: 0, y: 0, width: 0, height: 0 };

  get baseDisplayWidth(): number {
    const res = this.studio.broadcastState().resolution;
    return res.width === 1080 && res.height === 1920 ? 450 : 960;
  }

  get baseDisplayHeight(): number {
    const res = this.studio.broadcastState().resolution;
    return res.width === 1080 && res.height === 1920 ? 800 : 540;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.programCanvasRef && this.programCanvasRef.nativeElement) {
      this.studio.registerProgramCanvas(this.programCanvasRef.nativeElement);
    }
    // Auto fit initial canvas on startup
    setTimeout(() => this.zoomFit(), 100);
  }

  ngOnDestroy(): void {}

  formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    const displayMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}:${displayMins < 10 ? '0' : ''}${displayMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${displayMins < 10 ? '0' : ''}${displayMins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  toggleWebcam(): void {
    this.studio.toggleWebcam();
  }

  toggleScreenShare(): void {
    this.studio.toggleScreenShare();
  }

  onResolutionChange(label: string): void {
    if (label.includes('1080p')) {
      this.studio.setResolution(1920, 1080, '1080p 60fps');
    } else if (label.includes('720p')) {
      this.studio.setResolution(1280, 720, '720p 60fps');
    } else if (label.includes('Vertical') || label.includes('TikTok')) {
      this.studio.setResolution(1080, 1920, 'TikTok/Vertical');
    }
    setTimeout(() => this.zoomFit(), 50);
  }

  // ==========================================
  // VIEWPORT PAN & ZOOM CONTROLS
  // ==========================================

  zoomIn(): void {
    this.zoomLevel.update(z => Math.min(3.0, +(z + 0.15).toFixed(2)));
  }

  zoomOut(): void {
    this.zoomLevel.update(z => Math.max(0.25, +(z - 0.15).toFixed(2)));
  }

  setZoom(level: number): void {
    this.zoomLevel.set(Math.max(0.25, Math.min(3.0, level)));
  }

  resetPan(): void {
    this.panOffset.set({ x: 0, y: 0 });
  }

  zoomFit(): void {
    if (!this.viewportRef) return;
    const vp = this.viewportRef.nativeElement;
    const availableW = vp.clientWidth - 80;
    const availableH = vp.clientHeight - 80;

    const scaleX = availableW / this.baseDisplayWidth;
    const scaleY = availableH / this.baseDisplayHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.2);

    this.zoomLevel.set(+Math.max(0.25, fitScale).toFixed(2));
    this.panOffset.set({ x: 0, y: 0 });
  }

  onViewportWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.89;
    this.zoomLevel.update(z => {
      const next = z * zoomFactor;
      return +Math.min(3.0, Math.max(0.25, next)).toFixed(2);
    });
  }

  onViewportPointerDown(event: PointerEvent): void {
    // If middle click or space pressed or pan tool is active, start panning
    if (event.button === 1 || this.activeTool() === 'pan' || this.isSpacePressed) {
      event.preventDefault();
      this.isPanning = true;
      this.panStart = { x: event.clientX, y: event.clientY };
      this.panOffsetStart = { ...this.panOffset() };
    }
  }

  onCanvasPointerDown(event: PointerEvent): void {
    // If in Pan mode, delegate to viewport pan
    if (this.activeTool() === 'pan' || this.isSpacePressed || event.button === 1) {
      this.onViewportPointerDown(event);
      return;
    }

    const canvas = this.programCanvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = this.studio.broadcastState().resolution.width / rect.width;
    const scaleY = this.studio.broadcastState().resolution.height / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    // The first source in the layer list is the topmost layer.
    const sources = [...this.studio.activeScene().sources];
    let hitSource: SourceItem | null = null;

    for (const src of sources) {
      if (!src.visible) continue;
      if (
        clickX >= src.x &&
        clickX <= src.x + src.width &&
        clickY >= src.y &&
        clickY <= src.y + src.height
      ) {
        hitSource = src;
        break;
      }
    }

    if (hitSource) {
      const wasSelected = this.studio.selectedSourceId() === hitSource.id;
      this.studio.selectSource(hitSource.id);
      this.showInspector = true;
      // A first click selects the layer; dragging starts only for the
      // already-selected layer so an accidental click cannot move another source.
      if (wasSelected) {
        this.startDragItem(event, hitSource);
      }
    } else {
      this.studio.selectSource(null);
    }
  }

  // ==========================================
  // DIRECT ITEM DRAG, RESIZE & RESHAPE
  // ==========================================

  startDragItem(event: PointerEvent, source: SourceItem): void {
    if (source.locked || this.activeTool() === 'pan' || this.isSpacePressed) return;
    event.stopPropagation();
    event.preventDefault();

    this.isDraggingItem = true;
    this.interactionStartMouse = { x: event.clientX, y: event.clientY };
    this.interactionStartSource = {
      x: source.x,
      y: source.y,
      width: source.width,
      height: source.height
    };
  }

  startResize(event: PointerEvent, handle: ResizeHandle, source: SourceItem): void {
    if (source.locked) return;
    event.stopPropagation();
    event.preventDefault();

    this.isResizingItem = true;
    this.activeResizeHandle = handle;
    this.interactionStartMouse = { x: event.clientX, y: event.clientY };
    this.interactionStartSource = {
      x: source.x,
      y: source.y,
      width: source.width,
      height: source.height
    };
  }

  dropSource(event: CdkDragDrop<SourceItem[]>): void {
    this.studio.reorderSourcesList(event.previousIndex, event.currentIndex);
  }

  @HostListener('window:pointermove', ['$event'])
  onWindowPointerMove(event: PointerEvent): void {
    // 1. Panning Viewport
    if (this.isPanning) {
      const dx = event.clientX - this.panStart.x;
      const dy = event.clientY - this.panStart.y;
      this.panOffset.set({
        x: this.panOffsetStart.x + dx,
        y: this.panOffsetStart.y + dy
      });
      return;
    }

    const canvas = this.programCanvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const resolution = this.studio.broadcastState().resolution;
    const canvasScaleX = resolution.width / rect.width;
    const canvasScaleY = resolution.height / rect.height;

    const mouseDeltaX = (event.clientX - this.interactionStartMouse.x) * canvasScaleX;
    const mouseDeltaY = (event.clientY - this.interactionStartMouse.y) * canvasScaleY;

    // 2. Dragging Selected Source (Translation)
    if (this.isDraggingItem) {
      const sel = this.studio.selectedSource();
      if (!sel) return;

      const newX = Math.round(this.interactionStartSource.x + mouseDeltaX);
      const newY = Math.round(this.interactionStartSource.y + mouseDeltaY);

      this.studio.updateSource(sel.id, { x: newX, y: newY });
      return;
    }

    // 3. Resizing & Reshaping 8 Handles
    if (this.isResizingItem && this.activeResizeHandle) {
      const sel = this.studio.selectedSource();
      if (!sel) return;

      const start = this.interactionStartSource;
      const handle = this.activeResizeHandle;
      const minSize = 20;

      let newX = start.x;
      let newY = start.y;
      let newWidth = start.width;
      let newHeight = start.height;

      // Handle calculations
      switch (handle) {
        case 'se': // Bottom-Right
          newWidth = Math.max(minSize, start.width + mouseDeltaX);
          newHeight = Math.max(minSize, start.height + mouseDeltaY);
          break;

        case 'e': // Reshape Width (Right)
          newWidth = Math.max(minSize, start.width + mouseDeltaX);
          break;

        case 's': // Reshape Height (Bottom)
          newHeight = Math.max(minSize, start.height + mouseDeltaY);
          break;

        case 'nw': // Top-Left
          newWidth = Math.max(minSize, start.width - mouseDeltaX);
          newHeight = Math.max(minSize, start.height - mouseDeltaY);
          newX = start.x + (start.width - newWidth);
          newY = start.y + (start.height - newHeight);
          break;

        case 'w': // Reshape Width (Left)
          newWidth = Math.max(minSize, start.width - mouseDeltaX);
          newX = start.x + (start.width - newWidth);
          break;

        case 'n': // Reshape Height (Top)
          newHeight = Math.max(minSize, start.height - mouseDeltaY);
          newY = start.y + (start.height - newHeight);
          break;

        case 'ne': // Top-Right
          newWidth = Math.max(minSize, start.width + mouseDeltaX);
          newHeight = Math.max(minSize, start.height - mouseDeltaY);
          newY = start.y + (start.height - newHeight);
          break;

        case 'sw': // Bottom-Left
          newWidth = Math.max(minSize, start.width - mouseDeltaX);
          newHeight = Math.max(minSize, start.height + mouseDeltaY);
          newX = start.x + (start.width - newWidth);
          break;
      }

      // Proportional aspect ratio enforcement for corner handles if locked
      if (this.lockAspectRatio() && (handle === 'nw' || handle === 'ne' || handle === 'se' || handle === 'sw')) {
        const aspect = start.width / start.height;
        newHeight = Math.round(newWidth / aspect);
        if (handle === 'nw' || handle === 'ne') {
          newY = start.y + (start.height - newHeight);
        }
      }

      this.studio.updateSourceTransform(
        sel.id,
        Math.round(newX),
        Math.round(newY),
        Math.round(newWidth),
        Math.round(newHeight)
      );
    }
  }

  @HostListener('window:pointerup')
  onWindowPointerUp(): void {
    this.isPanning = false;
    this.isDraggingItem = false;
    this.isResizingItem = false;
    this.activeResizeHandle = null;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' && !this.isSpacePressed) {
      // Don't trigger if user is typing in an input
      if ((event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      this.isSpacePressed = true;
    } else if (event.key === 'v' || event.key === 'V') {
      if ((event.target as HTMLElement).tagName !== 'INPUT' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
        this.activeTool.set('select');
      }
    } else if (event.key === 'h' || event.key === 'H') {
      if ((event.target as HTMLElement).tagName !== 'INPUT' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
        this.activeTool.set('pan');
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      this.isSpacePressed = false;
    }
  }

  // ==========================================
  // SOURCE CONFIG & SCENE MANAGEMENT
  // ==========================================

  updateSourceProp(prop: keyof SourceItem, val: any): void {
    const src = this.studio.selectedSource();
    if (!src) return;
    this.studio.updateSource(src.id, { [prop]: val });
  }

  updateSourceConfig(key: string, val: any): void {
    const src = this.studio.selectedSource();
    if (!src) return;
    const newConfig = { ...src.config, [key]: val };
    this.studio.updateSource(src.id, { config: newConfig });
  }

  onRecordingFormatChange(format: RecordingFormat): void {
    this.studio.setRecordingFormat(format);
  }

  addSelectedMicrophone(): void {
    void this.studio.addMicrophone(this.selectedAudioDeviceId || undefined);
  }

  deleteSelectedSource(): void {
    const src = this.studio.selectedSource();
    if (src) {
      this.studio.removeSource(src.id);
    }
  }

  addNewSource(type: SourceType): void {
    const sourceId = this.studio.addSource(type);
    if (sourceId && (type === 'camera' || type === 'screen')) {
      void this.studio.startSourceCapture(sourceId, type);
    }
    this.showAddSourceModal = false;
    this.showInspector = true;
  }

  reconnectSelectedCapture(): void {
    const source = this.studio.selectedSource();
    if (source?.type === 'camera' || source?.type === 'screen') {
      void this.studio.startSourceCapture(source.id, source.type, source.type === 'camera' ? this.selectedVideoDeviceId || undefined : undefined);
    }
  }

  createNewScene(): void {
    if (!this.newSceneName.trim()) return;
    this.studio.addScene(this.newSceneName.trim());
    this.newSceneName = '';
    this.showNewSceneModal = false;
  }
}
