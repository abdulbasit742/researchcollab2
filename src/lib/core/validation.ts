/**
 * Centralized validation layer — all service inputs must pass through here.
 */

import { z } from "zod";
import { ValidationError } from "./errors";

// ─── Offer Validation ───────────────────────────────────────────────────────

export const offerInputSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(10000),
  budget_min: z.number().min(0, "Budget cannot be negative").optional(),
  budget_max: z.number().min(0, "Budget cannot be negative").optional(),
  currency: z.string().default("PKR"),
  skills_required: z.array(z.string()).optional(),
});

export type OfferInput = z.infer<typeof offerInputSchema>;

export function validateOfferInput(data: unknown): OfferInput {
  const result = offerInputSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message, {
      field: String(result.error.issues[0].path[0]),
    });
  }
  return result.data;
}

// ─── Wallet Amount ──────────────────────────────────────────────────────────

export const walletAmountSchema = z.number()
  .positive("Amount must be positive")
  .finite("Amount must be finite")
  .max(10_000_000, "Amount exceeds maximum allowed");

export function validateWalletAmount(amount: unknown): number {
  const result = walletAmountSchema.safeParse(amount);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }
  return result.data;
}

// ─── Deal Input ─────────────────────────────────────────────────────────────

export const dealInputSchema = z.object({
  offer_id: z.string().uuid("Invalid offer ID").optional(),
  title: z.string().trim().min(3).max(200),
  total_amount: z.number().positive("Deal amount must be positive"),
  currency: z.string().default("PKR"),
});

export type DealInput = z.infer<typeof dealInputSchema>;

export function validateDealInput(data: unknown): DealInput {
  const result = dealInputSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }
  return result.data;
}

// ─── Milestone Input ────────────────────────────────────────────────────────

export const milestoneInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional(),
  amount: z.number().nonnegative("Milestone amount cannot be negative"),
  due_date: z.string().optional(),
});

export type MilestoneInput = z.infer<typeof milestoneInputSchema>;

export function validateMilestoneInput(data: unknown): MilestoneInput {
  const result = milestoneInputSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }
  return result.data;
}

// ─── File Upload ────────────────────────────────────────────────────────────

const MAX_FILE_SIZES: Record<string, number> = {
  avatar: 5 * 1024 * 1024,
  document: 20 * 1024 * 1024,
  milestone: 20 * 1024 * 1024,
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".ps1"];

export function validateFileUpload(
  file: File,
  category: "avatar" | "document" | "milestone" = "document"
): void {
  const maxSize = MAX_FILE_SIZES[category] ?? 20 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new ValidationError(
      `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
    );
  }

  if (category === "avatar" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ValidationError("Avatar must be a JPEG, PNG, GIF, or WebP image");
  }

  const ext = file.name.toLowerCase().split(".").pop();
  if (ext && BLOCKED_EXTENSIONS.includes(`.${ext}`)) {
    throw new ValidationError("This file type is not allowed");
  }
}

// ─── Message Content ────────────────────────────────────────────────────────

export function validateMessageContent(content: unknown): string {
  if (typeof content !== "string") {
    throw new ValidationError("Message content must be a string");
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("Message cannot be empty");
  }
  if (trimmed.length > 10000) {
    throw new ValidationError("Message is too long (max 10,000 characters)");
  }
  return trimmed;
}
