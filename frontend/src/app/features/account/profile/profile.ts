import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-3xl p-6 sm:p-8">
      <div class="mb-6 flex items-center gap-4">
        <img [src]="avatarSrc()" alt="" width="64" height="64" class="h-16 w-16 rounded-full" />
        <div>
          <h1 class="text-2xl font-semibold text-fg">{{ user()?.fullName }}</h1>
          <p class="text-sm text-muted">{{ roleLabel() }}</p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p class="text-xs uppercase tracking-wide text-muted">Email</p>
          <p class="mt-1 text-sm text-fg">{{ user()?.email }}</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p class="text-xs uppercase tracking-wide text-muted">Phone</p>
          <p class="mt-1 text-sm text-fg">{{ user()?.phone || '—' }}</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p class="text-xs uppercase tracking-wide text-muted">Status</p>
          <p class="mt-1 text-sm text-fg">{{ user()?.status }}</p>
        </div>
        <div class="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p class="text-xs uppercase tracking-wide text-muted">Roles</p>
          <p class="mt-1 text-sm text-fg">{{ roleNames() }}</p>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-surface p-4 shadow-card">
        <p class="mb-2 text-xs uppercase tracking-wide text-muted">Permissions</p>
        <div class="flex flex-wrap gap-2">
          @if (auth.isSuperAdmin()) {
            <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              all permissions
            </span>
          } @else {
            @for (perm of auth.permissions(); track perm) {
              <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {{ perm }}
              </span>
            } @empty {
              <span class="text-sm text-muted">None assigned</span>
            }
          }
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 class="mb-4 text-lg font-semibold text-fg">Change password</h2>
        <form class="flex max-w-sm flex-col gap-4" [formGroup]="form" (ngSubmit)="changePassword()">
          <div class="flex flex-col gap-1.5">
            <label for="old" class="text-sm font-medium text-fg">Current password</label>
            <input id="old" type="password" formControlName="oldPassword" class="ctl" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="new" class="text-sm font-medium text-fg">New password</label>
            <input id="new" type="password" formControlName="newPassword" class="ctl" />
            <span class="text-xs text-muted">At least 8 characters.</span>
          </div>
          <button
            type="submit"
            class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
            [disabled]="form.invalid || saving()"
          >
            {{ saving() ? 'Saving…' : 'Update password' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .ctl {
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--color-fg);
      outline: none;
    }
    .ctl:focus {
      border-color: var(--color-primary);
    }
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly user = this.auth.currentUser;
  protected readonly saving = signal(false);

  protected readonly avatarSrc = computed(() =>
    this.theme.dark() ? '/avatar-dark.svg' : '/avatar.svg',
  );
  protected readonly roleLabel = computed(() =>
    this.auth.isSuperAdmin() ? 'Super Admin' : 'Institution user',
  );
  protected readonly roleNames = computed(() => {
    if (this.auth.isSuperAdmin()) return '—';
    const roles = this.auth.roles();
    return roles.length ? roles.map((r) => r.name).join(', ') : 'None';
  });

  protected readonly form = this.fb.nonNullable.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected changePassword(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Password updated');
        this.form.reset({ oldPassword: '', newPassword: '' });
      },
      error: () => this.saving.set(false),
    });
  }
}
