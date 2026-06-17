import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import { Paginated, QueryParams } from '../models/common.model';
import { Issue, IssueInput, ReturnInput } from '../models/circulation.model';

@Injectable({ providedIn: 'root' })
export class CirculationApi {
  private readonly api = inject(ApiClient);

  issue(body: IssueInput) {
    return this.api.post<Issue>('/circulation/issue', body);
  }

  returnBook(body: ReturnInput) {
    return this.api.post<Issue>('/circulation/return', body);
  }

  markLost(issueId: string) {
    return this.api.post<Issue>(`/circulation/${issueId}/lost`);
  }

  list(params?: QueryParams) {
    return this.api.get<Paginated<Issue>>('/circulation', params);
  }

  my() {
    return this.api.get<Issue[]>('/circulation/my');
  }
}
