import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./book-list/book-list').then((m) => m.BookList),
  },
  {
    path: 'new',
    loadComponent: () => import('./book-form/book-form').then((m) => m.BookForm),
  },
  {
    path: 'bulk',
    loadComponent: () => import('./bulk-upload/bulk-upload').then((m) => m.BulkUpload),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./book-form/book-form').then((m) => m.BookForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./book-detail/book-detail').then((m) => m.BookDetail),
  },
];
