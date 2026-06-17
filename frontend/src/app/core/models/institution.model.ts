export type InstitutionStatus = 'active' | 'suspended';

export interface Institution {
  _id: string;
  name: string;
  slug: string;
  status: InstitutionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstitution {
  name: string;
  slug?: string;
  status?: InstitutionStatus;
  seedPermissions?: boolean;
}

export interface UpdateInstitution {
  name?: string;
  slug?: string;
  status?: InstitutionStatus;
}
