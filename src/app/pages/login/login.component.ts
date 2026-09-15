import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  router = inject(Router);

  activeTab = signal<'signin' | 'signup'>('signin');
  name = 'KEK Shiter';
  email = 'kek.shiter@piceofkek.tv';
  password = '••••••••';

  loginCreator(): void {
    this.auth.loginAsCreator();
    this.router.navigate(['/']);
  }

  loginViewer(): void {
    this.auth.loginAsViewer();
    this.router.navigate(['/']);
  }

  handleCustomAuth(): void {
    const role = this.activeTab() === 'signup' ? 'creator' : 'viewer';
    this.auth.loginCustom(this.name || 'Streamer', this.email, role);
    this.router.navigate(['/']);
  }
}
