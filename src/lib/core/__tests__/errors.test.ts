import { describe, it, expect } from "vitest";
import {
  DomainError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  FinancialInvariantError,
  ConflictError,
  errorToUserMessage,
  isDomainError,
} from "../errors";

describe("DomainError hierarchy", () => {
  it("creates DomainError with defaults", () => {
    const err = new DomainError("test");
    expect(err.message).toBe("test");
    expect(err.code).toBe("DOMAIN_ERROR");
    expect(err.statusCode).toBe(400);
  });

  it("ValidationError has correct code", () => {
    const err = new ValidationError("bad input", { field: "name" });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.statusCode).toBe(400);
    expect(err.context).toEqual({ field: "name" });
  });

  it("AuthenticationError has 401", () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
  });

  it("AuthorizationError has 403", () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
  });

  it("NotFoundError includes entity info", () => {
    const err = new NotFoundError("Wallet", "abc");
    expect(err.message).toContain("Wallet");
    expect(err.message).toContain("abc");
    expect(err.statusCode).toBe(404);
  });

  it("FinancialInvariantError has 500", () => {
    const err = new FinancialInvariantError("bad state");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("FINANCIAL_INVARIANT");
  });

  it("ConflictError has 409", () => {
    const err = new ConflictError("already exists");
    expect(err.statusCode).toBe(409);
  });
});

describe("errorToUserMessage", () => {
  it("extracts DomainError message", () => {
    expect(errorToUserMessage(new ValidationError("bad"))).toBe("bad");
  });

  it("handles plain Error", () => {
    expect(errorToUserMessage(new Error("oops"))).toBe("oops");
  });

  it("handles string", () => {
    expect(errorToUserMessage("fail")).toBe("fail");
  });

  it("handles unknown", () => {
    expect(errorToUserMessage(42)).toBe("An unexpected error occurred");
  });
});

describe("isDomainError", () => {
  it("returns true for DomainError subclasses", () => {
    expect(isDomainError(new ValidationError("x"))).toBe(true);
    expect(isDomainError(new FinancialInvariantError("x"))).toBe(true);
  });

  it("returns false for plain errors", () => {
    expect(isDomainError(new Error("x"))).toBe(false);
    expect(isDomainError("string")).toBe(false);
  });
});
