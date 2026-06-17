import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookFieldApi } from '../../../core/api/book-field-api';
import { InstitutionApi } from '../../../core/api/institution-api';
import { FieldDefinition } from '../../../core/models/book-field.model';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-book-field-manager',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-4xl p-6 sm:p-8">
      <a routerLink="/app/institutions" class="text-sm text-muted hover:text-fg">← Institutions</a>
      <div class="mt-2 mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-fg">
          Book fields <span class="text-muted">· {{ institutionName() }}</span>
        </h1>
        <button
          type="button"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)]"
          (click)="showForm.set(!showForm())"
        >
          Add field
        </button>
      </div>

      @if (showForm()) {
        <form
          class="mb-6 grid gap-3 rounded-lg border border-border bg-surface p-5 shadow-card sm:grid-cols-2"
          [formGroup]="form"
          (ngSubmit)="add()"
        >
          <input formControlName="fieldKey" placeholder="fieldKey (e.g. writer)" class="ctl" />
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
          <div class="sm:col-span-2">
            <button
              type="submit"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
              [disabled]="form.invalid"
            >
              Add field
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
                  <button
                    type="button"
                    class="text-xs font-medium text-[var(--color-danger-600)] hover:underline"
                    (click)="remove(field)"
                  >
                    Delete
                  </button>
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
export class BookFieldManager {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(BookFieldApi);
  private readonly institutionApi = inject(InstitutionApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  private readonly institutionId = this.route.snapshot.paramMap.get('id')!;

  protected readonly types = ['string', 'number', 'boolean', 'date', 'enum'] as const;
  protected readonly fields = signal<FieldDefinition[]>([]);
  protected readonly institutionName = signal('');

  protected readonly showForm = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fieldKey: ['', [Validators.required]],
    label: ['', [Validators.required]],
    dataType: ['string' as FieldDefinition['dataType']],
    isRequired: [false],
    options: [''],
  });

  constructor() {
    this.institutionApi.get(this.institutionId).subscribe((inst) => this.institutionName.set(inst.name));
    this.load();
  }

  protected add(): void {
    if (this.form.invalid) return;
    const { fieldKey, label, dataType, isRequired, options } = this.form.getRawValue();
    const parsedOptions =
      dataType === 'enum'
        ? options
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : [];

    this.api
      .create(this.institutionId, {
        fieldKey,
        label,
        dataType,
        isRequired,
        options: parsedOptions,
        sortOrder: this.fields().length,
      })
      .subscribe(() => {
        this.toast.success('Field added');
        this.form.reset({ fieldKey: '', label: '', dataType: 'string', isRequired: false, options: '' });
        this.showForm.set(false);
        this.load();
      });
  }

  protected move(index: number, direction: -1 | 1): void {
    const ids = this.fields().map((f) => f._id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    this.api.reorder(this.institutionId, ids).subscribe((list) => this.fields.set(list));
  }

  protected remove(field: FieldDefinition): void {
    if (!confirm(`Delete field "${field.label}"? It will be removed from existing books.`)) return;
    this.api.remove(this.institutionId, field._id).subscribe(() => {
      this.toast.success('Field deleted');
      this.load();
    });
  }

  private load(): void {
    this.api.listForInstitution(this.institutionId).subscribe((list) => this.fields.set(list));
  }
}
