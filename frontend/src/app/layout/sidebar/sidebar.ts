import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { Icon } from '../../shared/ui/icon/icon';
import { NavItem, visibleNav } from '../nav';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <aside class="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div class="flex h-14 items-center border-b border-border px-4">
        <img [src]="logoSrc()" alt="ELibraryCard" width="244" height="40" class="h-7 w-auto" />
      </div>
      <nav class="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
        @for (item of items(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-brand-50 text-brand-700"
            [routerLinkActiveOptions]="{ exact: item.route === '/app' }"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-bg hover:text-fg"
          >
            <app-icon [name]="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  protected readonly items = computed<NavItem[]>(() => visibleNav(this.auth));
  protected readonly logoSrc = computed(() => (this.theme.dark() ? '/logo-dark.svg' : '/logo.svg'));
}
