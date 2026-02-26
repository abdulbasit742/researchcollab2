import { describe, it, expect } from "vitest";
import {
  normalizePagination, toRange, buildPaginatedResult,
} from "../pagination";

describe("Pagination", () => {
  describe("normalizePagination", () => {
    it("uses defaults", () => {
      expect(normalizePagination({})).toEqual({ page: 1, limit: 20 });
    });

    it("uses entity default", () => {
      expect(normalizePagination({}, "messages")).toEqual({ page: 1, limit: 50 });
    });

    it("clamps limit to max 100", () => {
      expect(normalizePagination({ limit: 999 })).toEqual({ page: 1, limit: 100 });
    });

    it("clamps page to min 1", () => {
      expect(normalizePagination({ page: -5 })).toEqual({ page: 1, limit: 20 });
    });
  });

  describe("toRange", () => {
    it("page 1 limit 20", () => {
      expect(toRange({ page: 1, limit: 20 })).toEqual({ from: 0, to: 19 });
    });

    it("page 3 limit 10", () => {
      expect(toRange({ page: 3, limit: 10 })).toEqual({ from: 20, to: 29 });
    });
  });

  describe("buildPaginatedResult", () => {
    it("builds correct result", () => {
      const result = buildPaginatedResult(["a", "b"], 5, { page: 1, limit: 2 });
      expect(result).toEqual({
        data: ["a", "b"],
        page: 1,
        limit: 2,
        total: 5,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("last page has no next", () => {
      const result = buildPaginatedResult(["e"], 5, { page: 3, limit: 2 });
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });
  });
});
