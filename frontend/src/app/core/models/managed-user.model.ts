import { UserStatus } from './auth.model';

export interface RoleRef {
  _id: string;
  name: string;
}

export interface ManagedUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: UserStatus;
  institution: string | null;
  roles: RoleRef[];
  createdAt: string;
}

export interface CreateUser {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  roleIds?: string[];
  status?: UserStatus;
}

export interface UpdateUser {
  fullName?: string;
  email?: string;
  phone?: string;
  roleIds?: string[];
  status?: UserStatus;
}
