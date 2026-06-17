import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CirculationApi } from '../../../core/api/circulation-api';
import { Issue } from '../../../core/models/circulation.model';
import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-my-issues',
  imports: [DatePipe],
  template: `
    <div class="mx-auto max-w-4xl p-6 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-fg">My books</h1>

      @if (issues().length === 0) {
        <div
          class="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface py-12"
        >
          <img [src]="emptyImg()" alt="" width="240" height="180" class="w-48" />
          <p class="text-sm text-muted">You have no borrowed books.</p>
        </div>
      } @else {
        <div class="overflow-x-auto rounded-lg border border-border bg-surface">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-border text-xs text-muted">
              <tr>
                <th scope="col" class="px-4 py-3 font-medium">Copy</th>
                <th scope="col" class="px-4 py-3 font-medium">Issued</th>
                <th scope="col" class="px-4 py-3 font-medium">Due</th>
                <th scope="col" class="px-4 py-3 font-medium">Status</th>
                <th scope="col" class="px-4 py-3 font-medium">Fine</th>
              </tr>
            </thead>
            <tbody>
              @for (issue of issues(); track issue._id) {
                <tr class="border-b border-border last:border-0">
                  <td class="px-4 py-3 font-mono text-xs text-fg">{{ barcode(issue) }}</td>
                  <td class="px-4 py-3 text-muted">{{ issue.issuedAt | date: 'mediumDate' }}</td>
                  <td class="px-4 py-3 text-muted">{{ issue.dueAt | date: 'mediumDate' }}</td>
                  <td class="px-4 py-3 text-muted">{{ issue.status }}</td>
                  <td class="px-4 py-3 text-muted">
                    {{ issue.fineAmount ? '₹' + issue.fineAmount : '—' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class MyIssues {
  private readonly circ = inject(CirculationApi);
  private readonly theme = inject(ThemeService);

  protected readonly issues = signal<Issue[]>([]);
  protected readonly emptyImg = computed(() =>
    this.theme.dark() ? '/empty-loans-dark.svg' : '/empty-loans.svg',
  );

  constructor() {
    this.circ.my().subscribe((list) => this.issues.set(list));
  }

  protected barcode(issue: Issue): string {
    const copy = issue.bookCopy;
    return typeof copy === 'object' && copy ? (copy.barcode ?? '—') : '—';
  }
}
