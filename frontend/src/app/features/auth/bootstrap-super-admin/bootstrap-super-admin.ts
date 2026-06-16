import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/api/auth-api';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-bootstrap-super-admin',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
      <h2 class="text-lg font-semibold text-fg">Create super admin</h2>
      <p class="text-sm text-muted">Available once, during first-time setup.</p>

      <div class="flex flex-col gap-1.5">
        <label for="fullName" class="text-sm font-medium text-fg">Full name</label>
        <input
          id="fullName"
          type="text"
          formControlName="fullName"
          class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="bEmail" class="text-sm font-medium text-fg">Email</label>
        <input
          id="bEmail"
          type="email"
          formControlName="email"
          autocomplete="email"
          class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="bPassword" class="text-sm font-medium text-fg">Password</label>
        <input
          id="bPassword"
          type="password"
          formControlName="password"
          autocomplete="new-password"
          class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
        <span class="text-xs text-muted">At least 8 characters.</span>
      </div>

      <button
        type="submit"
        class="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        [disabled]="loading() || form.invalid"
      >
        {{ loading() ? 'Creating…' : 'Create super admin' }}
      </button>

      <a routerLink="/login" class="text-center text-xs text-muted hover:text-fg">
        Back to sign in
      </a>
    </form>
  `,
})
export class BootstrapSuperAdmin {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.api.bootstrapSuperAdmin(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Super admin created. You can sign in now.');
        this.router.navigateByUrl('/login');
      },
      error: () => this.loading.set(false),
    });
  }
}
