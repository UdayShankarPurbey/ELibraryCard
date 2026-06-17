import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ActiveInstitution {
  id: string;
  name: string;
}

const STORAGE_KEY = 'activeInstitution';

@Injectable({ providedIn: 'root' })
export class ContextService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly activeInstitution = signal<ActiveInstitution | null>(null);

  constructor() {
    if (!this.isBrowser) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.activeInstitution.set(JSON.parse(raw) as ActiveInstitution);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  setInstitution(institution: ActiveInstitution): void {
    this.activeInstitution.set(institution);
    if (this.isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(institution));
  }

  clear(): void {
    this.activeInstitution.set(null);
    if (this.isBrowser) localStorage.removeItem(STORAGE_KEY);
  }
}
