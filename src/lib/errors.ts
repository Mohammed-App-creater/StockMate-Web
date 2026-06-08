import { AxiosError } from 'axios';
import type { ApiError } from './types';

/**
 * Turn any thrown value from an API call into a human-readable message,
 * handling the API's `{ detail: string }` and 422 `{ detail: [...] }` shapes.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof AxiosError) {
    const detail = (err.response?.data as ApiError | undefined)?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => d.msg).join(', ');
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
