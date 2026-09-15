import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent),
    title: 'Workbench - Watch Live Streams & Creators'
  },
  {
    path: 'channel/:id',
    loadComponent: () => import('./pages/channel/channel.component').then(m => m.ChannelComponent),
    title: 'Workbench Channel'
  },
  {
    path: 'studio',
    loadComponent: () => import('./pages/studio/studio.component').then(m => m.StudioComponent),
    title: 'Workbench Web OBS Studio - Broadcast & Compose'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Creator Dashboard - Workbench'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In - Workbench'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
