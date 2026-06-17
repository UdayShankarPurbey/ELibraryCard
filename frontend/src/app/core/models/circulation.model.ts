export type IssueStatus = 'issued' | 'returned' | 'overdue' | 'lost';

export interface IssueMemberRef {
  _id?: string;
  fullName?: string;
  email?: string;
}

export interface IssueCopyRef {
  _id?: string;
  barcode?: string;
}

export interface Issue {
  _id: string;
  institution: string;
  bookCopy: IssueCopyRef | string;
  member: IssueMemberRef | string;
  issuedBy?: string;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  fineAmount: number;
  status: IssueStatus;
}

export interface IssueInput {
  bookCopyId: string;
  memberId: string;
  dueAt?: string;
  loanDays?: number;
}

export interface ReturnInput {
  issueId?: string;
  bookCopyId?: string;
}
