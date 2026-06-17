import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <img src="/error-404.svg" alt="Page not found" width="320" height="240" class="w-72" />
      <p class="text-muted">We couldn't find that page.</p>
      <a routerLink="/app" class="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </a>
    </div>
  `,
})
export class NotFound {}
