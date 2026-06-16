export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  institution: string | null;
  isSuperAdmin: boolean;
  roles: string[];
  status: UserStatus;
}

export interface RoleSummary {
  name: string;
  permissions: string[];
}

export interface MeResponse {
  user: User;
  roles: RoleSummary[];
  permissions: string[];
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
