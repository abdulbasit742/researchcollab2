/**
 * Error Handler Middleware — converts internal errors to safe responses.
 * Never exposes SQL errors, stack traces, or internal state.
 */

import { DomainError } from "@/lib/core/errors";

export interface SafeErrorResponse {
  success: false;
  error: string;
  code: string;
}

export function errorToSafeResponse(error: unknown): SafeErrorResponse {
  if (error instanceof DomainError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Never expose internal errors to client
  console.error("[errorHandler] Unhandled error:", error);
  return {
    success: false,
    error: "An unexpected error occurred. Please try again.",
    code: "INTERNAL_ERROR",
  };
}
