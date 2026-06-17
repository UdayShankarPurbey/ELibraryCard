import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../notifications/toast.service';
import { ApiErrorBody } from '../models/api-response.model';
import { SKIP_ERROR_TOAST } from './http-context';

const SILENT_STATUSES = new Set([401, 422]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isBrowser && !SILENT_STATUSES.has(error.status) && !req.context.get(SKIP_ERROR_TOAST)) {
        const body = error.error as ApiErrorBody | undefined;
        toast.error(body?.message ?? error.message ?? 'Something went wrong');
      }
      return throwError(() => error);
    }),
  );
};
