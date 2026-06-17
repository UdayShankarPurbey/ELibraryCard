import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'sidebarCollapsed';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly sidebarCollapsed = signal(false);

  constructor() {
    if (this.isBrowser) this.sidebarCollapsed.set(localStorage.getItem(STORAGE_KEY) === '1');
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    if (this.isBrowser) localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  }
}
