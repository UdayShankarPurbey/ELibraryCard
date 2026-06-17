import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { Icon } from '../../shared/ui/icon/icon';
import { NavItem, visibleNav } from '../nav';

@Component({
  selector: 'app-sidebar',
  host: { class: 'contents' },
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <aside class="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div class="flex h-14 items-center gap-2 border-b border-border px-4">
        <img src="/logo-mark.svg" alt="" width="32" height="32" class="h-8 w-8" />
        <span class="text-lg font-extrabold tracking-tight text-fg">
          eLibrary<span class="text-primary">Card</span>
        </span>
      </div>

      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main navigation">
        @for (item of items(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-brand-50 font-semibold text-brand-700"
            [routerLinkActiveOptions]="{ exact: item.route === '/app' }"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg hover:text-fg"
          >
            <app-icon [name]="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="border-t border-border p-3">
        <div class="flex items-center gap-3">
          <img [src]="avatarSrc()" alt="" width="36" height="36" class="h-9 w-9 rounded-full" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-fg">{{ auth.currentUser()?.fullName }}</p>
            <p class="truncate text-xs text-muted">{{ roleLabel() }}</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-fg"
            aria-label="Log out"
            (click)="logout()"
          >
            <app-icon name="logout" [size]="18" />
          </button>
        </div>
        <a
          routerLink="/app/account/change-password"
          class="mt-1 block rounded-md px-2 py-1.5 text-xs text-muted hover:bg-bg hover:text-fg"
        >
          Change password
        </a>
      </div>
    </aside>
  `,
})
export class Sidebar {
  protected readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly items = computed<NavItem[]>(() => visibleNav(this.auth));
  protected readonly avatarSrc = computed(() =>
    this.theme.dark() ? '/avatar-dark.svg' : '/avatar.svg',
  );
  protected readonly roleLabel = computed(() =>
    this.auth.isSuperAdmin() ? 'Super Admin' : (this.auth.currentUser()?.email ?? ''),
  );

  protected logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
