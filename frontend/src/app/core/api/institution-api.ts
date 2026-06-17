import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { Paginated, QueryParams } from '../models/common.model';
import { CreateInstitution, Institution, UpdateInstitution } from '../models/institution.model';

@Injectable({ providedIn: 'root' })
export class InstitutionApi {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams) {
    return this.api.get<Paginated<Institution>>('/institutions', params);
  }

  get(id: string) {
    return this.api.get<Institution>(`/institutions/${id}`);
  }

  create(body: CreateInstitution) {
    return this.api.post<Institution>('/institutions', body);
  }

  update(id: string, body: UpdateInstitution) {
    return this.api.patch<Institution>(`/institutions/${id}`, body);
  }

  remove(id: string) {
    return this.api.delete<null>(`/institutions/${id}`);
  }
}
