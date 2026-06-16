export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiFieldError {
  path?: string;
  message: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  success: false;
  errors?: ApiFieldError[];
}
