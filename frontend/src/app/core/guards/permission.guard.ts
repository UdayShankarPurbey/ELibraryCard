import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = (route.data['permissions'] as string[] | undefined) ?? [];
  const mode = (route.data['mode'] as 'all' | 'any' | undefined) ?? 'any';

  const allowed =
    required.length === 0 || (mode === 'all' ? auth.has(required) : auth.hasAny(...required));

  return allowed ? true : router.createUrlTree(['/errors/403']);
};
