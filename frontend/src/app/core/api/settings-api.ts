import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { InstitutionSettings } from '../models/institution-settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly api = inject(ApiClient);

  getMine(silent = false) {
    return this.api.get<InstitutionSettings>('/settings', undefined, { silent });
  }

  updateMine(body: Partial<InstitutionSettings>) {
    return this.api.patch<InstitutionSettings>('/settings', body);
  }
}
