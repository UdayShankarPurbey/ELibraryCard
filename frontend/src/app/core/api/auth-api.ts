import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import {
  AuthResult,
  ChangePasswordRequest,
  LoginRequest,
  MeResponse,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(ApiClient);

  login(body: LoginRequest) {
    return this.api.post<AuthResult>('/auth/login', body);
  }

  refresh() {
    return this.api.post<AuthResult>('/auth/refresh');
  }

  logout() {
    return this.api.post<null>('/auth/logout');
  }

  me() {
    return this.api.get<MeResponse>('/auth/me');
  }

  changePassword(body: ChangePasswordRequest) {
    return this.api.post<null>('/auth/change-password', body);
  }
}
