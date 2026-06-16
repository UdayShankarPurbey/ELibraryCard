import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { FieldDefinition } from '../models/book-field.model';

@Injectable({ providedIn: 'root' })
export class BookFieldApi {
  private readonly api = inject(ApiClient);

  /** The current user's institution book-field schema (tenant read). */
  listMine() {
    return this.api.get<FieldDefinition[]>('/book-fields');
  }
}
