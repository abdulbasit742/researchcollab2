/**
 * Security Headers — configurable for Vite dev server and production deployments.
 * For Vercel/Netlify, export as header config. For Vite dev, use as plugin.
 */

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
};

/**
 * Content Security Policy for production.
 */
export const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

/**
 * Get all security headers as a flat object.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    "Content-Security-Policy": CSP_HEADER,
  };
}

/**
 * Vercel headers config format (for vercel.json).
 */
export function getVercelHeadersConfig() {
  const headers = getSecurityHeaders();
  return Object.entries(headers).map(([key, value]) => ({
    key,
    value,
  }));
}
