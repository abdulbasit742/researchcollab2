/**
 * ABUSE RESISTANCE ENGINE
 * System 35 Enhanced: Economic Safety & Abuse Dampening
 * 
 * Now requires JWT authentication - user_id extracted from token.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AbuseCheckAction = 
  | "check_trust_event"
  | "check_transaction"
  | "check_opportunity"
  | "check_deal_creation"
  | "check_ai_usage"
  | "detect_patterns"
  | "get_user_status"
  | "apply_penalty"
  | "resolve_flag";

interface AbuseCheckRequest {
  action: AbuseCheckAction;
  data?: Record<string, unknown>;
}

interface AbuseCheckResult {
  allowed: boolean;
  reason?: string;
  penalty_applied?: string;
  cooldown_seconds?: number;
  dampening_factor?: number;
  warnings?: string[];
}

// Threshold cache
let thresholdCache: Record<string, number> = {};
let thresholdCacheTime = 0;
const CACHE_TTL = 60000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ─── Authentication ─────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user_id = claimsData.claims.sub as string;

    const body: AbuseCheckRequest = await req.json();
    const { action, data } = body;

    // Load thresholds if cache expired
    if (Date.now() - thresholdCacheTime > CACHE_TTL) {
      await loadThresholds(supabase);
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      case "check_trust_event": {
        result = await checkTrustEvent(supabase, user_id, data);
        break;
      }
      case "check_transaction": {
        result = await checkTransaction(supabase, user_id, data);
        break;
      }
      case "check_opportunity": {
        result = await checkOpportunity(supabase, user_id);
        break;
      }
      case "check_deal_creation": {
        result = await checkDealCreation(supabase, user_id, data);
        break;
      }
      case "check_ai_usage": {
        result = await checkAIUsage(supabase, user_id);
        break;
      }
      case "detect_patterns": {
        result = await detectAbusePatterns(supabase, user_id);
        break;
      }
      case "get_user_status": {
        result = await getUserAbuseStatus(supabase, user_id);
        break;
      }
      case "apply_penalty": {
        // Only admins can apply penalties
        const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: user_id });
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Only admins can apply penalties" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const targetUserId = data?.target_user_id as string;
        if (!targetUserId) throw new Error("target_user_id required");
        result = await applyPenalty(supabase, targetUserId, data);
        break;
      }
      case "resolve_flag": {
        // Only admins can resolve flags
        const { data: isAdminResolve } = await supabase.rpc("is_admin", { check_user_id: user_id });
        if (!isAdminResolve) {
          return new Response(JSON.stringify({ error: "Only admins can resolve flags" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const targetId = data?.target_user_id as string;
        if (!targetId) throw new Error("target_user_id required");
        result = await resolveFlag(supabase, targetId, data);
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Abuse resistance error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// ============================================
// THRESHOLD LOADER
// ============================================

async function loadThresholds(supabase: ReturnType<typeof createClient>): Promise<void> {
  const { data } = await supabase
    .from("abuse_thresholds")
    .select("threshold_key, threshold_value")
    .eq("is_active", true);

  thresholdCache = {};
  data?.forEach((t: { threshold_key: string; threshold_value: number }) => {
    thresholdCache[t.threshold_key] = t.threshold_value;
  });
  thresholdCacheTime = Date.now();
}

function getThreshold(key: string, defaultValue: number): number {
  return thresholdCache[key] ?? defaultValue;
}

// ============================================
// TRUST EVENT CHECK
// ============================================

async function checkTrustEvent(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data?: Record<string, unknown>
): Promise<AbuseCheckResult> {
  const trustDelta = (data?.trust_delta as number) || 0;
  const counterpartyId = data?.counterparty_id as string;
  const warnings: string[] = [];
  let dampeningFactor = 1.0;

  const { data: profile } = await supabase
    .from("user_trust_profiles")
    .select("is_under_review, is_frozen, resurrection_cooldown_until, trust_velocity_24h, trust_velocity_7d")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile?.is_frozen) {
    return { allowed: false, reason: "Trust profile is frozen" };
  }

  if (profile?.is_under_review) {
    warnings.push("Account under review - trust events monitored closely");
    dampeningFactor *= 0.5;
  }

  if (profile?.resurrection_cooldown_until) {
    const cooldownEnd = new Date(profile.resurrection_cooldown_until);
    if (cooldownEnd > new Date()) {
      const remainingSeconds = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
      return {
        allowed: false,
        reason: "Dormant account resurrection cooldown active",
        cooldown_seconds: remainingSeconds,
      };
    }
  }

  const dailyCap = getThreshold("trust_velocity_cap_daily", 15);
  const weeklyCap = getThreshold("trust_velocity_cap_weekly", 40);

  if (trustDelta > 0) {
    const newDaily = (profile?.trust_velocity_24h || 0) + trustDelta;
    const newWeekly = (profile?.trust_velocity_7d || 0) + trustDelta;

    if (newDaily > dailyCap) {
      warnings.push(`Daily trust velocity cap (${dailyCap}) exceeded`);
      dampeningFactor *= 0.25;
    } else if (newWeekly > weeklyCap) {
      warnings.push(`Weekly trust velocity cap (${weeklyCap}) exceeded`);
      dampeningFactor *= 0.5;
    }
  }

  if (counterpartyId) {
    const reciprocalDampening = getThreshold("reciprocal_trust_dampening", 0.5);
    
    const { data: reciprocal } = await supabase
      .from("reciprocal_relationships")
      .select("mutual_trust_events, is_flagged")
      .or(`and(user_a_id.eq.${userId},user_b_id.eq.${counterpartyId}),and(user_a_id.eq.${counterpartyId},user_b_id.eq.${userId})`)
      .maybeSingle();

    if (reciprocal?.is_flagged) {
      return { allowed: false, reason: "Reciprocal relationship flagged for review" };
    }

    if (reciprocal && reciprocal.mutual_trust_events > 3) {
      warnings.push("Reciprocal trust dampening applied");
      dampeningFactor *= reciprocalDampening;
    }

    await updateReciprocalTracking(supabase, userId, counterpartyId, "trust_event");
  }

  const minEntropy = getThreshold("min_outcome_entropy", 3);
  const { count: uniqueCounterparties } = await supabase
    .from("trust_events")
    .select("reference_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if ((uniqueCounterparties || 0) < minEntropy && trustDelta > 0) {
    warnings.push("Low counterparty entropy detected");
  }

  if (warnings.length > 2 || dampeningFactor < 0.5) {
    await logAbuseDetection(supabase, userId, "trust_farming_suspected", "moderate", "trust_check", {
      warnings,
      dampening_factor: dampeningFactor,
      trust_delta: trustDelta,
    });
  }

  return {
    allowed: true,
    dampening_factor: dampeningFactor,
    warnings,
  };
}

// ============================================
// TRANSACTION CHECK
// ============================================

async function checkTransaction(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data?: Record<string, unknown>
): Promise<AbuseCheckResult> {
  const amount = (data?.amount as number) || 0;
  const counterpartyId = data?.counterparty_id as string;
  const warnings: string[] = [];

  const { data: wallet } = await supabase
    .from("wallets")
    .select("is_frozen, is_under_review, transaction_velocity_1h, transaction_velocity_24h, micro_transaction_count_24h, circular_flow_score")
    .eq("user_id", userId)
    .maybeSingle();

  if (wallet?.is_frozen) {
    return { allowed: false, reason: "Wallet is frozen" };
  }

  const hourlyVelocityCap = getThreshold("economic_velocity_cap_hourly", 10);
  if ((wallet?.transaction_velocity_1h || 0) >= hourlyVelocityCap) {
    return { allowed: false, reason: "Hourly transaction limit exceeded", cooldown_seconds: 3600 };
  }

  const dailyVelocityCap = getThreshold("economic_velocity_cap_daily", 50);
  if ((wallet?.transaction_velocity_24h || 0) >= dailyVelocityCap) {
    return { allowed: false, reason: "Daily transaction limit exceeded", cooldown_seconds: 86400 };
  }

  const microThreshold = getThreshold("economic_micro_threshold", 500);
  if (amount < microThreshold) {
    const microCount = (wallet?.micro_transaction_count_24h || 0) + 1;
    if (microCount > 20) {
      warnings.push("Excessive micro-transactions detected");
      await logAbuseDetection(supabase, userId, "fee_arbitrage_attempt", "moderate", "transaction_check", {
        micro_count: microCount, amount,
      });
    }
  }

  const circularThreshold = getThreshold("circular_flow_threshold", 0.3);
  if ((wallet?.circular_flow_score || 0) > circularThreshold) {
    warnings.push("Circular transaction pattern detected");
    if ((wallet?.circular_flow_score || 0) > 0.6) {
      return { allowed: false, reason: "Suspicious circular transaction pattern" };
    }
  }

  if (counterpartyId) {
    await updateReciprocalTracking(supabase, userId, counterpartyId, "transaction");
  }

  return { allowed: true, warnings };
}

// ============================================
// OPPORTUNITY POST CHECK
// ============================================

async function checkOpportunity(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<AbuseCheckResult> {
  const dailyLimit = getThreshold("opportunity_post_rate_daily", 5);
  const weeklyLimit = getThreshold("opportunity_post_rate_weekly", 15);

  const rateCheck = await checkRateLimit(supabase, userId, "opportunity_post", dailyLimit, 24);
  if (!rateCheck.allowed) return rateCheck;

  const { count: weeklyCount } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", userId)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if ((weeklyCount || 0) >= weeklyLimit) {
    return { allowed: false, reason: "Weekly opportunity posting limit reached" };
  }

  const { data: recentOffers } = await supabase
    .from("offers")
    .select("title, description, spam_score")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  const avgSpamScore = recentOffers?.reduce((sum: number, o: any) => sum + (o.spam_score || 0), 0) / (recentOffers?.length || 1);
  if (avgSpamScore > 0.7) {
    return { allowed: false, reason: "Content quality too low - suspected spam" };
  }

  return { allowed: true };
}

// ============================================
// DEAL CREATION CHECK
// ============================================

async function checkDealCreation(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data?: Record<string, unknown>
): Promise<AbuseCheckResult> {
  const amount = (data?.amount as number) || 0;
  const warnings: string[] = [];

  const minAmount = getThreshold("min_deal_amount", 1000);
  if (amount < minAmount) {
    return { allowed: false, reason: `Minimum deal amount is ${minAmount} PKR` };
  }

  const { data: profile } = await supabase
    .from("user_trust_profiles")
    .select("dispute_rate")
    .eq("user_id", userId)
    .maybeSingle();

  const disputeThreshold = getThreshold("dispute_rate_threshold", 0.25);
  if ((profile?.dispute_rate || 0) > disputeThreshold) {
    warnings.push("High dispute rate - deal under enhanced monitoring");
    return { allowed: true, warnings, penalty_applied: "enhanced_monitoring" };
  }

  const { count: activeDisputes } = await supabase
    .from("disputes")
    .select("id", { count: "exact", head: true })
    .eq("raised_by_id", userId)
    .eq("status", "open");

  if ((activeDisputes || 0) >= 3) {
    return { allowed: false, reason: "Too many active disputes - resolve existing disputes first" };
  }

  return { allowed: true, warnings };
}

// ============================================
// AI USAGE CHECK
// ============================================

async function checkAIUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<AbuseCheckResult> {
  const hourlyLimit = getThreshold("ai_recommendation_rate_hourly", 20);
  return await checkRateLimit(supabase, userId, "ai_recommendation", hourlyLimit, 1);
}

// ============================================
// PATTERN DETECTION
// ============================================

async function detectAbusePatterns(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{ patterns_detected: string[]; risk_score: number; actions_taken: string[] }> {
  const patternsDetected: string[] = [];
  const actionsTaken: string[] = [];
  let riskScore = 0;

  const { data: trustEvents } = await supabase
    .from("trust_events")
    .select("trust_delta, reference_id, created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const positiveEvents = trustEvents?.filter((e: any) => e.trust_delta > 0) || [];
  const uniqueRefs = new Set(positiveEvents.map((e: any) => e.reference_id)).size;
  
  if (positiveEvents.length > 10 && uniqueRefs < 3) {
    patternsDetected.push("trust_farming_low_entropy");
    riskScore += 30;
  }

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("type, amount, reference_id")
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const inflow = transactions?.filter((t: any) => t.type === "credit").reduce((s: number, t: any) => s + t.amount, 0) || 0;
  const outflow = transactions?.filter((t: any) => t.type === "debit").reduce((s: number, t: any) => s + t.amount, 0) || 0;
  
  if (inflow > 0 && outflow > 0 && Math.abs(inflow - outflow) < inflow * 0.1) {
    patternsDetected.push("circular_flow_suspected");
    riskScore += 25;
  }

  const velocity1h = transactions?.length || 0;
  if (velocity1h > 5) {
    patternsDetected.push("high_transaction_velocity");
    riskScore += 15;
  }

  if (riskScore >= 40) {
    await logAbuseDetection(supabase, userId, "multi_pattern_abuse", "high", "pattern_detection", {
      patterns: patternsDetected,
      risk_score: riskScore,
    });
    actionsTaken.push("flagged_for_review");
  }

  return { patterns_detected: patternsDetected, risk_score: riskScore, actions_taken: actionsTaken };
}

// ============================================
// USER ABUSE STATUS
// ============================================

async function getUserAbuseStatus(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Record<string, unknown>> {
  const { data: detections } = await supabase
    .from("abuse_detections")
    .select("*")
    .eq("user_id", userId)
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: trustProfile } = await supabase
    .from("user_trust_profiles")
    .select("is_frozen, is_under_review, trust_velocity_24h, trust_velocity_7d")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("is_frozen, is_under_review, circular_flow_score")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    active_flags: detections?.length || 0,
    detections: detections || [],
    trust_status: {
      frozen: trustProfile?.is_frozen || false,
      under_review: trustProfile?.is_under_review || false,
      velocity_24h: trustProfile?.trust_velocity_24h || 0,
      velocity_7d: trustProfile?.trust_velocity_7d || 0,
    },
    wallet_status: {
      frozen: wallet?.is_frozen || false,
      under_review: wallet?.is_under_review || false,
      circular_flow_score: wallet?.circular_flow_score || 0,
    },
  };
}

// ============================================
// PENALTY APPLICATION (Admin only)
// ============================================

async function applyPenalty(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const penaltyType = (data?.penalty_type as string) || "warning";
  const reason = (data?.reason as string) || "Abuse pattern detected";

  if (penaltyType === "trust_reduction") {
    const reduction = (data?.reduction as number) || 10;
    const { data: profile } = await supabase
      .from("user_trust_profiles")
      .select("trust_score")
      .eq("user_id", userId)
      .single();

    const oldScore = profile?.trust_score || 0;
    const newScore = Math.max(0, oldScore - reduction);

    await supabase
      .from("user_trust_profiles")
      .update({ trust_score: newScore, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    await supabase.from("trust_events").insert({
      user_id: userId,
      event_type: "abuse_penalty",
      event_source: "abuse_resistance",
      trust_delta: -reduction,
      trust_before: oldScore,
      trust_after: newScore,
      evidence_summary: reason,
    });

    return { success: true, penalty: "trust_reduction", old_score: oldScore, new_score: newScore };
  }

  if (penaltyType === "freeze") {
    await supabase
      .from("user_trust_profiles")
      .update({ is_frozen: true, frozen_reason: reason, frozen_at: new Date().toISOString() })
      .eq("user_id", userId);
    return { success: true, penalty: "freeze", reason };
  }

  return { success: true, penalty: "warning", reason };
}

// ============================================
// RESOLVE FLAG (Admin only)
// ============================================

async function resolveFlag(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const flagId = data?.flag_id as string;
  const resolution = (data?.resolution as string) || "resolved";

  if (flagId) {
    await supabase
      .from("abuse_detections")
      .update({ resolved: true, resolved_at: new Date().toISOString(), resolution_notes: resolution })
      .eq("id", flagId);
  } else {
    await supabase
      .from("abuse_detections")
      .update({ resolved: true, resolved_at: new Date().toISOString(), resolution_notes: resolution })
      .eq("user_id", userId)
      .eq("resolved", false);
  }

  return { success: true, resolved: true };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  actionType: string,
  limit: number,
  windowHours: number
): Promise<AbuseCheckResult> {
  const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  
  const { count } = await supabase
    .from("state_transition_logs")
    .select("id", { count: "exact", head: true })
    .eq("triggered_by", userId)
    .eq("entity_type", actionType)
    .gte("created_at", windowStart);

  if ((count || 0) >= limit) {
    return {
      allowed: false,
      reason: `Rate limit exceeded for ${actionType} (${limit} per ${windowHours}h)`,
      cooldown_seconds: windowHours * 3600,
    };
  }

  return { allowed: true };
}

async function updateReciprocalTracking(
  supabase: ReturnType<typeof createClient>,
  userA: string,
  userB: string,
  eventType: string
): Promise<void> {
  const [firstId, secondId] = [userA, userB].sort();
  
  const { data: existing } = await supabase
    .from("reciprocal_relationships")
    .select("id, mutual_trust_events, mutual_economic_events")
    .or(`and(user_a_id.eq.${firstId},user_b_id.eq.${secondId})`)
    .maybeSingle();

  if (existing) {
    const field = eventType === "trust_event" ? "mutual_trust_events" : "mutual_economic_events";
    await supabase
      .from("reciprocal_relationships")
      .update({ [field]: (existing[field] || 0) + 1, last_interaction_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("reciprocal_relationships")
      .insert({
        user_a_id: firstId,
        user_b_id: secondId,
        [eventType === "trust_event" ? "mutual_trust_events" : "mutual_economic_events"]: 1,
        last_interaction_at: new Date().toISOString(),
      });
  }
}

async function logAbuseDetection(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  patternType: string,
  severity: string,
  source: string,
  evidence: Record<string, unknown>
): Promise<void> {
  await supabase
    .from("abuse_detections")
    .insert({
      user_id: userId,
      pattern_type: patternType,
      severity,
      detection_source: source,
      evidence,
    });
}
