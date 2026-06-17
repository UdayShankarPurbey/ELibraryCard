import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { CreatePermission, Permission } from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionApi {
  private readonly api = inject(ApiClient);

  // Super admin — per-institution catalog management.
  listForInstitution(institutionId: string) {
    return this.api.get<Permission[]>(`/institutions/${institutionId}/permissions`);
  }

  create(institutionId: string, body: CreatePermission) {
    return this.api.post<Permission>(`/institutions/${institutionId}/permissions`, body);
  }

  seedDefaults(institutionId: string) {
    return this.api.post<{ added: number }>(
      `/institutions/${institutionId}/permissions/seed-defaults`,
    );
  }

  update(institutionId: string, permissionId: string, body: Partial<CreatePermission>) {
    return this.api.patch<Permission>(
      `/institutions/${institutionId}/permissions/${permissionId}`,
      body,
    );
  }

  remove(institutionId: string, permissionId: string) {
    return this.api.delete<null>(`/institutions/${institutionId}/permissions/${permissionId}`);
  }

  // Tenant — read own institution catalog (role builder).
  listMine() {
    return this.api.get<Permission[]>('/permissions');
  }
}
