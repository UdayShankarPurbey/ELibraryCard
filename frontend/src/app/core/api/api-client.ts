import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiResponse } from '../models/api-response.model';
import { QueryParams } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.unwrap(
      this.http.get<ApiResponse<T>>(this.url(path), {
        params: this.toParams(params),
        withCredentials: true,
      }),
    );
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.unwrap(
      this.http.post<ApiResponse<T>>(this.url(path), body ?? {}, { withCredentials: true }),
    );
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.unwrap(
      this.http.patch<ApiResponse<T>>(this.url(path), body ?? {}, { withCredentials: true }),
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.unwrap(this.http.delete<ApiResponse<T>>(this.url(path), { withCredentials: true }));
  }

  postForm<T>(path: string, form: FormData): Observable<T> {
    return this.unwrap(
      this.http.post<ApiResponse<T>>(this.url(path), form, { withCredentials: true }),
    );
  }

  patchForm<T>(path: string, form: FormData): Observable<T> {
    return this.unwrap(
      this.http.patch<ApiResponse<T>>(this.url(path), form, { withCredentials: true }),
    );
  }

  private unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
    return source.pipe(map((res) => res.data));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private toParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
