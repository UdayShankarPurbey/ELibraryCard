import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserApi } from '../../../core/api/user-api';
import { RoleApi } from '../../../core/api/role-api';
import { ManagedUser } from '../../../core/models/managed-user.model';
import { Role } from '../../../core/models/role.model';
import { ThemeService } from '../../../core/theme/theme.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { HasPermission } from '../../../shared/directives/has-permission';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-user-list',
  imports: [ReactiveFormsModule, HasPermission, Icon],
  template: `
    <div class="mx-auto max-w-5xl p-6 sm:p-8">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold text-fg">Users</h1>
        <div class="flex gap-2">
          <input
            class="ctl w-48"
            placeholder="Search name or email"
            [value]="search()"
            (input)="onSearch($event)"
          />
          <button
            *appHasPermission="'user.manage'"
            type="button"
            class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)]"
            (click)="openCreate()"
          >
            New user
          </button>
        </div>
      </div>

      @if (showForm()) {
        <form
          class="mb-6 grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-card sm:grid-cols-2"
          [formGroup]="form"
          (ngSubmit)="save()"
        >
          <div class="flex flex-col gap-1.5">
            <label for="uname" class="text-sm font-medium text-fg">Full name</label>
            <input id="uname" formControlName="fullName" class="ctl" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="uemail" class="text-sm font-medium text-fg">Email</label>
            <input id="uemail" type="email" formControlName="email" class="ctl" />
          </div>
          @if (!editingId()) {
            <div class="flex flex-col gap-1.5">
              <label for="upass" class="text-sm font-medium text-fg">Password</label>
              <input id="upass" type="password" formControlName="password" class="ctl" />
            </div>
          }
          <div class="flex flex-col gap-1.5">
            <label for="uphone" class="text-sm font-medium text-fg">Phone (optional)</label>
            <input id="uphone" formControlName="phone" class="ctl" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="ustatus" class="text-sm font-medium text-fg">Status</label>
            <select id="ustatus" formControlName="status" class="ctl">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="flex flex-col gap-2 sm:col-span-2">
            <p class="text-sm font-medium text-fg">Roles</p>
            <div class="flex flex-wrap gap-3">
              @for (role of roleOptions(); track role._id) {
                <label class="inline-flex items-center gap-2 text-sm text-fg">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded"
                    [checked]="isRoleSelected(role._id)"
                    (change)="toggleRole(role._id)"
                  />
                  {{ role.name }}
                </label>
              } @empty {
                <span class="text-sm text-muted">No roles defined yet.</span>
              }
            </div>
          </div>

          <div class="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
              [disabled]="form.invalid || saving()"
            >
              {{ editingId() ? 'Save user' : 'Create user' }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg"
              (click)="showForm.set(false)"
            >
              Cancel
            </button>
          </div>
        </form>
      }

      @if (users().length === 0) {
        <div
          class="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface py-12"
        >
          <img [src]="emptyImg()" alt="" width="240" height="180" class="w-48" />
          <p class="text-sm text-muted">No users found.</p>
        </div>
      } @else {
        <div class="overflow-x-auto rounded-lg border border-border bg-surface">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-border text-xs text-muted">
              <tr>
                <th scope="col" class="px-4 py-3 font-medium">Name</th>
                <th scope="col" class="px-4 py-3 font-medium">Email</th>
                <th scope="col" class="px-4 py-3 font-medium">Roles</th>
                <th scope="col" class="px-4 py-3 font-medium">Status</th>
                <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user._id) {
                <tr class="border-b border-border last:border-0">
                  <td class="px-4 py-3 font-medium text-fg">{{ user.fullName }}</td>
                  <td class="px-4 py-3 text-muted">{{ user.email }}</td>
                  <td class="px-4 py-3 text-muted">{{ roleNames(user) || '—' }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-medium"
                      [class]="badge(user)"
                    >
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3" *appHasPermission="'user.manage'">
                    <div class="flex justify-end gap-1">
                      <button
                        type="button"
                        class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-fg"
                        aria-label="Edit user"
                        title="Edit"
                        (click)="openEdit(user)"
                      >
                        <app-icon name="edit" [size]="16" />
                      </button>
                      <button
                        type="button"
                        class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-fg"
                        aria-label="Reset password"
                        title="Reset password"
                        (click)="resetPassword(user)"
                      >
                        <app-icon name="key" [size]="16" />
                      </button>
                      <button
                        type="button"
                        class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-[var(--color-danger-600)]"
                        aria-label="Delete user"
                        title="Delete"
                        (click)="remove(user)"
                      >
                        <app-icon name="trash" [size]="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
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
export class UserList {
  private readonly api = inject(UserApi);
  private readonly roleApi = inject(RoleApi);
  private readonly fb = inject(FormBuilder);
  private readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);

  protected readonly users = signal<ManagedUser[]>([]);
  protected readonly roleOptions = signal<Role[]>([]);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly search = signal('');
  protected readonly selectedRoles = signal<string[]>([]);

  protected readonly emptyImg = computed(() =>
    this.theme.dark() ? '/empty-users-dark.svg' : '/empty-users.svg',
  );

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    phone: [''],
    status: ['active' as 'active' | 'inactive'],
  });

  constructor() {
    this.roleApi.list().subscribe((list) => this.roleOptions.set(list));
    this.load();
  }

  protected badge(user: ManagedUser): string {
    return user.status === 'active'
      ? 'bg-success-50 text-[var(--color-success-600)]'
      : 'bg-danger-50 text-[var(--color-danger-600)]';
  }

  protected roleNames(user: ManagedUser): string {
    return (user.roles ?? []).map((r) => r.name).join(', ');
  }

  protected isRoleSelected(id: string): boolean {
    return this.selectedRoles().includes(id);
  }

  protected toggleRole(id: string): void {
    this.selectedRoles.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.load();
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ fullName: '', email: '', password: '', phone: '', status: 'active' });
    this.form.controls.password.addValidators(Validators.required);
    this.form.controls.password.updateValueAndValidity();
    this.selectedRoles.set([]);
    this.showForm.set(true);
  }

  protected openEdit(user: ManagedUser): void {
    this.editingId.set(user._id);
    this.form.reset({
      fullName: user.fullName,
      email: user.email,
      password: '',
      phone: user.phone ?? '',
      status: user.status,
    });
    this.form.controls.password.removeValidators(Validators.required);
    this.form.controls.password.updateValueAndValidity();
    this.selectedRoles.set((user.roles ?? []).map((r) => r._id));
    this.showForm.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { fullName, email, password, phone, status } = this.form.getRawValue();
    const id = this.editingId();
    const request = id
      ? this.api.update(id, {
          fullName,
          email,
          phone: phone || undefined,
          status,
          roleIds: this.selectedRoles(),
        })
      : this.api.create({
          fullName,
          email,
          password,
          phone: phone || undefined,
          status,
          roleIds: this.selectedRoles(),
        });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.success(id ? 'User updated' : 'User created');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected resetPassword(user: ManagedUser): void {
    const next = prompt(`New password for ${user.fullName} (min 8 chars):`);
    if (!next) return;
    if (next.length < 8) {
      this.toast.error('Password must be at least 8 characters.');
      return;
    }
    this.api.resetPassword(user._id, next).subscribe(() => this.toast.success('Password reset'));
  }

  protected remove(user: ManagedUser): void {
    if (!confirm(`Delete user "${user.fullName}"?`)) return;
    this.api.remove(user._id).subscribe(() => {
      this.toast.success('User deleted');
      this.load();
    });
  }

  private load(): void {
    const search = this.search().trim();
    this.api
      .list({ limit: 100, search: search || undefined })
      .subscribe((res) => this.users.set(res.items));
  }
}
