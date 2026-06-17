import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PermissionApi } from '../../../core/api/permission-api';
import { InstitutionApi } from '../../../core/api/institution-api';
import { Permission } from '../../../core/models/permission.model';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-permission-manager',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-4xl p-6 sm:p-8">
      <a routerLink="/app/institutions" class="text-sm text-muted hover:text-fg">← Institutions</a>
      <div class="mt-2 mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-fg">
          Permissions <span class="text-muted">· {{ institutionName() }}</span>
        </h1>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-md border border-border px-3 py-2 text-sm font-medium text-fg hover:bg-bg"
            (click)="seedDefaults()"
          >
            Seed defaults
          </button>
          <button
            type="button"
            class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)]"
            (click)="showForm.set(!showForm())"
          >
            Add permission
          </button>
        </div>
      </div>

      @if (showForm()) {
        <form
          class="mb-6 grid gap-3 rounded-lg border border-border bg-surface p-5 shadow-card sm:grid-cols-2"
          [formGroup]="form"
          (ngSubmit)="add()"
        >
          <input formControlName="key" placeholder="key (e.g. report.view)" class="ctl" />
          <input formControlName="label" placeholder="Label" class="ctl" />
          <input formControlName="group" placeholder="Group (optional)" class="ctl" />
          <input formControlName="description" placeholder="Description (optional)" class="ctl" />
          <div class="sm:col-span-2">
            <button
              type="submit"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
              [disabled]="form.invalid"
            >
              Add
            </button>
          </div>
        </form>
      }

      <div class="overflow-x-auto rounded-lg border border-border bg-surface">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border text-xs text-muted">
            <tr>
              <th scope="col" class="px-4 py-3 font-medium">Key</th>
              <th scope="col" class="px-4 py-3 font-medium">Label</th>
              <th scope="col" class="px-4 py-3 font-medium">Group</th>
              <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (perm of permissions(); track perm._id) {
              <tr class="border-b border-border last:border-0">
                <td class="px-4 py-3 font-mono text-xs text-fg">{{ perm.key }}</td>
                <td class="px-4 py-3 text-fg">{{ perm.label }}</td>
                <td class="px-4 py-3 text-muted">{{ perm.group }}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    type="button"
                    class="text-xs font-medium text-[var(--color-danger-600)] hover:underline"
                    (click)="remove(perm)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-4 py-10 text-center text-muted">No permissions yet.</td>
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
export class PermissionManager {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PermissionApi);
  private readonly institutionApi = inject(InstitutionApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  private readonly institutionId = this.route.snapshot.paramMap.get('id')!;

  protected readonly permissions = signal<Permission[]>([]);
  protected readonly institutionName = signal('');
  protected readonly showForm = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    key: ['', [Validators.required]],
    label: ['', [Validators.required]],
    group: [''],
    description: [''],
  });

  constructor() {
    this.institutionApi
      .get(this.institutionId)
      .subscribe((inst) => this.institutionName.set(inst.name));
    this.load();
  }

  protected add(): void {
    if (this.form.invalid) return;
    const { key, label, group, description } = this.form.getRawValue();
    this.api
      .create(this.institutionId, {
        key,
        label,
        group: group || undefined,
        description: description || undefined,
      })
      .subscribe(() => {
        this.toast.success('Permission added');
        this.form.reset({ key: '', label: '', group: '', description: '' });
        this.showForm.set(false);
        this.load();
      });
  }

  protected seedDefaults(): void {
    this.api.seedDefaults(this.institutionId).subscribe((res) => {
      this.toast.success(`Added ${res.added} default permission(s)`);
      this.load();
    });
  }

  protected remove(perm: Permission): void {
    if (!confirm(`Delete permission "${perm.key}"? It will be removed from all roles.`)) return;
    this.api.remove(this.institutionId, perm._id).subscribe(() => {
      this.toast.success('Permission deleted');
      this.load();
    });
  }

  private load(): void {
    this.api.listForInstitution(this.institutionId).subscribe((list) => this.permissions.set(list));
  }
}
