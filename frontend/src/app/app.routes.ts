import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

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
      {
        path: 'bootstrap',
        loadComponent: () =>
          import('./features/auth/bootstrap-super-admin/bootstrap-super-admin').then(
            (m) => m.BootstrapSuperAdmin,
          ),
      },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
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
