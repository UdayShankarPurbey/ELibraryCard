import { Component, computed, effect, inject, signal } from '@angular/core';
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

      <div class="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 class="mb-4 text-lg font-semibold text-fg">Details</h2>
        <form class="grid gap-4 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="saveDetails()">
          <div class="flex flex-col gap-1.5">
            <label for="fullName" class="text-sm font-medium text-fg">Full name</label>
            <input id="fullName" formControlName="fullName" class="ctl" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="email" class="text-sm font-medium text-fg">Email</label>
            <input id="email" type="email" formControlName="email" class="ctl" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="phone" class="text-sm font-medium text-fg">Phone</label>
            <input id="phone" formControlName="phone" class="ctl" />
          </div>
          <div class="flex items-end">
            <button
              type="submit"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
              [disabled]="form.invalid || savingDetails()"
            >
              {{ savingDetails() ? 'Saving…' : 'Save details' }}
            </button>
          </div>
        </form>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 class="mb-4 text-lg font-semibold text-fg">Appearance</h2>
        <div class="inline-flex rounded-md border border-border p-1">
          <button
            type="button"
            class="rounded px-4 py-1.5 text-sm font-medium"
            [class]="!theme.dark() ? 'bg-primary text-primary-fg' : 'text-muted hover:text-fg'"
            (click)="theme.setDark(false)"
          >
            Light
          </button>
          <button
            type="button"
            class="rounded px-4 py-1.5 text-sm font-medium"
            [class]="theme.dark() ? 'bg-primary text-primary-fg' : 'text-muted hover:text-fg'"
            (click)="theme.setDark(true)"
          >
            Dark
          </button>
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
        <form
          class="flex max-w-sm flex-col gap-4"
          [formGroup]="passwordForm"
          (ngSubmit)="changePassword()"
        >
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
            [disabled]="passwordForm.invalid || savingPassword()"
          >
            {{ savingPassword() ? 'Saving…' : 'Update password' }}
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
  protected readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly user = this.auth.currentUser;
  protected readonly savingDetails = signal(false);
  protected readonly savingPassword = signal(false);

  protected readonly avatarSrc = computed(() =>
    this.theme.dark() ? '/avatar-dark.svg' : '/avatar.svg',
  );
  protected readonly roleLabel = computed(() =>
    this.auth.isSuperAdmin() ? 'Super Admin' : 'Institution user',
  );

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    effect(() => {
      const current = this.user();
      if (current) {
        this.form.patchValue(
          { fullName: current.fullName, email: current.email, phone: current.phone ?? '' },
          { emitEvent: false },
        );
      }
    });
  }

  protected saveDetails(): void {
    if (this.form.invalid) return;
    this.savingDetails.set(true);
    this.auth.updateProfile(this.form.getRawValue()).subscribe({
      next: () => {
        this.savingDetails.set(false);
        this.toast.success('Profile updated');
      },
      error: () => this.savingDetails.set(false),
    });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    this.auth.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.toast.success('Password updated');
        this.passwordForm.reset({ oldPassword: '', newPassword: '' });
      },
      error: () => this.savingPassword.set(false),
    });
  }
}
