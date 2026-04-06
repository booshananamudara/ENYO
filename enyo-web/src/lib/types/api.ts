/** Successful API response wrapper. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Error API response wrapper. */
export interface ApiErrorResponse {
  success: false;
  error: string;
  /** Per-field validation errors, keyed by field name. */
  details?: Record<string, string[]>;
}

/** Union type for all API responses. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Paginated data envelope. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated API success response. */
export type PaginatedApiResponse<T> = ApiSuccessResponse<PaginatedResponse<T>>;
