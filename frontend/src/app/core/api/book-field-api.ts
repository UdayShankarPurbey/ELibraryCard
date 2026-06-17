import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { CreateFieldInput, FieldDefinition } from '../models/book-field.model';

@Injectable({ providedIn: 'root' })
export class BookFieldApi {
  private readonly api = inject(ApiClient);

  /** Tenant — the current user's institution book-field schema (form/table rendering). */
  listMine() {
    return this.api.get<FieldDefinition[]>('/book-fields');
  }

  // Super admin — per-institution schema management.
  listForInstitution(institutionId: string) {
    return this.api.get<FieldDefinition[]>(`/institutions/${institutionId}/book-fields`);
  }

  create(institutionId: string, body: CreateFieldInput) {
    return this.api.post<FieldDefinition>(`/institutions/${institutionId}/book-fields`, body);
  }

  update(institutionId: string, fieldId: string, body: Partial<CreateFieldInput>) {
    return this.api.patch<FieldDefinition>(
      `/institutions/${institutionId}/book-fields/${fieldId}`,
      body,
    );
  }

  remove(institutionId: string, fieldId: string) {
    return this.api.delete<null>(`/institutions/${institutionId}/book-fields/${fieldId}`);
  }

  reorder(institutionId: string, order: string[]) {
    return this.api.patch<FieldDefinition[]>(
      `/institutions/${institutionId}/book-fields/reorder`,
      { order },
    );
  }
}
