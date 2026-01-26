/**
 * Currency formatting utilities for PKR (Pakistani Rupee)
 */

/**
 * Format a number as PKR currency
 * @param amount - The amount to format
 * @returns Formatted string like "PKR 5,000"
 */
export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

/**
 * Format a budget range in PKR
 * @param min - Minimum budget
 * @param max - Maximum budget
 * @returns Formatted string like "PKR 50,000 - 80,000"
 */
export function formatPKRRange(min: number, max: number): string {
  return `PKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

/**
 * Format currency with optional rate suffix
 * @param amount - The amount to format
 * @param isHourly - Whether to add "/hr" suffix
 * @returns Formatted string
 */
export function formatPKRRate(amount: number, isHourly: boolean = false): string {
  return `PKR ${amount.toLocaleString()}${isHourly ? "/hr" : ""}`;
}
