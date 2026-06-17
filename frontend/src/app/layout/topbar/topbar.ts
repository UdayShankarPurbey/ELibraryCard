import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ThemeService } from '../../core/theme/theme.service';
import { Icon } from '../../shared/ui/icon/icon';
import { NAV_ITEMS } from '../nav';

@Component({
  selector: 'app-topbar',
  imports: [Icon],
  template: `
    <header class="flex h-14 items-center gap-3 border-b border-border bg-surface px-6">
      <h1 class="text-base font-semibold text-fg">{{ title() }}</h1>
      <div class="flex-1"></div>
      <button
        type="button"
        class="rounded-md p-2 text-muted hover:bg-bg hover:text-fg"
        [attr.aria-label]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
        (click)="theme.toggle()"
      >
        <app-icon [name]="theme.dark() ? 'sun' : 'moon'" />
      </button>
    </header>
  `,
})
export class Topbar {
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly title = computed(() => {
    const url = this.url();
    const match = NAV_ITEMS.find((item) => item.route !== '/app' && url.startsWith(item.route));
    if (match) return match.label;
    if (url.startsWith('/app/account')) return 'Account';
    return 'Dashboard';
  });
}
