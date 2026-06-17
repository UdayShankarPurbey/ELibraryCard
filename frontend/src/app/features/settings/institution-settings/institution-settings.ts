import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SettingsApi } from '../../../core/api/settings-api';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-institution-settings',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-2xl p-6 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-fg">Settings</h1>

      <div class="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 class="text-lg font-semibold text-fg">Barcode</h2>
        <p class="mt-1 text-sm text-muted">
          When a copy is added without a barcode, one is generated as
          <span class="font-mono text-fg">{{ preview() }}</span>.
        </p>
        <form class="mt-4 flex max-w-md flex-col gap-4" [formGroup]="form" (ngSubmit)="save()">
          <div class="flex flex-col gap-1.5">
            <label for="prefix" class="text-sm font-medium text-fg">Barcode prefix</label>
            <input
              id="prefix"
              formControlName="barcodePrefix"
              placeholder="e.g. ABC or ABC-CSE"
              class="ctl"
              (input)="onPrefixInput($event)"
            />
            <span class="text-xs text-muted">
              A zero-padded sequence number is appended automatically. Include a separator if you
              want one — e.g. <span class="font-mono">ABC-</span> produces
              <span class="font-mono">ABC-001</span>.
            </span>
          </div>
          <button
            type="submit"
            class="self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
            [disabled]="saving()"
          >
            {{ saving() ? 'Saving…' : 'Save settings' }}
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
export class InstitutionSettings {
  private readonly api = inject(SettingsApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly saving = signal(false);
  protected readonly preview = signal('ABC-001');
  private readonly pad = '001';

  protected readonly form = this.fb.nonNullable.group({
    barcodePrefix: [''],
  });

  constructor() {
    this.api.getMine().subscribe((settings) => {
      this.form.patchValue({ barcodePrefix: settings.barcodePrefix ?? '' });
      this.updatePreview(settings.barcodePrefix ?? '');
    });
  }

  protected onPrefixInput(event: Event): void {
    this.updatePreview((event.target as HTMLInputElement).value);
  }

  protected save(): void {
    this.saving.set(true);
    this.api.updateMine({ barcodePrefix: this.form.getRawValue().barcodePrefix.trim() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Settings saved');
      },
      error: () => this.saving.set(false),
    });
  }

  private updatePreview(prefix: string): void {
    const clean = prefix.trim();
    this.preview.set(`${clean || 'ABC-'}${this.pad}`);
  }
}
