export interface Role {
  _id: string;
  institution: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

export interface CreateRole {
  name: string;
  description?: string;
  permissions: string[];
}
