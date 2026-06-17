import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';
import { permissionGuard } from './core/guards/permission.guard';

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
        path: 'profile',
        loadComponent: () => import('./features/account/profile/profile').then((m) => m.Profile),
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
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permissions: ['role.manage'] },
        loadComponent: () => import('./features/roles/role-list/role-list').then((m) => m.RoleList),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permissions: ['user.view', 'user.manage'], mode: 'any' },
        loadComponent: () => import('./features/users/user-list/user-list').then((m) => m.UserList),
      },
      {
        path: 'catalog',
        canActivate: [permissionGuard],
        data: { permissions: ['book.view'] },
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
      },
      {
        path: 'circulation',
        canActivate: [permissionGuard],
        data: { permissions: ['issue.view', 'issue.create', 'issue.return'], mode: 'any' },
        loadComponent: () =>
          import('./features/circulation/circulation-desk/circulation-desk').then(
            (m) => m.CirculationDesk,
          ),
      },
      {
        path: 'my-issues',
        loadComponent: () =>
          import('./features/circulation/my-issues/my-issues').then((m) => m.MyIssues),
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
