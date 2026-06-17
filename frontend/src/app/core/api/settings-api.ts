import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { InstitutionSettings } from '../models/institution-settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly api = inject(ApiClient);

  // Tenant institution settings (super admin uses it via the active-institution context).
  getMine(silent = false) {
    return this.api.get<InstitutionSettings>('/settings', undefined, { silent });
  }

  updateMine(body: Partial<InstitutionSettings>) {
    return this.api.patch<InstitutionSettings>('/settings', body);
  }
}
