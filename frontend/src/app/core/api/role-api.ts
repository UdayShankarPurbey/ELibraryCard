import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { CreateRole, Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleApi {
  private readonly api = inject(ApiClient);

  list() {
    return this.api.get<Role[]>('/roles');
  }

  create(body: CreateRole) {
    return this.api.post<Role>('/roles', body);
  }

  update(id: string, body: Partial<CreateRole>) {
    return this.api.patch<Role>(`/roles/${id}`, body);
  }

  remove(id: string) {
    return this.api.delete<null>(`/roles/${id}`);
  }
}
