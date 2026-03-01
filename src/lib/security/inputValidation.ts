/**
 * Centralized input validation schemas for security hardening.
 * All user inputs must pass through these validators before DB operations.
 */
import { z } from "zod";

// ============================================================
// Common field validators
// ============================================================

export const safeString = (maxLength = 500) =>
  z.string().trim().max(maxLength, `Must be under ${maxLength} characters`);

export const safeText = (maxLength = 5000) =>
  z.string().trim().max(maxLength, `Must be under ${maxLength} characters`);

export const safeEmail = z.string().trim().email("Invalid email").max(255);

export const safeUrl = z.string().url("Invalid URL").max(2048);

export const safeUuid = z.string().uuid("Invalid ID format");

export const safeEnum = <T extends string>(values: readonly T[]) =>
  z.enum(values as [T, ...T[]]);

// ============================================================
// Domain-specific schemas
// ============================================================

export const messageInputSchema = z.object({
  content: safeText(10000),
  thread_id: safeUuid,
  reply_to_id: safeUuid.optional(),
});

export const searchInputSchema = z.object({
  query: safeString(200),
  filters: z.record(z.string(), z.unknown()).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const reviewFeedbackSchema = z.object({
  milestone_id: safeUuid,
  feedback: safeText(5000),
  rating: z.number().int().min(1).max(5).optional(),
  status: safeEnum(["approved", "revision_requested", "rejected"] as const),
});

export const artifactMetadataSchema = z.object({
  title: safeString(200),
  description: safeText(2000).optional(),
  tags: z.array(safeString(50)).max(20).optional(),
});

// ============================================================
// File upload validation
// ============================================================

const BLOCKED_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".msi", ".ps1", ".sh", ".bash",
  ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".scr",
  ".pif", ".com", ".dll", ".sys", ".drv",
];

const BLOCKED_MIMES = [
  "application/x-msdownload",
  "application/x-executable",
  "application/x-msdos-program",
  "application/x-sh",
  "application/x-shellscript",
  "text/x-shellscript",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function validateFileUpload(file: File): { valid: boolean; reason?: string } {
  // Size check
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, reason: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  if (file.size === 0) {
    return { valid: false, reason: "Empty files are not allowed" };
  }

  // Extension check
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return { valid: false, reason: `File type "${ext}" is not allowed` };
  }

  // MIME check
  if (BLOCKED_MIMES.includes(file.type)) {
    return { valid: false, reason: `File type "${file.type}" is blocked` };
  }

  // Filename sanitization check
  if (/[<>:"/\\|?*\x00-\x1f]/.test(file.name)) {
    return { valid: false, reason: "File name contains invalid characters" };
  }

  if (file.name.length > 255) {
    return { valid: false, reason: "File name too long" };
  }

  return { valid: true };
}

// ============================================================
// HTML sanitization for rich text
// ============================================================

const DANGEROUS_TAGS = /<script|<iframe|<object|<embed|<form|<input|<link|<meta|javascript:/gi;
const DANGEROUS_ATTRS = /\bon\w+\s*=|style\s*=\s*["'][^"']*expression/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAGS, "")
    .replace(DANGEROUS_ATTRS, "")
    .replace(/data:text\/html/gi, "");
}

export function containsDangerousContent(input: string): boolean {
  return DANGEROUS_TAGS.test(input) || DANGEROUS_ATTRS.test(input);
}
