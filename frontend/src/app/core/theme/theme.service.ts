import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly dark = signal(false);

  constructor() {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setDark(saved ? saved === 'dark' : prefersDark);
  }

  toggle(): void {
    this.setDark(!this.dark());
  }

  setDark(value: boolean): void {
    this.dark.set(value);
    if (!this.isBrowser) return;
    document.documentElement.classList.toggle('dark', value);
    localStorage.setItem('theme', value ? 'dark' : 'light');
  }
}
