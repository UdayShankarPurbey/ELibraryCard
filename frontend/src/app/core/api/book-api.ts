import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { Paginated, QueryParams } from '../models/common.model';
import { Book, BookCopy, BookDetail, CopyStatus } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookApi {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams) {
    return this.api.get<Paginated<Book>>('/books', params);
  }

  get(id: string) {
    return this.api.get<BookDetail>(`/books/${id}`);
  }

  create(form: FormData) {
    return this.api.postForm<Book>('/books', form);
  }

  update(id: string, form: FormData) {
    return this.api.patchForm<Book>(`/books/${id}`, form);
  }

  remove(id: string) {
    return this.api.delete<null>(`/books/${id}`);
  }

  listCopies(bookId: string) {
    return this.api.get<BookCopy[]>(`/books/${bookId}/copies`);
  }

  addCopies(bookId: string, barcodes: string[]) {
    return this.api.post<BookCopy[]>(`/books/${bookId}/copies`, { barcodes });
  }

  updateCopyStatus(bookId: string, copyId: string, status: CopyStatus) {
    return this.api.patch<BookCopy>(`/books/${bookId}/copies/${copyId}`, { status });
  }

  deleteCopy(bookId: string, copyId: string) {
    return this.api.delete<null>(`/books/${bookId}/copies/${copyId}`);
  }
}
