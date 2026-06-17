import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <div class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <img src="/error-403.svg" alt="Access denied" width="320" height="240" class="w-72" />
      <p class="text-muted">You don't have permission to access this page.</p>
      <a routerLink="/app" class="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </a>
    </div>
  `,
})
export class Forbidden {}
