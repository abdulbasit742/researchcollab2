/**
 * Production Stability Checklist — Phase 10.
 *
 * Programmatic checks for launch readiness.
 * Run via console: import { runChecklist } from '@/lib/productionChecklist'
 */

import { supabase } from "@/integrations/supabase/client";

export interface CheckResult {
  name: string;
  category: "security" | "financial" | "data" | "infrastructure";
  passed: boolean;
  detail: string;
}

export async function runChecklist(): Promise<{
  score: number;
  total: number;
  passed: number;
  results: CheckResult[];
}> {
  const results: CheckResult[] = [];

  // 1. Auth working
  const { data: { session } } = await supabase.auth.getSession();
  results.push({
    name: "Auth session available",
    category: "security",
    passed: !!session,
    detail: session ? "Authenticated" : "No active session — test while logged in",
  });

  // 2. Wallet table accessible
  if (session) {
    const { error: walletErr } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", session.user.id)
      .limit(1);
    results.push({
      name: "Wallet RLS working",
      category: "financial",
      passed: !walletErr,
      detail: walletErr ? walletErr.message : "Wallet accessible",
    });
  }

  // 3. Deal rooms accessible
  if (session) {
    const { error: dealErr } = await supabase
      .from("deal_rooms")
      .select("id")
      .limit(1);
    results.push({
      name: "Deal rooms RLS working",
      category: "data",
      passed: !dealErr,
      detail: dealErr ? dealErr.message : "Deals accessible",
    });
  }

  // 4. Notifications table
  if (session) {
    const { error: notifErr } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", session.user.id)
      .limit(1);
    results.push({
      name: "Notifications accessible",
      category: "data",
      passed: !notifErr,
      detail: notifErr ? notifErr.message : "OK",
    });
  }

  // 5. Platform fees table exists
  const { error: feeErr } = await supabase
    .from("platform_fees")
    .select("id")
    .limit(1);
  results.push({
    name: "Platform fees table accessible",
    category: "financial",
    passed: !feeErr,
    detail: feeErr ? feeErr.message : "OK",
  });

  // 6. Admin audit logs
  const { error: auditErr } = await supabase
    .from("admin_audit_logs")
    .select("id")
    .limit(1);
  results.push({
    name: "Audit logs accessible",
    category: "security",
    passed: !auditErr,
    detail: auditErr ? auditErr.message : "OK",
  });

  // 7. Profiles table
  if (session) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.user.id)
      .maybeSingle();
    results.push({
      name: "Profile exists for current user",
      category: "data",
      passed: !!profile && !profileErr,
      detail: profileErr ? profileErr.message : profile ? "Profile found" : "No profile — auto-create may be needed",
    });
  }

  // 8. Environment variables
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  results.push({
    name: "Environment variables configured",
    category: "infrastructure",
    passed: hasUrl && hasKey,
    detail: `URL: ${hasUrl ? "✓" : "✗"}, Key: ${hasKey ? "✓" : "✗"}`,
  });

  const passed = results.filter(r => r.passed).length;
  return {
    score: Math.round((passed / results.length) * 100),
    total: results.length,
    passed,
    results,
  };
}

/**
 * Core metrics to track (Phase 10 mandate).
 */
export const LAUNCH_METRICS = [
  "GMV (Gross deal volume)",
  "Take rate (platform fee %)",
  "Active deals count",
  "Deal completion %",
  "Dispute %",
  "User retention (30-day)",
  "University count",
  "Sponsor count",
] as const;
