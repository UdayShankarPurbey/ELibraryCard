import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app' },
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'account/change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password').then((m) => m.ChangePassword),
      },
      {
        path: 'institutions',
        canActivate: [superAdminGuard],
        loadChildren: () =>
          import('./features/institutions/institutions.routes').then((m) => m.INSTITUTION_ROUTES),
      },
    ],
  },
  {
    path: 'errors/403',
    loadComponent: () => import('./features/errors/forbidden/forbidden').then((m) => m.Forbidden),
  },
  {
    path: 'errors/404',
    loadComponent: () => import('./features/errors/not-found/not-found').then((m) => m.NotFound),
  },
  { path: '**', redirectTo: 'errors/404' },
];
