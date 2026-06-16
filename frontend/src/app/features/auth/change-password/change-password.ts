import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-md p-8">
      <h1 class="mb-4 text-xl font-semibold text-fg">Change password</h1>
      <form
        class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-card"
        [formGroup]="form"
        (ngSubmit)="submit()"
      >
        <div class="flex flex-col gap-1.5">
          <label for="old" class="text-sm font-medium text-fg">Current password</label>
          <input
            id="old"
            type="password"
            formControlName="oldPassword"
            autocomplete="current-password"
            class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="new" class="text-sm font-medium text-fg">New password</label>
          <input
            id="new"
            type="password"
            formControlName="newPassword"
            autocomplete="new-password"
            class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
          <span class="text-xs text-muted">At least 8 characters.</span>
        </div>
        <button
          type="submit"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          [disabled]="loading() || form.invalid"
        >
          {{ loading() ? 'Saving…' : 'Update password' }}
        </button>
      </form>
    </div>
  `,
})
export class ChangePassword {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Password updated.');
        this.router.navigateByUrl('/app');
      },
      error: () => this.loading.set(false),
    });
  }
}
