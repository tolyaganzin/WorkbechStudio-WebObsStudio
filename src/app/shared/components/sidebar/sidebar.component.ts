import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChannelService } from '../../../core/services/channel.service';
import { StudioService } from '../../../core/services/studio.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TooltipModule],
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent {
  channelService = inject(ChannelService);
  studioService = inject(StudioService);

  readonly collapsed = signal<boolean>(false);

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }
}
