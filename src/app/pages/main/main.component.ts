import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChannelService } from '../../core/services/channel.service';
import { StudioService } from '../../core/services/studio.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: "./main.component.html",
})
export class MainComponent {
  channelService = inject(ChannelService);
  studioService = inject(StudioService);

  readonly categories = [
    'All',
    'Software & Game Dev',
    'Valorant & Tactical FPS',
    'Music & Audio Production',
    'Art & Design',
    'Science & Technology'
  ];

  readonly selectedCategory = signal<string>('All');

  readonly featuredStream = computed(() => {
    return this.channelService.channels()[0];
  });

  readonly filteredStreams = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'All') return this.channelService.channels();
    return this.channelService.channels().filter(c => c.category === cat);
  });
}
