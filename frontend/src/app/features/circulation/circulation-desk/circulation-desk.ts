import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CirculationApi } from '../../../core/api/circulation-api';
import { BookApi } from '../../../core/api/book-api';
import { UserApi } from '../../../core/api/user-api';
import { Book, BookCopy } from '../../../core/models/book.model';
import { ManagedUser } from '../../../core/models/managed-user.model';
import { Issue } from '../../../core/models/circulation.model';
import { HasPermission } from '../../../shared/directives/has-permission';
import { ToastService } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-circulation-desk',
  imports: [DatePipe, HasPermission],
  template: `
    <div class="mx-auto max-w-5xl p-6 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-fg">Circulation</h1>

      <div
        *appHasPermission="'issue.create'"
        class="mb-8 rounded-lg border border-border bg-surface p-5 shadow-card"
      >
        <h2 class="mb-4 text-lg font-semibold text-fg">Issue a book</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-fg">Book</label>
            <select class="ctl" (change)="onBook($any($event.target).value)">
              <option value="">Select book…</option>
              @for (book of books(); track book._id) {
                <option [value]="book._id">{{ bookTitle(book) }}</option>
              }
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-fg">Copy</label>
            <select
              class="ctl"
              [value]="selectedCopy()"
              (change)="selectedCopy.set($any($event.target).value)"
            >
              <option value="">Select available copy…</option>
              @for (copy of availableCopies(); track copy._id) {
                <option [value]="copy._id">{{ copy.barcode }}</option>
              }
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-fg">Member</label>
            <select
              class="ctl"
              [value]="selectedMember()"
              (change)="selectedMember.set($any($event.target).value)"
            >
              <option value="">Select member…</option>
              @for (member of members(); track member._id) {
                <option [value]="member._id">{{ member.fullName }} ({{ member.email }})</option>
              }
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-fg">Loan days</label>
            <input
              type="number"
              class="ctl"
              [value]="loanDays()"
              (input)="loanDays.set(+$any($event.target).value)"
            />
          </div>
        </div>
        <button
          type="button"
          class="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
          [disabled]="!selectedCopy() || !selectedMember()"
          (click)="issue()"
        >
          Issue book
        </button>
      </div>

      <div *appHasPermission="'issue.view'">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-fg">Active loans</h2>
          <label class="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" [checked]="overdueOnly()" (change)="toggleOverdue()" />
            Overdue only
          </label>
        </div>
        <div class="overflow-x-auto rounded-lg border border-border bg-surface">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-border text-xs text-muted">
              <tr>
                <th scope="col" class="px-4 py-3 font-medium">Member</th>
                <th scope="col" class="px-4 py-3 font-medium">Copy</th>
                <th scope="col" class="px-4 py-3 font-medium">Due</th>
                <th scope="col" class="px-4 py-3 font-medium">Fine</th>
                <th scope="col" class="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (issue of issues(); track issue._id) {
                <tr class="border-b border-border last:border-0">
                  <td class="px-4 py-3 text-fg">{{ memberName(issue) }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-muted">{{ copyBarcode(issue) }}</td>
                  <td class="px-4 py-3 text-muted">{{ issue.dueAt | date: 'mediumDate' }}</td>
                  <td class="px-4 py-3 text-muted">
                    {{ issue.fineAmount ? '₹' + issue.fineAmount : '—' }}
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div
                      *appHasPermission="'issue.return'"
                      class="flex justify-end gap-3 text-xs font-medium"
                    >
                      <button
                        type="button"
                        class="text-primary hover:underline"
                        (click)="returnLoan(issue)"
                      >
                        Return
                      </button>
                      <button
                        type="button"
                        class="text-[var(--color-danger-600)] hover:underline"
                        (click)="lost(issue)"
                      >
                        Lost
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-10 text-center text-muted">No active loans.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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
export class CirculationDesk {
  private readonly circ = inject(CirculationApi);
  private readonly bookApi = inject(BookApi);
  private readonly userApi = inject(UserApi);
  private readonly toast = inject(ToastService);

  protected readonly books = signal<Book[]>([]);
  protected readonly members = signal<ManagedUser[]>([]);
  protected readonly copies = signal<BookCopy[]>([]);
  protected readonly selectedCopy = signal('');
  protected readonly selectedMember = signal('');
  protected readonly loanDays = signal(14);
  protected readonly issues = signal<Issue[]>([]);
  protected readonly overdueOnly = signal(false);

  protected readonly availableCopies = computed(() =>
    this.copies().filter((c) => c.status === 'available'),
  );

  constructor() {
    this.bookApi.list({ limit: 200 }).subscribe((res) => this.books.set(res.items));
    this.userApi.list({ limit: 200 }).subscribe((res) => this.members.set(res.items));
    this.loadIssues();
  }

  protected bookTitle(book: Book): string {
    const keys = Object.keys(book.data);
    return keys.length ? String(book.data[keys[0]] ?? 'Book') : 'Book';
  }

  protected onBook(id: string): void {
    this.selectedCopy.set('');
    if (!id) {
      this.copies.set([]);
      return;
    }
    this.bookApi.get(id).subscribe((res) => this.copies.set(res.copies));
  }

  protected issue(): void {
    this.circ
      .issue({
        bookCopyId: this.selectedCopy(),
        memberId: this.selectedMember(),
        loanDays: this.loanDays(),
      })
      .subscribe(() => {
        this.toast.success('Book issued');
        this.selectedCopy.set('');
        this.copies.set([]);
        this.loadIssues();
      });
  }

  protected toggleOverdue(): void {
    this.overdueOnly.set(!this.overdueOnly());
    this.loadIssues();
  }

  protected returnLoan(issue: Issue): void {
    this.circ.returnBook({ issueId: issue._id }).subscribe((res) => {
      this.toast.success(res.fineAmount ? `Returned · fine ₹${res.fineAmount}` : 'Returned');
      this.loadIssues();
    });
  }

  protected lost(issue: Issue): void {
    if (!confirm('Mark this loan as lost?')) return;
    this.circ.markLost(issue._id).subscribe(() => {
      this.toast.success('Marked as lost');
      this.loadIssues();
    });
  }

  protected memberName(issue: Issue): string {
    const member = issue.member;
    return typeof member === 'object' && member ? (member.fullName ?? '—') : '—';
  }

  protected copyBarcode(issue: Issue): string {
    const copy = issue.bookCopy;
    return typeof copy === 'object' && copy ? (copy.barcode ?? '—') : '—';
  }

  private loadIssues(): void {
    const params = this.overdueOnly()
      ? { overdue: 'true', limit: 100 }
      : { status: 'issued', limit: 100 };
    this.circ.list(params).subscribe((res) => this.issues.set(res.items));
  }
}
