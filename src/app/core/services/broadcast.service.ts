import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  // Real media stream produced by the Studio canvas compositor
  private mediaStreamSource = new BehaviorSubject<MediaStream | null>(null);
  readonly mediaStream$: Observable<MediaStream | null> = this.mediaStreamSource.asObservable();

  readonly isBroadcasting = signal<boolean>(false);
  readonly streamTitle = signal<string>('🔴 Coding Live: Building Web OBS Studio in Angular & Tailwind!');
  readonly streamCategory = signal<string>('Software & Game Dev');
  readonly currentViewerCount = signal<number>(1420);
  readonly streamStartTime = signal<Date | null>(null);

  setLiveStream(stream: MediaStream | null, isLive: boolean): void {
    this.mediaStreamSource.next(stream);
    this.isBroadcasting.set(isLive);
    if (isLive) {
      this.streamStartTime.set(new Date());
    } else {
      this.streamStartTime.set(null);
    }
  }

  getLiveStreamSnapshot(): MediaStream | null {
    return this.mediaStreamSource.getValue();
  }

  updateMetadata(title: string, category: string): void {
    this.streamTitle.set(title);
    this.streamCategory.set(category);
  }

  incrementViewers(delta: number): void {
    this.currentViewerCount.update(c => Math.max(1, c + delta));
  }
}
