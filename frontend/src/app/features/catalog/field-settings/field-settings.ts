import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookFieldApi } from '../../../core/api/book-field-api';
import { FieldDefinition } from '../../../core/models/book-field.model';
import { ToastService } from '../../../core/notifications/toast.service';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-field-settings',
  imports: [ReactiveFormsModule, Icon],
  template: `
    <div class="mx-auto max-w-4xl p-6 sm:p-8">
      <div class="mb-2 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-fg">Book fields</h1>
        <button
          type="button"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)]"
          (click)="openCreate()"
        >
          Add field
        </button>
      </div>
      <p class="mb-6 text-sm text-muted">
        These columns define a book record for your institution. They drive the add-book form, the
        catalog table, and bulk upload. Defaults are provided — edit or delete them as you need.
      </p>

      @if (showForm()) {
        <form
          class="mb-6 grid gap-3 rounded-lg border border-border bg-surface p-5 shadow-card sm:grid-cols-2"
          [formGroup]="form"
          (ngSubmit)="save()"
        >
          <input
            formControlName="fieldKey"
            placeholder="fieldKey (e.g. author)"
            class="ctl"
            [readonly]="editingId() !== null"
          />
          <input formControlName="label" placeholder="Label" class="ctl" />
          <select formControlName="dataType" class="ctl">
            @for (t of types; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
          <label class="inline-flex items-center gap-2 text-sm text-fg">
            <input type="checkbox" formControlName="isRequired" class="h-4 w-4 rounded" /> Required
          </label>
          @if (form.controls.dataType.value === 'enum') {
            <input
              formControlName="options"
              placeholder="Options, comma-separated (e.g. CS, ECE, ME)"
              class="ctl sm:col-span-2"
            />
          }
          <div class="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
              [disabled]="form.invalid"
            >
              {{ editingId() ? 'Save field' : 'Add field' }}
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
              <th scope="col" class="px-4 py-3 font-medium">Order</th>
              <th scope="col" class="px-4 py-3 font-medium">Label</th>
              <th scope="col" class="px-4 py-3 font-medium">Key</th>
              <th scope="col" class="px-4 py-3 font-medium">Type</th>
              <th scope="col" class="px-4 py-3 font-medium">Required</th>
              <th scope="col" class="px-4 py-3 font-medium">Options</th>
              <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (field of fields(); track field._id; let i = $index) {
              <tr class="border-b border-border last:border-0">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="rounded px-1 text-muted hover:text-fg disabled:opacity-30"
                      aria-label="Move up"
                      [disabled]="i === 0"
                      (click)="move(i, -1)"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="rounded px-1 text-muted hover:text-fg disabled:opacity-30"
                      aria-label="Move down"
                      [disabled]="i === fields().length - 1"
                      (click)="move(i, 1)"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3 text-fg">{{ field.label }}</td>
                <td class="px-4 py-3 font-mono text-xs text-muted">{{ field.fieldKey }}</td>
                <td class="px-4 py-3 text-muted">{{ field.dataType }}</td>
                <td class="px-4 py-3 text-muted">{{ field.isRequired ? 'Yes' : 'No' }}</td>
                <td class="px-4 py-3 text-muted">{{ field.options.join(', ') || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-1">
                    <button
                      type="button"
                      class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-fg"
                      aria-label="Edit field"
                      title="Edit"
                      (click)="openEdit(field)"
                    >
                      <app-icon name="edit" [size]="16" />
                    </button>
                    <button
                      type="button"
                      class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-[var(--color-danger-600)]"
                      aria-label="Delete field"
                      title="Delete"
                      (click)="remove(field)"
                    >
                      <app-icon name="trash" [size]="16" />
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="px-4 py-10 text-center text-muted">No fields defined yet.</td>
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
export class FieldSettings {
  private readonly api = inject(BookFieldApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly types = ['string', 'number', 'boolean', 'date', 'enum'] as const;
  protected readonly fields = signal<FieldDefinition[]>([]);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    fieldKey: ['', [Validators.required]],
    label: ['', [Validators.required]],
    dataType: ['string' as FieldDefinition['dataType']],
    isRequired: [false],
    options: [''],
  });

  constructor() {
    this.load();
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ fieldKey: '', label: '', dataType: 'string', isRequired: false, options: '' });
    this.showForm.set(true);
  }

  protected openEdit(field: FieldDefinition): void {
    this.editingId.set(field._id);
    this.form.reset({
      fieldKey: field.fieldKey,
      label: field.label,
      dataType: field.dataType,
      isRequired: field.isRequired,
      options: field.options.join(', '),
    });
    this.showForm.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const { fieldKey, label, dataType, isRequired, options } = this.form.getRawValue();
    const parsedOptions =
      dataType === 'enum'
        ? options
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : [];

    const id = this.editingId();
    const request = id
      ? this.api.updateMine(id, { label, dataType, isRequired, options: parsedOptions })
      : this.api.createMine({
          fieldKey,
          label,
          dataType,
          isRequired,
          options: parsedOptions,
          sortOrder: this.fields().length,
        });

    request.subscribe(() => {
      this.toast.success(id ? 'Field updated' : 'Field added');
      this.showForm.set(false);
      this.load();
    });
  }

  protected move(index: number, direction: -1 | 1): void {
    const ids = this.fields().map((f) => f._id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    this.api.reorderMine(ids).subscribe((list) => this.fields.set(list));
  }

  protected remove(field: FieldDefinition): void {
    if (!confirm(`Delete field "${field.label}"? It will be removed from existing books.`)) return;
    this.api.removeMine(field._id).subscribe(() => {
      this.toast.success('Field deleted');
      this.load();
    });
  }

  private load(): void {
    this.api.listMine().subscribe((list) => this.fields.set(list));
  }
}
