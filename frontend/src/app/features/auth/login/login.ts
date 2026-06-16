import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
      <h2 class="text-lg font-semibold text-fg">Sign in</h2>

      @if (error()) {
        <p
          class="rounded-md border border-l-4 border-border border-l-[var(--color-danger-600)] bg-danger-50 px-3 py-2 text-sm text-fg"
          role="alert"
        >
          {{ error() }}
        </p>
      }

      <div class="flex flex-col gap-1.5">
        <label for="email" class="text-sm font-medium text-fg">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          autocomplete="email"
          class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          [attr.aria-invalid]="invalid('email')"
        />
        @if (invalid('email')) {
          <span class="text-xs text-[var(--color-danger-600)]">Enter a valid email.</span>
        }
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="password" class="text-sm font-medium text-fg">Password</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          autocomplete="current-password"
          class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          [attr.aria-invalid]="invalid('password')"
        />
        @if (invalid('password')) {
          <span class="text-xs text-[var(--color-danger-600)]">Password is required.</span>
        }
      </div>

      <button
        type="submit"
        class="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        [disabled]="loading()"
      >
        {{ loading() ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && c.touched;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    this.auth.login({ email, password }).subscribe({
        next: (user) => {
          this.loading.set(false);
          if (user) this.router.navigateByUrl('/app');
          else this.error.set('Login failed. Please try again.');
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Invalid credentials.');
        },
      });
  }
}
