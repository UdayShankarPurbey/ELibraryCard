import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ContextService } from '../../../core/context/context.service';
import { Icon } from '../../../shared/ui/icon/icon';
import { NavItem, visibleNav } from '../../../layout/nav';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Icon],
  template: `
    <div class="mx-auto max-w-5xl p-8">
      <h1 class="text-2xl font-semibold text-fg">Welcome, {{ auth.currentUser()?.fullName }}</h1>
      <p class="mt-1 text-sm text-muted">
        {{ auth.currentUser()?.email }} ·
        {{ auth.isSuperAdmin() ? 'Super Admin' : 'Institution user' }}
      </p>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (card of cards(); track card.route) {
          <a
            [routerLink]="card.route"
            class="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary"
          >
            <span class="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
              <app-icon [name]="card.icon" />
            </span>
            <span class="text-sm font-medium text-fg">{{ card.label }}</span>
          </a>
        } @empty {
          <p class="text-sm text-muted">No sections are available for your account yet.</p>
        }
      </div>
    </div>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly context = inject(ContextService);
  protected readonly cards = computed<NavItem[]>(() =>
    visibleNav(this.auth, this.context.activeInstitution() !== null).filter(
      (item) => item.route !== '/app',
    ),
  );
}
