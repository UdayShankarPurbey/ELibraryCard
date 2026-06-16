import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-4 text-center">
      <p class="text-5xl font-semibold text-fg">404</p>
      <p class="text-muted">We couldn't find that page.</p>
      <a routerLink="/app" class="mt-2 text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </a>
    </div>
  `,
})
export class NotFound {}
