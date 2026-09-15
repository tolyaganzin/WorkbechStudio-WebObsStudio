import { Injectable, signal, computed } from '@angular/core';
import { UserAccount } from '../models/platform.models';

const DEMO_CREATOR: UserAccount = {
  id: 'alex-rivers',
  name: 'Alex Rivers',
  handle: 'alexrivers',
  email: 'alex.rivers@workbench.tv',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  role: 'creator',
  streamKey: 'live_sec_7894x9821a8b1c4d_k99',
  ingestServer: 'rtmp://ingest.workbench.live/app',
  bio: 'Full-stack developer, cyber-indie gamer, and tech streamer. Building next-gen browser tools live every weekday!',
  followers: 48920,
  following: 114
};

const DEMO_VIEWER: UserAccount = {
  id: 'sarah-connor',
  name: 'Sarah Connor',
  handle: 'sarahc',
  email: 'sarah.c@cybernet.io',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
  role: 'viewer',
  streamKey: '',
  ingestServer: '',
  bio: 'Sci-fi enthusiast, UI designer, and late night stream lurker.',
  followers: 320,
  following: 89
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'workbench_user';

  readonly currentUser = signal<UserAccount | null>(this.getInitialUser());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isCreator = computed(() => this.currentUser()?.role === 'creator');

  private getInitialUser(): UserAccount | null {
    if (typeof window === 'undefined') return DEMO_CREATOR;
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEMO_CREATOR;
      }
    }
    return DEMO_CREATOR; // Default to creator for immediate studio testing
  }

  loginAsCreator(): void {
    this.setUser(DEMO_CREATOR);
  }

  loginAsViewer(): void {
    this.setUser(DEMO_VIEWER);
  }

  loginCustom(name: string, email: string, role: 'creator' | 'viewer'): void {
    const user: UserAccount = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      handle: name.toLowerCase().replace(/\s+/g, ''),
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      role,
      streamKey: role === 'creator' ? `live_${Math.random().toString(36).substring(2, 12)}` : '',
      ingestServer: role === 'creator' ? 'rtmp://ingest.workbench.live/app' : '',
      bio: 'New Workbench creator ready to broadcast!',
      followers: 0,
      following: 0
    };
    this.setUser(user);
  }

  logout(): void {
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  regenerateStreamKey(): string {
    const current = this.currentUser();
    if (!current) return '';
    const newKey = `live_${Math.random().toString(36).substring(2, 8)}_${Math.random().toString(36).substring(2, 8)}`;
    const updated = { ...current, streamKey: newKey };
    this.setUser(updated);
    return newKey;
  }

  updateProfile(updates: Partial<UserAccount>): void {
    const current = this.currentUser();
    if (!current) return;
    const updated = { ...current, ...updates };
    this.setUser(updated);
  }

  private setUser(user: UserAccount): void {
    this.currentUser.set(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    }
  }
}
