/**
 * Time utilities for consistent date handling.
 */

export function toISOString(date?: Date): string {
  return (date ?? new Date()).toISOString();
}

export function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function monthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.round(ms / 86400000);
}

export function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}
