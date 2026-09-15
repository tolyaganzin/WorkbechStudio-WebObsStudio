import { Component, inject, signal, computed, effect, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../core/services/channel.service';
import { BroadcastService } from '../../core/services/broadcast.service';
import { StudioService } from '../../core/services/studio.service';
import { AuthService } from '../../core/services/auth.service';
import { Streamer } from '../../core/models/platform.models';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, TooltipModule, DialogModule],
  templateUrl: './channel.component.html',
})
export class ChannelComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  channelService = inject(ChannelService);
  broadcastService = inject(BroadcastService);
  studioService = inject(StudioService);
  authService = inject(AuthService);

  @ViewChild('liveVideoPlayer') liveVideoPlayerRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('chatContainer') chatContainerRef?: ElementRef<HTMLDivElement>;

  channelId = signal<string>('alexrivers');
  activeTab = signal<'home' | 'vods' | 'clips' | 'about'>('home');
  chatInputText = '';

  sendSuperChatModal = false;
  showSubscribeModal = false;
  selectedSuperChatAmount = '$10';
  superChatMessage = '';

  private streamSub?: Subscription;

  readonly channel = computed(() => {
    return this.channelService.getChannelById(this.channelId()) || this.channelService.channels()[0];
  });

  readonly isCurrentBroadcaster = computed(() => {
    return this.channelId() === 'alexrivers';
  });

  readonly isFollowing = computed(() => {
    return this.channelService.isFollowing(this.channelId());
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.channelId.set(params['id']);
      }
    });

    // Connect to Studio live stream if broadcasting
    this.streamSub = this.broadcastService.mediaStream$.subscribe(stream => {
      if (this.liveVideoPlayerRef && this.liveVideoPlayerRef.nativeElement && stream) {
        this.liveVideoPlayerRef.nativeElement.srcObject = stream;
      }
    });
  }

  ngOnDestroy(): void {
    this.streamSub?.unsubscribe();
  }

  toggleFollow(): void {
    this.channelService.toggleFollow(this.channelId());
  }

  appendEmote(emote: string): void {
    this.chatInputText += ` ${emote} `;
  }

  sendChat(): void {
    if (!this.chatInputText.trim()) return;
    const user = this.authService.currentUser();
    this.channelService.sendChatMessage({
      user: user?.name || 'AnonymousViewer',
      avatar: user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Viewer',
      badge: user?.role === 'creator' ? 'broadcaster' : 'sub',
      text: this.chatInputText.trim()
    });
    this.chatInputText = '';

    // Scroll to bottom
    setTimeout(() => {
      if (this.chatContainerRef) {
        this.chatContainerRef.nativeElement.scrollTop = this.chatContainerRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  confirmSuperChat(): void {
    const user = this.authService.currentUser();
    this.channelService.sendChatMessage({
      user: user?.name || 'GenerousSupporter',
      avatar: user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Supporter',
      badge: 'vip',
      isSuperChat: true,
      superChatAmount: this.selectedSuperChatAmount,
      text: this.superChatMessage || 'Great broadcast!'
    });
    this.sendSuperChatModal = false;
    this.superChatMessage = '';
  }
}
