import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookApi } from '../../../core/api/book-api';
import { BookFieldApi } from '../../../core/api/book-field-api';
import { Book } from '../../../core/models/book.model';
import { FieldDefinition } from '../../../core/models/book-field.model';
import { DynamicTable } from '../../../shared/dynamic-table/dynamic-table/dynamic-table';
import { HasPermission } from '../../../shared/directives/has-permission';
import { ToastService } from '../../../core/notifications/toast.service';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-book-list',
  imports: [RouterLink, DynamicTable, HasPermission, Icon],
  template: `
    <div class="mx-auto max-w-6xl p-6 sm:p-8">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-fg">Catalog</h1>
        <div class="flex gap-2">
          <a
            *appHasPermission="'book.create'"
            routerLink="bulk"
            class="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-bg"
          >
            Bulk upload
          </a>
          <a
            *appHasPermission="'book.create'"
            routerLink="new"
            class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-[var(--color-primary-hover)]"
          >
            Add book
          </a>
        </div>
      </div>

      <app-dynamic-table
        [columns]="fields()"
        [rows]="$any(books())"
        dataPath="data"
        [loading]="loading()"
        emptyMessage="No books in the catalog yet."
      >
        <ng-template #rowActions let-row>
          <div class="flex items-center justify-end gap-1">
            <a
              [routerLink]="[$any(row)._id]"
              class="mr-1 text-xs font-medium text-primary hover:underline"
            >
              Copies
            </a>
            <a
              *appHasPermission="'book.update'"
              [routerLink]="[$any(row)._id, 'edit']"
              class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-fg"
              aria-label="Edit book"
              title="Edit"
            >
              <app-icon name="edit" [size]="16" />
            </a>
            <button
              *appHasPermission="'book.delete'"
              type="button"
              class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-[var(--color-danger-600)]"
              aria-label="Delete book"
              title="Delete"
              (click)="remove($any(row))"
            >
              <app-icon name="trash" [size]="16" />
            </button>
          </div>
        </ng-template>
      </app-dynamic-table>
    </div>
  `,
})
export class BookList {
  private readonly api = inject(BookApi);
  private readonly fieldApi = inject(BookFieldApi);
  private readonly toast = inject(ToastService);

  protected readonly fields = signal<FieldDefinition[]>([]);
  protected readonly books = signal<Book[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.fieldApi.listMine().subscribe((list) => this.fields.set(list));
    this.load();
  }

  protected remove(row: Book): void {
    if (!confirm('Delete this book and its copies?')) return;
    this.api.remove(row._id).subscribe(() => {
      this.toast.success('Book deleted');
      this.load();
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list({ limit: 100 }).subscribe((res) => {
      this.books.set(res.items);
      this.loading.set(false);
    });
  }
}
