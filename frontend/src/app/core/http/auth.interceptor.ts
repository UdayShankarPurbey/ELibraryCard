import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { REQUEST, inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const AUTH_BYPASS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/bootstrap-super-admin'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const serverRequest = inject(REQUEST, { optional: true });
  const auth = inject(AuthService);

  let request = req.clone({ withCredentials: true });
  if (serverRequest) {
    const cookie = serverRequest.headers.get('cookie');
    if (cookie) request = request.clone({ setHeaders: { cookie } });
  }

  const bypass = AUTH_BYPASS.some((path) => req.url.includes(path));

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || bypass || serverRequest) {
        return throwError(() => error);
      }
      return auth.refreshSession().pipe(
        switchMap(() => next(request)),
        catchError((refreshError) => {
          auth.clear();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
