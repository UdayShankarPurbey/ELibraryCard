import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleApi } from '../../../core/api/role-api';
import { PermissionApi } from '../../../core/api/permission-api';
import { Role } from '../../../core/models/role.model';
import { Permission } from '../../../core/models/permission.model';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-role-list',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-4xl p-6 sm:p-8">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-fg">Roles</h1>
        <button
          type="button"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)]"
          (click)="openCreate()"
        >
          New role
        </button>
      </div>

      @if (showForm()) {
        <form
          class="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card"
          [formGroup]="form"
          (ngSubmit)="save()"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="rname" class="text-sm font-medium text-fg">Role name</label>
              <input id="rname" formControlName="name" class="ctl" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="rdesc" class="text-sm font-medium text-fg">Description</label>
              <input id="rdesc" formControlName="description" class="ctl" />
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <p class="text-sm font-medium text-fg">Permissions</p>
            @for (group of groups(); track group.group) {
              <fieldset class="rounded-md border border-border p-3">
                <legend class="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  {{ group.group }}
                </legend>
                <div class="grid gap-2 sm:grid-cols-2">
                  @for (perm of group.perms; track perm._id) {
                    <label class="inline-flex items-center gap-2 text-sm text-fg">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded"
                        [checked]="isSelected(perm.key)"
                        (change)="toggle(perm.key)"
                      />
                      <span
                        >{{ perm.label }} <span class="text-muted">({{ perm.key }})</span></span
                      >
                    </label>
                  }
                </div>
              </fieldset>
            } @empty {
              <p class="text-sm text-muted">No permissions in this institution's catalog yet.</p>
            }
          </div>

          <div class="flex gap-2">
            <button
              type="submit"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
              [disabled]="form.invalid || saving()"
            >
              {{ editingId() ? 'Save role' : 'Create role' }}
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

      <div class="overflow-x-auto rounded-lg border border-border bg-surface">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border text-xs text-muted">
            <tr>
              <th scope="col" class="px-4 py-3 font-medium">Name</th>
              <th scope="col" class="px-4 py-3 font-medium">Description</th>
              <th scope="col" class="px-4 py-3 font-medium">Permissions</th>
              <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (role of roles(); track role._id) {
              <tr class="border-b border-border last:border-0">
                <td class="px-4 py-3 font-medium text-fg">{{ role.name }}</td>
                <td class="px-4 py-3 text-muted">{{ role.description || '—' }}</td>
                <td class="px-4 py-3 text-muted">{{ role.permissions.length }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-3 text-xs font-medium">
                    <button type="button" class="text-fg hover:underline" (click)="openEdit(role)">
                      Edit
                    </button>
                    <button
                      type="button"
                      class="text-[var(--color-danger-600)] hover:underline"
                      (click)="remove(role)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-4 py-10 text-center text-muted">No roles yet.</td>
              </tr>
            }
          </tbody>
        </table>
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
export class RoleList {
  private readonly api = inject(RoleApi);
  private readonly permissionApi = inject(PermissionApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly roles = signal<Role[]>([]);
  protected readonly catalog = signal<Permission[]>([]);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly selected = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  protected readonly groups = computed(() => {
    const map = new Map<string, Permission[]>();
    for (const perm of this.catalog()) {
      const list = map.get(perm.group) ?? [];
      list.push(perm);
      map.set(perm.group, list);
    }
    return [...map.entries()].map(([group, perms]) => ({ group, perms }));
  });

  constructor() {
    this.permissionApi.listMine().subscribe((list) => this.catalog.set(list));
    this.load();
  }

  protected isSelected(key: string): boolean {
    return this.selected().includes(key);
  }

  protected toggle(key: string): void {
    this.selected.update((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '' });
    this.selected.set([]);
    this.showForm.set(true);
  }

  protected openEdit(role: Role): void {
    this.editingId.set(role._id);
    this.form.reset({ name: role.name, description: role.description ?? '' });
    this.selected.set([...role.permissions]);
    this.showForm.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { name, description } = this.form.getRawValue();
    const body = { name, description: description || undefined, permissions: this.selected() };
    const id = this.editingId();
    const request = id ? this.api.update(id, body) : this.api.create(body);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.success(id ? 'Role updated' : 'Role created');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected remove(role: Role): void {
    if (!confirm(`Delete role "${role.name}"? It will be removed from its users.`)) return;
    this.api.remove(role._id).subscribe(() => {
      this.toast.success('Role deleted');
      this.load();
    });
  }

  private load(): void {
    this.api.list().subscribe((list) => this.roles.set(list));
  }
}
