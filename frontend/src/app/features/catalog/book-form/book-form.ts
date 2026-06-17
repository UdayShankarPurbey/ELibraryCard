import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookApi } from '../../../core/api/book-api';
import { BookFieldApi } from '../../../core/api/book-field-api';
import { FieldDefinition } from '../../../core/models/book-field.model';
import { DynamicForm } from '../../../shared/dynamic-form/dynamic-form/dynamic-form';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-book-form',
  imports: [RouterLink, DynamicForm],
  template: `
    <div class="mx-auto max-w-2xl p-6 sm:p-8">
      <a routerLink="/app/catalog" class="text-sm text-muted hover:text-fg">← Catalog</a>
      <h1 class="mt-2 mb-6 text-2xl font-semibold text-fg">
        {{ editingId() ? 'Edit book' : 'Add book' }}
      </h1>

      <div class="rounded-lg border border-border bg-surface p-6 shadow-card">
        <div class="mb-4 flex flex-col gap-1.5">
          <label for="cover" class="text-sm font-medium text-fg">Cover image (optional)</label>
          <input
            id="cover"
            type="file"
            accept="image/*"
            class="text-sm text-muted"
            (change)="onFile($event)"
          />
        </div>

        @if (fields().length) {
          <app-dynamic-form
            [fields]="fields()"
            [value]="value()"
            [pending]="pending()"
            submitLabel="Save book"
            (submitted)="onSubmit($event)"
          />
        } @else {
          <p class="text-sm text-muted">No book fields are defined for this institution yet.</p>
        }
      </div>
    </div>
  `,
})
export class BookForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(BookApi);
  private readonly fieldApi = inject(BookFieldApi);
  private readonly toast = inject(ToastService);

  protected readonly editingId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  protected readonly fields = signal<FieldDefinition[]>([]);
  protected readonly value = signal<Record<string, unknown>>({});
  protected readonly pending = signal(false);
  private coverFile: File | null = null;

  constructor() {
    this.fieldApi.listMine().subscribe((list) => this.fields.set(list));
    const id = this.editingId();
    if (id) this.api.get(id).subscribe((res) => this.value.set(res.book.data));
  }

  protected onFile(event: Event): void {
    this.coverFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  protected onSubmit(data: Record<string, unknown>): void {
    this.pending.set(true);
    const form = new FormData();
    form.append('data', JSON.stringify(data));
    if (this.coverFile) form.append('cover', this.coverFile);

    const id = this.editingId();
    const request = id ? this.api.update(id, form) : this.api.create(form);
    request.subscribe({
      next: () => {
        this.pending.set(false);
        this.toast.success(id ? 'Book updated' : 'Book created');
        this.router.navigateByUrl('/app/catalog');
      },
      error: () => this.pending.set(false),
    });
  }
}
