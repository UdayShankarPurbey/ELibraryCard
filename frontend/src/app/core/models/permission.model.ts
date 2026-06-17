export interface Permission {
  _id: string;
  institution: string;
  key: string;
  label: string;
  group: string;
  description?: string;
}

export interface CreatePermission {
  key: string;
  label: string;
  group?: string;
  description?: string;
}
