import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="grid min-h-dvh lg:grid-cols-2">
      <div class="hidden items-center justify-center bg-brand-50 p-12 lg:flex">
        <img src="/login-art.svg" alt="" width="600" height="800" class="max-h-[32rem] w-auto" />
      </div>
      <div class="flex items-center justify-center bg-bg px-4 py-10">
        <div class="w-full max-w-md">
          <div class="mb-6 flex items-center justify-center gap-2">
            <img src="/logo-mark.svg" alt="" width="40" height="40" class="h-10 w-10" />
            <span class="text-2xl font-extrabold tracking-tight text-fg">
              eLibrary<span class="text-primary">Card</span>
            </span>
          </div>
          <div class="rounded-lg border border-border bg-surface p-6 shadow-card">
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayout {}
