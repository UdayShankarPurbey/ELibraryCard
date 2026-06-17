import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldDefinition } from '../../../core/models/book-field.model';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule],
  template: `
    <form class="flex flex-col gap-4" [formGroup]="form()" (ngSubmit)="submit()">
      @for (field of sortedFields(); track field.fieldKey) {
        <div class="flex flex-col gap-1.5">
          <label [attr.for]="field.fieldKey" class="text-sm font-medium text-fg">
            {{ field.label }}
            @if (field.isRequired) {
              <span class="text-[var(--color-danger-600)]" aria-hidden="true">*</span>
            }
          </label>

          @switch (field.dataType) {
            @case ('enum') {
              <select
                [id]="field.fieldKey"
                [formControlName]="field.fieldKey"
                class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                [attr.aria-invalid]="invalid(field.fieldKey)"
              >
                <option value="">Select…</option>
                @for (opt of field.options; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
            }
            @case ('boolean') {
              <label class="inline-flex items-center gap-2 text-sm text-fg">
                <input
                  [id]="field.fieldKey"
                  type="checkbox"
                  [formControlName]="field.fieldKey"
                  class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40"
                />
                <span class="text-muted">Yes</span>
              </label>
            }
            @case ('date') {
              <input
                [id]="field.fieldKey"
                type="date"
                [formControlName]="field.fieldKey"
                class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                [attr.aria-invalid]="invalid(field.fieldKey)"
              />
            }
            @case ('number') {
              <input
                [id]="field.fieldKey"
                type="number"
                [formControlName]="field.fieldKey"
                class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                [attr.aria-invalid]="invalid(field.fieldKey)"
              />
            }
            @default {
              <input
                [id]="field.fieldKey"
                type="text"
                [formControlName]="field.fieldKey"
                class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                [attr.aria-invalid]="invalid(field.fieldKey)"
              />
            }
          }

          @if (invalid(field.fieldKey)) {
            <span class="text-xs text-[var(--color-danger-600)]"
              >{{ field.label }} is required.</span
            >
          } @else if (serverErrors()[field.fieldKey]) {
            <span class="text-xs text-[var(--color-danger-600)]">{{
              serverErrors()[field.fieldKey]
            }}</span>
          }
        </div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          [disabled]="pending()"
        >
          {{ pending() ? 'Saving…' : submitLabel() }}
        </button>
      </div>
    </form>
  `,
})
export class DynamicForm {
  readonly fields = input.required<FieldDefinition[]>();
  readonly value = input<Record<string, unknown>>({});
  readonly pending = input(false);
  readonly submitLabel = input('Save');
  readonly serverErrors = input<Record<string, string>>({});

  readonly submitted = output<Record<string, unknown>>();

  protected readonly form = signal<FormGroup>(new FormGroup({}));
  protected readonly sortedFields = computed(() =>
    [...this.fields()].sort((a, b) => a.sortOrder - b.sortOrder),
  );

  constructor() {
    effect(() => {
      const value = this.value();
      const controls: Record<string, FormControl> = {};
      for (const field of this.sortedFields()) {
        controls[field.fieldKey] = new FormControl(
          this.initialFor(field, value?.[field.fieldKey]),
          field.isRequired ? [Validators.required] : [],
        );
      }
      this.form.set(new FormGroup(controls));
    });
  }

  protected invalid(key: string): boolean {
    const control = this.form().get(key);
    return !!control && control.invalid && control.touched;
  }

  protected submit(): void {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const raw = form.getRawValue() as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const field of this.sortedFields()) {
      const v = raw[field.fieldKey];
      if (v === '' || v === null || v === undefined) continue;
      out[field.fieldKey] = field.dataType === 'number' ? Number(v) : v;
    }
    this.submitted.emit(out);
  }

  private initialFor(field: FieldDefinition, raw: unknown): unknown {
    if (field.dataType === 'boolean') return raw === true || raw === 'true';
    if (field.dataType === 'date' && raw) {
      const date = new Date(raw as string);
      return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
    }
    return raw ?? '';
  }
}
