import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InstitutionApi } from '../../../core/api/institution-api';
import { Institution } from '../../../core/models/institution.model';
import { ContextService } from '../../../core/context/context.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-institution-list',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Icon],
  template: `
    <div class="mx-auto max-w-5xl p-6 sm:p-8">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-fg">Institutions</h1>
        <button
          type="button"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)]"
          (click)="openCreate()"
        >
          New institution
        </button>
      </div>

      @if (showForm()) {
        <form
          class="mb-6 grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-card sm:grid-cols-2"
          [formGroup]="form"
          (ngSubmit)="save()"
        >
          <div class="flex flex-col gap-1.5">
            <label for="name" class="text-sm font-medium text-fg">Name</label>
            <input id="name" formControlName="name" class="input" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="slug" class="text-sm font-medium text-fg">Slug (optional)</label>
            <input id="slug" formControlName="slug" placeholder="auto from name" class="input" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="status" class="text-sm font-medium text-fg">Status</label>
            <select id="status" formControlName="status" class="input">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          @if (!editingId()) {
            <label class="mt-7 inline-flex items-center gap-2 text-sm text-fg">
              <input type="checkbox" formControlName="seedPermissions" class="h-4 w-4 rounded" />
              Seed default permissions
            </label>
          }
          <div class="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
              [disabled]="form.invalid || saving()"
            >
              {{ editingId() ? 'Save changes' : 'Create' }}
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
              <th scope="col" class="px-4 py-3 font-medium">Slug</th>
              <th scope="col" class="px-4 py-3 font-medium">Status</th>
              <th scope="col" class="px-4 py-3 font-medium">Created</th>
              <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (inst of items(); track inst._id) {
              <tr class="border-b border-border last:border-0">
                <td class="px-4 py-3 font-medium text-fg">{{ inst.name }}</td>
                <td class="px-4 py-3 text-muted">{{ inst.slug }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" [class]="badge(inst)">
                    {{ inst.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-muted">{{ inst.createdAt | date: 'mediumDate' }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-3 text-xs font-medium">
                    <button
                      type="button"
                      class="font-semibold text-primary hover:underline"
                      (click)="manage(inst)"
                    >
                      Manage
                    </button>
                    <a
                      [routerLink]="[inst._id, 'permissions']"
                      class="text-primary hover:underline"
                    >
                      Permissions
                    </a>
                    <a
                      [routerLink]="[inst._id, 'book-fields']"
                      class="text-primary hover:underline"
                    >
                      Book fields
                    </a>
                    <button
                      type="button"
                      class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-fg"
                      aria-label="Edit institution"
                      title="Edit"
                      (click)="openEdit(inst)"
                    >
                      <app-icon name="edit" [size]="16" />
                    </button>
                    <button
                      type="button"
                      class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-[var(--color-danger-600)]"
                      aria-label="Delete institution"
                      title="Delete"
                      (click)="remove(inst)"
                    >
                      <app-icon name="trash" [size]="16" />
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-4 py-10 text-center text-muted">No institutions yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    .input {
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--color-fg);
      outline: none;
    }
    .input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent);
    }
  `,
})
export class InstitutionList {
  private readonly api = inject(InstitutionApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly context = inject(ContextService);
  private readonly router = inject(Router);

  protected readonly items = signal<Institution[]>([]);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: [''],
    status: ['active' as 'active' | 'suspended'],
    seedPermissions: [true],
  });

  constructor() {
    this.load();
  }

  protected badge(inst: Institution): string {
    return inst.status === 'active'
      ? 'bg-success-50 text-[var(--color-success-600)]'
      : 'bg-danger-50 text-[var(--color-danger-600)]';
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', slug: '', status: 'active', seedPermissions: true });
    this.showForm.set(true);
  }

  protected openEdit(inst: Institution): void {
    this.editingId.set(inst._id);
    this.form.reset({
      name: inst.name,
      slug: inst.slug,
      status: inst.status,
      seedPermissions: false,
    });
    this.showForm.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { name, slug, status, seedPermissions } = this.form.getRawValue();
    const id = this.editingId();
    const request = id
      ? this.api.update(id, { name, slug: slug || undefined, status })
      : this.api.create({ name, slug: slug || undefined, status, seedPermissions });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.success(id ? 'Institution updated' : 'Institution created');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected manage(inst: Institution): void {
    this.context.setInstitution({ id: inst._id, name: inst.name });
    this.toast.success(`Managing ${inst.name}`);
    this.router.navigateByUrl('/app');
  }

  protected remove(inst: Institution): void {
    if (!confirm(`Delete "${inst.name}" and all its data? This cannot be undone.`)) return;
    this.api.remove(inst._id).subscribe(() => {
      this.toast.success('Institution deleted');
      this.load();
    });
  }

  private load(): void {
    this.api.list({ limit: 100 }).subscribe((res) => this.items.set(res.items));
  }
}
