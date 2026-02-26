/**
 * Structured domain error hierarchy.
 * All service-layer errors should extend DomainError.
 */

export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code = "DOMAIN_ERROR",
    statusCode = 400,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, context);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends DomainError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends DomainError {
  constructor(message = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super(
      id ? `${entity} not found: ${id}` : `${entity} not found`,
      "NOT_FOUND",
      404,
      { entity, id }
    );
    this.name = "NotFoundError";
  }
}

export class FinancialInvariantError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "FINANCIAL_INVARIANT", 500, context);
    this.name = "FinancialInvariantError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

/**
 * Convert a domain error to a user-friendly message.
 */
export function errorToUserMessage(error: unknown): string {
  if (error instanceof DomainError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

/**
 * Type guard for DomainError hierarchy.
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Wrap an async operation with structured error handling.
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | undefined; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    return { data: fallback, error: errorToUserMessage(err) };
  }
}
