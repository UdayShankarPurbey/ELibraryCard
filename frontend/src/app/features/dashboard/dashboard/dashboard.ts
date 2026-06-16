import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { HasPermission } from '../../../shared/directives/has-permission';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HasPermission],
  template: `
    <div class="mx-auto max-w-3xl p-8">
      <h1 class="text-2xl font-semibold text-fg">Welcome, {{ auth.currentUser()?.fullName }}</h1>
      <p class="mt-1 text-sm text-muted">
        {{ auth.currentUser()?.email }} ·
        {{ auth.isSuperAdmin() ? 'Super Admin' : 'Institution user' }}
      </p>

      <div class="mt-5 flex flex-wrap gap-2">
        @if (auth.isSuperAdmin()) {
          <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            all permissions
          </span>
        } @else {
          @for (perm of auth.permissions(); track perm) {
            <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {{ perm }}
            </span>
          } @empty {
            <span class="text-sm text-muted">No permissions assigned.</span>
          }
        }
      </div>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <button
          *appHasPermission="'book.create'"
          type="button"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg"
        >
          Add book (needs book.create)
        </button>
        <a
          routerLink="/app/account/change-password"
          class="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-bg"
        >
          Change password
        </a>
        <button
          type="button"
          class="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-bg"
          (click)="logout()"
        >
          Log out
        </button>
      </div>
    </div>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
