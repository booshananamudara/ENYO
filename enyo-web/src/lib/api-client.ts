import type { ApiResponse, ApiSuccessResponse } from '@/lib/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';

/** Typed fetch helper that handles JSON parsing and error extraction. */
async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error || 'An error occurred');
  }

  return (json as ApiSuccessResponse<T>).data;
}

/** Typed GET request. */
export function apiGet<T>(url: string, params?: Record<string, string>): Promise<T> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<T>(`${url}${query}`);
}

/** Typed POST request. */
export function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Typed PATCH request. */
export function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Typed PUT request. */
export function apiPut<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Typed DELETE request. */
export function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: 'DELETE' });
}
