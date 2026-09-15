import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChannelService } from '../../core/services/channel.service';
import { StudioService } from '../../core/services/studio.service';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, TooltipModule],
  templateUrl: "./profile.component.html",

})
export class ProfileComponent {
  auth = inject(AuthService);
  channelService = inject(ChannelService);
  studio = inject(StudioService);
  theme = inject(ThemeService);

  showKey = false;
  readonly toastMessage = signal<string | null>(null);

  regenerateKey(): void {
    const newKey = this.auth.regenerateStreamKey();
    this.showToast('Stream key has been regenerated!');
  }

  copyText(text: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard!');
    }
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 2500);
  }
}
