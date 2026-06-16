import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, Icon],
  template: `
    <header class="flex h-14 items-center gap-2 border-b border-border bg-surface px-4">
      <div class="flex-1"></div>

      <button
        type="button"
        class="rounded-md p-2 text-muted hover:bg-bg hover:text-fg"
        [attr.aria-label]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
        (click)="theme.toggle()"
      >
        <app-icon [name]="theme.dark() ? 'sun' : 'moon'" />
      </button>

      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg hover:bg-bg"
          [attr.aria-expanded]="open()"
          aria-haspopup="menu"
          (click)="open.set(!open())"
        >
          <span
            class="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
          >
            {{ initials() }}
          </span>
          <span class="hidden sm:block">{{ auth.currentUser()?.fullName }}</span>
          <app-icon name="chevron-down" [size]="16" />
        </button>

        @if (open()) {
          <div
            class="absolute right-0 mt-1 w-48 rounded-md border border-border bg-surface p-1 shadow-pop"
            role="menu"
          >
            <a
              routerLink="/app/account/change-password"
              role="menuitem"
              class="block rounded px-3 py-2 text-sm text-fg hover:bg-bg"
              (click)="open.set(false)"
            >
              Change password
            </a>
            <button
              type="button"
              role="menuitem"
              class="block w-full rounded px-3 py-2 text-left text-sm text-fg hover:bg-bg"
              (click)="logout()"
            >
              Log out
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class Topbar {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly open = signal(false);

  protected readonly initials = computed(() => {
    const name = this.auth.currentUser()?.fullName ?? '';
    return (
      name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'
    );
  });

  protected logout(): void {
    this.open.set(false);
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
