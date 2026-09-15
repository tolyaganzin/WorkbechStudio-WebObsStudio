import { Injectable, signal, effect, computed } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'workbench_theme';

  readonly theme = signal<ThemeMode>(this.getInitialTheme());
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Immediate application on instantiation
    this.applyTheme(this.theme());

    // Reactive application on signal changes
    effect(() => {
      const current = this.theme();
      this.applyTheme(current);
    });
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  }

  private applyTheme(current: ThemeMode): void {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (current === 'dark') {
        root.classList.add('dark');
        document.body?.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body?.classList.remove('dark');
      }
      localStorage.setItem(this.storageKey, current);
    }
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
  }
}
