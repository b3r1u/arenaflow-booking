import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  dark = signal(false);

  constructor() {
    const saved = localStorage.getItem('af-booking-dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved !== null ? saved === 'true' : prefersDark;
    this.apply(isDark);
  }

  toggle() {
    this.apply(!this.dark());
  }

  private apply(dark: boolean) {
    this.dark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('af-booking-dark', String(dark));
  }
}
