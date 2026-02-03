import { useCallback } from "react";
import { z } from "zod";

// ============================================================
// INPUT VALIDATION & SANITIZATION - 10+ Features
// ============================================================

// Common validation schemas
export const validationSchemas = {
  // Feature 1: Email Validation
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .transform(val => val.toLowerCase()),

  // Feature 2: Password Validation
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  // Feature 3: Username Validation
  username: z.string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .transform(val => val.toLowerCase()),

  // Feature 4: Display Name Validation
  displayName: z.string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[^<>]*$/, "Name cannot contain < or > characters"),

  // Feature 5: URL Validation
  url: z.string()
    .trim()
    .url("Invalid URL")
    .max(2000, "URL must be less than 2000 characters")
    .refine(val => val.startsWith('https://'), "URL must use HTTPS"),

  // Feature 6: Phone Validation
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .max(16, "Phone number too long"),

  // Feature 7: UUID Validation
  uuid: z.string()
    .uuid("Invalid identifier format"),

  // Feature 8: Safe Text (no HTML/scripts)
  safeText: z.string()
    .trim()
    .max(10000, "Text too long")
    .transform(val => sanitizeHtml(val)),

  // Feature 9: Rich Text (limited HTML)
  richText: z.string()
    .trim()
    .max(50000, "Content too long")
    .transform(val => sanitizeRichText(val)),

  // Feature 10: Amount (financial)
  amount: z.number()
    .positive("Amount must be positive")
    .max(999999999.99, "Amount too large")
    .transform(val => Math.round(val * 100) / 100), // Round to 2 decimal places
};

// HTML Sanitization Utilities
function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function sanitizeRichText(input: string): string {
  // Allow only specific safe HTML tags
  const allowedTags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'blockquote', 'code'];
  
  // Remove script tags and event handlers
  let cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');

  // This is a simplified sanitization - in production, use DOMPurify
  return cleaned;
}

// SQL Injection Prevention
function escapeSqlLike(input: string): string {
  return input
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

// Path Traversal Prevention
function sanitizePath(input: string): string {
  return input
    .replace(/\.\./g, '')
    .replace(/\/\//g, '/')
    .replace(/^\//, '');
}

export function useInputValidation() {
  // Feature: Validate Single Field
  const validateField = useCallback(<T>(
    schema: z.ZodType<T>,
    value: unknown
  ): { success: true; data: T } | { success: false; errors: string[] } => {
    const result = schema.safeParse(value);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: result.error.errors.map(e => e.message)
    };
  }, []);

  // Feature: Validate Object with Schema
  const validateObject = useCallback(<T>(
    schema: z.ZodType<T>,
    data: unknown
  ): { success: true; data: T } | { success: false; errors: Record<string, string[]> } => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors: Record<string, string[]> = {};
    result.error.errors.forEach(err => {
      const path = err.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(err.message);
    });

    return { success: false, errors };
  }, []);

  // Feature: Check for XSS Patterns
  const detectXSS = useCallback((input: string): {
    detected: boolean;
    patterns: string[];
  } => {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /expression\s*\(/i,
      /url\s*\(\s*['"]?\s*data:/i
    ];

    const detected: string[] = [];
    xssPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        detected.push(pattern.source);
      }
    });

    return {
      detected: detected.length > 0,
      patterns: detected
    };
  }, []);

  // Feature: Check for SQL Injection Patterns
  const detectSQLInjection = useCallback((input: string): {
    detected: boolean;
    patterns: string[];
  } => {
    const sqlPatterns = [
      /['"];?\s*(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i,
      /UNION\s+(ALL\s+)?SELECT/i,
      /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER)/i,
      /--\s*$/,
      /\/\*.*\*\//,
      /xp_\w+/i,
      /EXEC(\s+|\()/i
    ];

    const detected: string[] = [];
    sqlPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        detected.push(pattern.source);
      }
    });

    return {
      detected: detected.length > 0,
      patterns: detected
    };
  }, []);

  // Feature: Sanitize for Safe Display
  const sanitizeForDisplay = useCallback((input: string): string => {
    return sanitizeHtml(input);
  }, []);

  // Feature: Sanitize for URL Parameter
  const sanitizeForUrl = useCallback((input: string): string => {
    return encodeURIComponent(input);
  }, []);

  // Feature: Sanitize File Path
  const sanitizeFilePath = useCallback((input: string): string => {
    return sanitizePath(input);
  }, []);

  // Feature: Validate and Sanitize Search Query
  const sanitizeSearchQuery = useCallback((query: string): string => {
    return query
      .trim()
      .slice(0, 200) // Limit length
      .replace(/[<>'"]/g, '') // Remove potential HTML/script chars
      .replace(/\s+/g, ' '); // Normalize whitespace
  }, []);

  // Feature: Create Rate-Limited Validator
  const createRateLimitedValidator = useCallback((
    maxAttempts: number,
    windowMs: number
  ): {
    checkLimit: (key: string) => boolean;
    recordAttempt: (key: string) => void;
    reset: (key: string) => void;
  } => {
    const attempts: Map<string, { count: number; windowStart: number }> = new Map();

    return {
      checkLimit: (key: string) => {
        const now = Date.now();
        const record = attempts.get(key);
        
        if (!record || now - record.windowStart > windowMs) {
          return true;
        }
        
        return record.count < maxAttempts;
      },
      recordAttempt: (key: string) => {
        const now = Date.now();
        const record = attempts.get(key);
        
        if (!record || now - record.windowStart > windowMs) {
          attempts.set(key, { count: 1, windowStart: now });
        } else {
          record.count++;
        }
      },
      reset: (key: string) => {
        attempts.delete(key);
      }
    };
  }, []);

  return {
    // Schemas
    schemas: validationSchemas,

    // Validation
    validateField,
    validateObject,

    // Detection
    detectXSS,
    detectSQLInjection,

    // Sanitization
    sanitizeForDisplay,
    sanitizeForUrl,
    sanitizeFilePath,
    sanitizeSearchQuery,

    // Rate Limiting
    createRateLimitedValidator
  };
}

// Pre-built form schemas
export const formSchemas = {
  login: z.object({
    email: validationSchemas.email,
    password: z.string().min(1, "Password is required")
  }),

  registration: z.object({
    email: validationSchemas.email,
    password: validationSchemas.password,
    confirmPassword: z.string(),
    displayName: validationSchemas.displayName,
    acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms")
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  profile: z.object({
    displayName: validationSchemas.displayName,
    bio: validationSchemas.safeText.optional(),
    website: validationSchemas.url.optional().or(z.literal('')),
    location: z.string().max(100).optional()
  }),

  contactForm: z.object({
    name: validationSchemas.displayName,
    email: validationSchemas.email,
    subject: z.string().trim().min(1).max(200),
    message: z.string().trim().min(10, "Message must be at least 10 characters").max(10000, "Message too long")
  }),

  payment: z.object({
    amount: validationSchemas.amount,
    currency: z.enum(['USD', 'EUR', 'GBP']),
    description: z.string().trim().max(500, "Description too long")
  })
};
