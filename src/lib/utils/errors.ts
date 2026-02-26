/**
 * Shared error utilities for service layer.
 */

export class AppError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code = "UNKNOWN", statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

/**
 * Wrap an async operation with consistent error handling.
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | undefined; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error("[safeAsync]", msg);
    return { data: fallback, error: msg };
  }
}
