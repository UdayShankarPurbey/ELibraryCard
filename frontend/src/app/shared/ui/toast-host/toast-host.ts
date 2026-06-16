import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div
      class="pointer-events-none fixed top-4 right-4 z-50 flex w-80 flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3 shadow-pop"
          [class]="accent(toast)"
          role="status"
          aria-live="polite"
        >
          <span class="mt-0.5 text-sm font-medium text-fg">{{ toast.message }}</span>
          <button
            type="button"
            class="ml-auto text-muted hover:text-fg"
            aria-label="Dismiss notification"
            (click)="toasts.dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);

  protected accent(toast: Toast): string {
    switch (toast.kind) {
      case 'success':
        return 'border-l-4 border-l-[var(--color-success-600)]';
      case 'error':
        return 'border-l-4 border-l-[var(--color-danger-600)]';
      default:
        return 'border-l-4 border-l-[var(--color-info-600)]';
    }
  }
}
