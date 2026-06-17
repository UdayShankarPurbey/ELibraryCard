import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { BookApi } from '../../../core/api/book-api';
import { BookFieldApi } from '../../../core/api/book-field-api';
import { FieldDefinition } from '../../../core/models/book-field.model';
import { ToastService } from '../../../core/notifications/toast.service';

interface RowResult {
  row: number;
  ok: boolean;
  message?: string;
}

@Component({
  selector: 'app-bulk-upload',
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl p-6 sm:p-8">
      <a routerLink="/app/catalog" class="text-sm text-muted hover:text-fg">← Catalog</a>
      <h1 class="mt-2 mb-6 text-2xl font-semibold text-fg">Bulk upload books</h1>

      <div class="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 class="text-lg font-semibold text-fg">1. Columns</h2>
        <p class="mt-1 text-sm text-muted">
          Your CSV/Excel header row must use these column keys. Required columns must have a value in
          every row.
        </p>
        <div class="mt-3 overflow-x-auto rounded-md border border-border">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-border text-xs text-muted">
              <tr>
                <th class="px-3 py-2 font-medium">Column key</th>
                <th class="px-3 py-2 font-medium">Label</th>
                <th class="px-3 py-2 font-medium">Type</th>
                <th class="px-3 py-2 font-medium">Required</th>
              </tr>
            </thead>
            <tbody>
              @for (field of fields(); track field.fieldKey) {
                <tr class="border-b border-border last:border-0">
                  <td class="px-3 py-2 font-mono text-xs text-fg">{{ field.fieldKey }}</td>
                  <td class="px-3 py-2 text-fg">{{ field.label }}</td>
                  <td class="px-3 py-2 text-muted">
                    {{ field.dataType }}{{ field.dataType === 'enum' ? ' (' + field.options.join(' | ') + ')' : '' }}
                  </td>
                  <td class="px-3 py-2">
                    @if (field.isRequired) {
                      <span class="rounded-full bg-danger-50 px-2 py-0.5 text-xs font-medium text-[var(--color-danger-600)]">
                        Required
                      </span>
                    } @else {
                      <span class="text-xs text-muted">Optional</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-3 py-6 text-center text-muted">
                    No book fields defined for this institution.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            class="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-bg"
            [disabled]="!fields().length"
            (click)="downloadSample()"
          >
            Download sample (your columns)
          </button>
          <a
            href="/sample-files/books-sample.csv"
            download
            class="text-sm font-medium text-primary hover:underline"
          >
            Download generic example
          </a>
        </div>
      </div>

      <div class="mt-6 rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 class="text-lg font-semibold text-fg">2. Upload</h2>
        <p class="mt-1 text-sm text-muted">Accepted formats: .csv, .xlsx, .xls</p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          class="mt-3 block text-sm text-muted"
          [disabled]="parsing()"
          (change)="onFile($event)"
        />
        @if (parsing()) {
          <p class="mt-3 text-sm text-muted">Importing…</p>
        }
      </div>

      @if (results().length) {
        <div class="mt-6 rounded-lg border border-border bg-surface p-5 shadow-card">
          <h2 class="text-lg font-semibold text-fg">Result</h2>
          <p class="mt-1 text-sm text-fg">
            {{ summary().ok }} imported · {{ summary().failed }} failed · {{ summary().total }} total
          </p>
          @if (summary().failed) {
            <div class="mt-3 overflow-x-auto rounded-md border border-border">
              <table class="w-full text-left text-sm">
                <thead class="border-b border-border text-xs text-muted">
                  <tr>
                    <th class="px-3 py-2 font-medium">Row</th>
                    <th class="px-3 py-2 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  @for (result of failedRows(); track result.row) {
                    <tr class="border-b border-border last:border-0">
                      <td class="px-3 py-2 text-fg">{{ result.row }}</td>
                      <td class="px-3 py-2 text-[var(--color-danger-600)]">{{ result.message }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BulkUpload {
  private readonly bookApi = inject(BookApi);
  private readonly fieldApi = inject(BookFieldApi);
  private readonly toast = inject(ToastService);

  protected readonly fields = signal<FieldDefinition[]>([]);
  protected readonly parsing = signal(false);
  protected readonly results = signal<RowResult[]>([]);

  protected readonly summary = computed(() => {
    const all = this.results();
    return {
      total: all.length,
      ok: all.filter((r) => r.ok).length,
      failed: all.filter((r) => !r.ok).length,
    };
  });
  protected readonly failedRows = computed(() => this.results().filter((r) => !r.ok));

  constructor() {
    this.fieldApi.listMine().subscribe((list) => this.fields.set(list));
  }

  protected downloadSample(): void {
    const headers = this.fields().map((f) => f.fieldKey);
    const sample = this.fields().map((f) => this.sampleValue(f));
    const csv = `${headers.join(',')}\n${sample.join(',')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'books-sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  protected onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.parsing.set(true);
    this.results.set([]);

    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      this.importRows(rows);
    };
    reader.readAsArrayBuffer(file);
  }

  private importRows(rows: Record<string, unknown>[]): void {
    const known = new Set(this.fields().map((f) => f.fieldKey));
    const calls = rows.map((raw, index) => {
      const data: Record<string, unknown> = {};
      for (const key of Object.keys(raw)) {
        if (known.has(key) && raw[key] !== '' && raw[key] != null) data[key] = raw[key];
      }
      return this.bookApi.createWithData(data).pipe(
        map<unknown, RowResult>(() => ({ row: index + 2, ok: true })),
        catchError((err) =>
          of<RowResult>({ row: index + 2, ok: false, message: err?.error?.message ?? 'Failed' }),
        ),
      );
    });

    if (!calls.length) {
      this.parsing.set(false);
      this.toast.error('No rows found in the file.');
      return;
    }

    forkJoin(calls).subscribe((res) => {
      this.results.set(res);
      this.parsing.set(false);
      const ok = res.filter((r) => r.ok).length;
      this.toast.success(`${ok}/${res.length} books imported`);
    });
  }

  private sampleValue(field: FieldDefinition): string {
    switch (field.dataType) {
      case 'number':
        return '2024';
      case 'boolean':
        return 'true';
      case 'date':
        return '2024-01-01';
      case 'enum':
        return field.options[0] ?? '';
      default:
        return `Sample ${field.label}`;
    }
  }
}
