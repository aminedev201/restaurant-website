// lib/parseApiErrors.ts

import { AxiosError } from 'axios';

interface LaravelValidationError {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
}

/**
 * Parses an Axios error and returns a flat Record<field, firstMessage>.
 * Falls back to { api: message } for non-validation errors.
 */
export function parseApiErrors(err: unknown): Record<string, string> {
  const axiosErr = err as AxiosError<LaravelValidationError>;

  if (axiosErr?.response?.data?.errors) {
    const raw = axiosErr.response.data.errors;
    // Take only the first message per field
    return Object.fromEntries(
      Object.entries(raw).map(([field, messages]) => [field, messages[0]])
    );
  }

  const message =
    axiosErr?.response?.data?.message ??
    (err instanceof Error ? err.message : 'Something went wrong.');

  return { api: message };
}