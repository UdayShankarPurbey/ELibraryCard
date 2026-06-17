import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { Paginated, QueryParams } from '../models/common.model';
import { CreateUser, ManagedUser, UpdateUser } from '../models/managed-user.model';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams) {
    return this.api.get<Paginated<ManagedUser>>('/users', params);
  }

  create(body: CreateUser) {
    return this.api.post<ManagedUser>('/users', body);
  }

  update(id: string, body: UpdateUser) {
    return this.api.patch<ManagedUser>(`/users/${id}`, body);
  }

  remove(id: string) {
    return this.api.delete<null>(`/users/${id}`);
  }

  resetPassword(id: string, newPassword: string) {
    return this.api.post<null>(`/users/${id}/reset-password`, { newPassword });
  }
}
