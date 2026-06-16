import { Component, TemplateRef, contentChild, input } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { FieldDefinition } from '../../../core/models/book-field.model';

type Row = Record<string, unknown>;

@Component({
  selector: 'app-dynamic-table',
  imports: [DatePipe, NgTemplateOutlet],
  template: `
    <div class="overflow-x-auto rounded-lg border border-border bg-surface">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-border text-xs text-muted">
          <tr>
            @for (col of columns(); track col.fieldKey) {
              <th scope="col" class="px-4 py-3 font-medium">{{ col.label }}</th>
            }
            @if (rowActions()) {
              <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td [attr.colspan]="colSpan()" class="px-4 py-8 text-center text-muted">Loading…</td>
            </tr>
          } @else {
            @for (row of rows(); track $index) {
              <tr class="border-b border-border last:border-0 hover:bg-bg">
                @for (col of columns(); track col.fieldKey) {
                  <td class="px-4 py-3 text-fg">
                    @switch (col.dataType) {
                      @case ('boolean') {
                        {{ cell(row, col.fieldKey) ? 'Yes' : 'No' }}
                      }
                      @case ('date') {
                        {{ cell(row, col.fieldKey) ? (asDate(cell(row, col.fieldKey)) | date: 'mediumDate') : '—' }}
                      }
                      @default {
                        {{ display(cell(row, col.fieldKey)) }}
                      }
                    }
                  </td>
                }
                @if (rowActions()) {
                  <td class="px-4 py-3 text-right">
                    <ng-container
                      [ngTemplateOutlet]="rowActions()!"
                      [ngTemplateOutletContext]="{ $implicit: row }"
                    />
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="colSpan()" class="px-4 py-10 text-center text-muted">
                  {{ emptyMessage() }}
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DynamicTable {
  readonly columns = input.required<FieldDefinition[]>();
  readonly rows = input<Row[]>([]);
  readonly dataPath = input<string | null>(null);
  readonly loading = input(false);
  readonly emptyMessage = input('No records found.');

  readonly rowActions = contentChild<TemplateRef<{ $implicit: Row }>>('rowActions');

  protected colSpan(): number {
    return this.columns().length + (this.rowActions() ? 1 : 0);
  }

  protected cell(row: Row, key: string): unknown {
    const path = this.dataPath();
    const source = path ? ((row[path] as Row) ?? {}) : row;
    return source[key];
  }

  protected display(value: unknown): string {
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  protected asDate(value: unknown): Date {
    return new Date(value as string);
  }
}
