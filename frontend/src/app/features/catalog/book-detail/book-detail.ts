import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookApi } from '../../../core/api/book-api';
import { BookFieldApi } from '../../../core/api/book-field-api';
import { SettingsApi } from '../../../core/api/settings-api';
import { Book, BookCopy, CopyStatus } from '../../../core/models/book.model';
import { FieldDefinition } from '../../../core/models/book-field.model';
import { HasPermission } from '../../../shared/directives/has-permission';
import { ToastService } from '../../../core/notifications/toast.service';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-book-detail',
  imports: [RouterLink, HasPermission, Icon],
  template: `
    <div class="mx-auto max-w-3xl p-6 sm:p-8">
      <a routerLink="/app/catalog" class="text-sm text-muted hover:text-fg">← Catalog</a>

      @if (book(); as b) {
        <div class="mt-3 flex gap-6">
          <img
            [src]="b.coverUrl || '/book-placeholder.webp'"
            alt=""
            width="120"
            height="160"
            class="h-40 w-28 rounded-md border border-border object-cover"
          />
          <div class="flex-1">
            <h1 class="text-2xl font-semibold text-fg">{{ title(b) }}</h1>
            <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              @for (field of fields(); track field.fieldKey) {
                <dt class="text-muted">{{ field.label }}</dt>
                <dd class="text-fg">{{ display(b.data[field.fieldKey]) }}</dd>
              }
            </dl>
          </div>
        </div>

        <div class="mt-8">
          <div class="mb-3 flex items-center gap-3">
            <h2 class="text-lg font-semibold text-fg">Copies</h2>
            <span class="text-sm text-muted">
              {{ availableCount() }} of {{ copies().length }} available
            </span>
          </div>

          <div
            *appHasPermission="'copy.manage'"
            class="mb-4 rounded-lg border border-border bg-surface p-4 shadow-card"
          >
            <p class="mb-3 text-sm font-medium text-fg">Add copies</p>
            <div class="flex flex-wrap items-end gap-4">
              <form class="flex items-end gap-2" (submit)="addCopy($event)">
                <div class="flex flex-col gap-1">
                  <label for="barcode" class="text-xs text-muted">
                    Barcode <span class="text-muted">(optional — auto-generated if blank)</span>
                  </label>
                  <input
                    id="barcode"
                    class="ctl"
                    placeholder="leave blank to auto-generate"
                    [value]="barcode()"
                    (input)="barcode.set($any($event.target).value)"
                  />
                </div>
                <button
                  type="submit"
                  class="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-fg"
                >
                  Add copy
                </button>
              </form>

              <span class="pb-2 text-xs text-muted">or</span>

              <div class="flex items-end gap-2">
                <div class="flex flex-col gap-1">
                  <label for="qty" class="text-xs text-muted">Quantity (auto barcodes)</label>
                  <input
                    id="qty"
                    type="number"
                    min="1"
                    class="ctl w-28"
                    [value]="qty()"
                    (input)="qty.set(+$any($event.target).value)"
                  />
                </div>
                <button
                  type="button"
                  class="rounded-md border border-border px-3 py-2 text-sm font-medium text-fg hover:bg-bg disabled:opacity-60"
                  [disabled]="qty() < 1"
                  (click)="addMany()"
                >
                  Generate {{ qty() }} copies
                </button>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto rounded-lg border border-border bg-surface">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-border text-xs text-muted">
                <tr>
                  <th scope="col" class="px-4 py-3 font-medium">Barcode</th>
                  <th scope="col" class="px-4 py-3 font-medium">Status</th>
                  <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (copy of copies(); track copy._id) {
                  <tr class="border-b border-border last:border-0">
                    <td class="px-4 py-3 font-mono text-xs text-fg">{{ copy.barcode }}</td>
                    <td class="px-4 py-3 text-muted">{{ copy.status }}</td>
                    <td class="px-4 py-3 text-right" *appHasPermission="'copy.manage'">
                      @if (copy.status !== 'issued') {
                        <div class="flex items-center justify-end gap-2">
                          <select
                            class="ctl text-xs"
                            [value]="copy.status"
                            (change)="setStatus(copy, $any($event.target).value)"
                          >
                            <option value="available">available</option>
                            <option value="lost">lost</option>
                            <option value="damaged">damaged</option>
                          </select>
                          <button
                            type="button"
                            class="rounded-md p-1.5 text-muted hover:bg-bg hover:text-[var(--color-danger-600)]"
                            aria-label="Delete copy"
                            title="Delete"
                            (click)="removeCopy(copy)"
                          >
                            <app-icon name="trash" [size]="16" />
                          </button>
                        </div>
                      } @else {
                        <span class="text-xs text-muted">issued</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="px-4 py-8 text-center text-muted">No copies yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .ctl {
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      padding: 0.4rem 0.6rem;
      font-size: 0.8rem;
      color: var(--color-fg);
      outline: none;
    }
  `,
})
export class BookDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(BookApi);
  private readonly fieldApi = inject(BookFieldApi);
  private readonly settingsApi = inject(SettingsApi);
  private readonly toast = inject(ToastService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly book = signal<Book | null>(null);
  protected readonly copies = signal<BookCopy[]>([]);
  protected readonly fields = signal<FieldDefinition[]>([]);
  protected readonly barcode = signal('');
  protected readonly qty = signal(1);
  private readonly prefix = signal('');
  protected readonly availableCount = computed(
    () => this.copies().filter((c) => c.status === 'available').length,
  );

  constructor() {
    this.fieldApi.listMine().subscribe((list) => this.fields.set(list));
    this.settingsApi.getMine(true).subscribe({
      next: (settings) => this.prefix.set(settings.barcodePrefix ?? ''),
      error: () => {},
    });
    this.load();
  }

  protected title(b: Book): string {
    const first = this.fields()[0];
    return (first ? String(b.data[first.fieldKey] ?? '') : '') || 'Book';
  }

  protected display(value: unknown): string {
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  protected addCopy(event: Event): void {
    event.preventDefault();
    const code = this.barcode().trim() || this.genBarcode(this.copies().length + 1);
    this.api.addCopies(this.id, [code]).subscribe(() => {
      this.toast.success('Copy added');
      this.barcode.set('');
      this.load();
    });
  }

  protected addMany(): void {
    const count = this.qty();
    if (count < 1) return;
    const start = this.copies().length;
    const barcodes = Array.from({ length: count }, (_, i) => this.genBarcode(start + i + 1));
    this.api.addCopies(this.id, barcodes).subscribe(() => {
      this.toast.success(`${count} copies added`);
      this.qty.set(1);
      this.load();
    });
  }

  private genBarcode(seq: number): string {
    const base = this.prefix().trim() || 'BK';
    return `${base}-${String(seq).padStart(3, '0')}`;
  }

  protected setStatus(copy: BookCopy, status: string): void {
    this.api.updateCopyStatus(this.id, copy._id, status as CopyStatus).subscribe(() => {
      this.toast.success('Copy updated');
      this.load();
    });
  }

  protected removeCopy(copy: BookCopy): void {
    if (!confirm('Delete this copy?')) return;
    this.api.deleteCopy(this.id, copy._id).subscribe(() => {
      this.toast.success('Copy deleted');
      this.load();
    });
  }

  private load(): void {
    this.api.get(this.id).subscribe((res) => {
      this.book.set(res.book);
      this.copies.set(res.copies);
    });
  }
}
