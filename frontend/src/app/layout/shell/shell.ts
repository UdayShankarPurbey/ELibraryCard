import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, Topbar],
  template: `
    <div class="flex h-dvh overflow-hidden bg-bg">
      <app-sidebar />
      <div class="flex min-w-0 flex-1 flex-col">
        <app-topbar />
        <main class="min-h-0 flex-1 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Shell {}
