import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { StudioService } from '../../../core/services/studio.service';
import { BroadcastService } from '../../../core/services/broadcast.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    BadgeModule,
    TooltipModule
  ],
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  studioService = inject(StudioService);
  broadcastService = inject(BroadcastService);
  router = inject(Router);

  searchQuery = '';
  isProfileMenuOpen = false;

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout(); 
    this.toggleProfileMenu();
    this.router.navigate(['/']);
  }

  @HostListener('document:click')
  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeProfileMenuOnEscape(): void {
    this.isProfileMenuOpen = false;
  }
}
