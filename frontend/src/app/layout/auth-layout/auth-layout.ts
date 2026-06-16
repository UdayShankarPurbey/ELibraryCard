import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="flex min-h-dvh items-center justify-center bg-bg px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-semibold text-fg">ELibraryCard</h1>
          <p class="mt-1 text-sm text-muted">Library management system</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-6 shadow-card">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayout {}
