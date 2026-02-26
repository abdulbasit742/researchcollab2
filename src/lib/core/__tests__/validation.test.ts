import { describe, it, expect } from "vitest";
import {
  validateWalletAmount,
  validateOfferInput,
  validateDealInput,
  validateMilestoneInput,
  validateMessageContent,
} from "../validation";
import { ValidationError } from "../errors";

describe("validateWalletAmount", () => {
  it("accepts valid positive number", () => {
    expect(validateWalletAmount(100)).toBe(100);
    expect(validateWalletAmount(0.01)).toBe(0.01);
  });

  it("rejects zero", () => {
    expect(() => validateWalletAmount(0)).toThrow(ValidationError);
  });

  it("rejects negative", () => {
    expect(() => validateWalletAmount(-50)).toThrow(ValidationError);
  });

  it("rejects exceeding max", () => {
    expect(() => validateWalletAmount(99_999_999)).toThrow(ValidationError);
  });

  it("rejects NaN", () => {
    expect(() => validateWalletAmount(NaN)).toThrow(ValidationError);
  });

  it("rejects Infinity", () => {
    expect(() => validateWalletAmount(Infinity)).toThrow(ValidationError);
  });

  it("rejects string", () => {
    expect(() => validateWalletAmount("100")).toThrow(ValidationError);
  });
});

describe("validateOfferInput", () => {
  const validOffer = {
    title: "Test Offer",
    description: "A test offer description that is long enough",
  };

  it("accepts valid offer", () => {
    const result = validateOfferInput(validOffer);
    expect(result.title).toBe("Test Offer");
  });

  it("rejects short title", () => {
    expect(() => validateOfferInput({ ...validOffer, title: "ab" })).toThrow(ValidationError);
  });

  it("rejects short description", () => {
    expect(() => validateOfferInput({ ...validOffer, description: "short" })).toThrow(ValidationError);
  });

  it("rejects negative budget", () => {
    expect(() => validateOfferInput({ ...validOffer, budget_min: -1 })).toThrow(ValidationError);
  });
});

describe("validateDealInput", () => {
  it("accepts valid deal", () => {
    const result = validateDealInput({ title: "Deal", total_amount: 5000 });
    expect(result.total_amount).toBe(5000);
  });

  it("rejects zero amount", () => {
    expect(() => validateDealInput({ title: "Deal", total_amount: 0 })).toThrow(ValidationError);
  });

  it("rejects negative amount", () => {
    expect(() => validateDealInput({ title: "Deal", total_amount: -100 })).toThrow(ValidationError);
  });
});

describe("validateMilestoneInput", () => {
  it("accepts valid milestone", () => {
    const result = validateMilestoneInput({ title: "MS1", amount: 1000 });
    expect(result.amount).toBe(1000);
  });

  it("allows zero amount", () => {
    const result = validateMilestoneInput({ title: "MS1", amount: 0 });
    expect(result.amount).toBe(0);
  });

  it("rejects negative amount", () => {
    expect(() => validateMilestoneInput({ title: "MS1", amount: -1 })).toThrow(ValidationError);
  });
});

describe("validateMessageContent", () => {
  it("accepts valid message", () => {
    expect(validateMessageContent("Hello")).toBe("Hello");
  });

  it("trims whitespace", () => {
    expect(validateMessageContent("  Hi  ")).toBe("Hi");
  });

  it("rejects empty", () => {
    expect(() => validateMessageContent("")).toThrow(ValidationError);
  });

  it("rejects whitespace only", () => {
    expect(() => validateMessageContent("   ")).toThrow(ValidationError);
  });

  it("rejects non-string", () => {
    expect(() => validateMessageContent(123)).toThrow(ValidationError);
  });

  it("rejects too long", () => {
    expect(() => validateMessageContent("a".repeat(10001))).toThrow(ValidationError);
  });
});
