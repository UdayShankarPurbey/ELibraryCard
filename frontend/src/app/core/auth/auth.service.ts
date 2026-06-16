import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthApi } from '../api/auth-api';
import { ChangePasswordRequest, LoginRequest, RoleSummary, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private refresh$?: Observable<void>;

  readonly currentUser = signal<User | null>(null);
  readonly permissions = signal<string[]>([]);
  readonly roles = signal<RoleSummary[]>([]);

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isSuperAdmin = computed(() => this.currentUser()?.isSuperAdmin ?? false);

  has(keys: string | string[]): boolean {
    if (this.isSuperAdmin()) return true;
    const required = Array.isArray(keys) ? keys : [keys];
    const held = new Set(this.permissions());
    return required.every((key) => held.has(key));
  }

  hasAny(...keys: string[]): boolean {
    if (this.isSuperAdmin()) return true;
    const held = new Set(this.permissions());
    return keys.some((key) => held.has(key));
  }

  loadMe(): Observable<User | null> {
    return this.api.me().pipe(
      tap((res) => {
        this.currentUser.set(res.user);
        this.roles.set(res.roles);
        this.permissions.set(res.permissions);
      }),
      map((res) => res.user),
      catchError(() => {
        this.clear();
        return of(null);
      }),
    );
  }

  login(body: LoginRequest): Observable<User | null> {
    return this.api.login(body).pipe(switchMap(() => this.loadMe()));
  }

  logout(): Observable<void> {
    return this.api.logout().pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      finalize(() => this.clear()),
    );
  }

  changePassword(body: ChangePasswordRequest): Observable<void> {
    return this.api.changePassword(body).pipe(map(() => void 0));
  }

  refreshSession(): Observable<void> {
    if (!this.refresh$) {
      this.refresh$ = this.api.refresh().pipe(
        switchMap(() => this.loadMe()),
        map(() => void 0),
        finalize(() => (this.refresh$ = undefined)),
        shareReplay(1),
      );
    }
    return this.refresh$;
  }

  clear(): void {
    this.currentUser.set(null);
    this.permissions.set([]);
    this.roles.set([]);
  }
}
