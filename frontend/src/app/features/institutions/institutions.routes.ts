import { Routes } from '@angular/router';

export const INSTITUTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./institution-list/institution-list').then((m) => m.InstitutionList),
  },
  {
    path: ':id/permissions',
    loadComponent: () =>
      import('./permission-manager/permission-manager').then((m) => m.PermissionManager),
  },
  {
    path: ':id/book-fields',
    loadComponent: () =>
      import('./book-field-manager/book-field-manager').then((m) => m.BookFieldManager),
  },
];
