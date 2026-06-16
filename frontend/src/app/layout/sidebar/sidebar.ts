import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Icon } from '../../shared/ui/icon/icon';
import { NavItem, visibleNav } from '../nav';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <aside class="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div class="flex h-14 items-center gap-2 border-b border-border px-4">
        <span
          class="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-fg"
        >
          EL
        </span>
        <span class="text-sm font-semibold text-fg">ELibraryCard</span>
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
  protected readonly items = computed<NavItem[]>(() => visibleNav(this.auth));
}
