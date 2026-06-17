export type BookStatus = 'active' | 'archived';
export type CopyStatus = 'available' | 'issued' | 'lost' | 'damaged';

export interface Book {
  _id: string;
  institution: string;
  data: Record<string, unknown>;
  coverUrl?: string;
  status: BookStatus;
  createdAt: string;
}

export interface BookCopy {
  _id: string;
  book: string;
  institution: string;
  barcode: string;
  status: CopyStatus;
}

export interface BookDetail {
  book: Book;
  copies: BookCopy[];
}
