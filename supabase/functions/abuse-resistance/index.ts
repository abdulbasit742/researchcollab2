/**
 * ABUSE RESISTANCE ENGINE
 * System 35 Enhanced: Economic Safety & Abuse Dampening
 * 
 * Detects and prevents:
 * - Trust farming
 * - Economic exploits
 * - Spam/flooding
 * - Reciprocal trust inflation
 * - Dormant account resurrection abuse
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AbuseCheckAction = 
  | "check_trust_event"      // Before applying trust event
  | "check_transaction"      // Before processing transaction
  | "check_opportunity"      // Before posting opportunity
  | "check_deal_creation"    // Before creating deal
  | "check_ai_usage"         // Before AI recommendation
  | "detect_patterns"        // Run pattern detection
  | "get_user_status"        // Get current abuse status
  | "apply_penalty"          // Apply penalty
  | "resolve_flag";          // Resolve abuse flag

interface AbuseCheckRequest {
  action: AbuseCheckAction;
  user_id: string;
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

// Threshold cache (loaded from DB)
let thresholdCache: Record<string, number> = {};
let thresholdCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: AbuseCheckRequest = await req.json();
    const { action, user_id, data } = body;

    if (!user_id) throw new Error("user_id is required");

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
        result = await applyPenalty(supabase, user_id, data);
        break;
      }

      case "resolve_flag": {
        result = await resolveFlag(supabase, user_id, data);
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

  // 1. Check if user is under review
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

  // 2. Check resurrection cooldown (dormant account abuse)
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

  // 3. Check velocity caps (anti-farming)
  const dailyCap = getThreshold("trust_velocity_cap_daily", 15);
  const weeklyCap = getThreshold("trust_velocity_cap_weekly", 40);

  if (trustDelta > 0) {
    const newDaily = (profile?.trust_velocity_24h || 0) + trustDelta;
    const newWeekly = (profile?.trust_velocity_7d || 0) + trustDelta;

    if (newDaily > dailyCap) {
      warnings.push(`Daily trust velocity cap (${dailyCap}) exceeded`);
      dampeningFactor *= 0.25; // Severe dampening
    } else if (newWeekly > weeklyCap) {
      warnings.push(`Weekly trust velocity cap (${weeklyCap}) exceeded`);
      dampeningFactor *= 0.5;
    }
  }

  // 4. Check reciprocal relationship (trust ring detection)
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

    // Update or create reciprocal tracking
    await updateReciprocalTracking(supabase, userId, counterpartyId, "trust_event");
  }

  // 5. Check minimum entropy (unique counterparties)
  const minEntropy = getThreshold("min_outcome_entropy", 3);
  const { count: uniqueCounterparties } = await supabase
    .from("trust_events")
    .select("reference_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if ((uniqueCounterparties || 0) < minEntropy && trustDelta > 0) {
    warnings.push("Low counterparty entropy detected");
  }

  // Log detection if suspicious
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

  // 1. Get wallet status
  const { data: wallet } = await supabase
    .from("wallets")
    .select("is_frozen, is_under_review, transaction_velocity_1h, transaction_velocity_24h, micro_transaction_count_24h, circular_flow_score")
    .eq("user_id", userId)
    .maybeSingle();

  if (wallet?.is_frozen) {
    return { allowed: false, reason: "Wallet is frozen" };
  }

  // 2. Check hourly velocity cap
  const hourlyVelocityCap = getThreshold("economic_velocity_cap_hourly", 10);
  if ((wallet?.transaction_velocity_1h || 0) >= hourlyVelocityCap) {
    return {
      allowed: false,
      reason: "Hourly transaction limit exceeded",
      cooldown_seconds: 3600,
    };
  }

  // 3. Check daily velocity cap
  const dailyVelocityCap = getThreshold("economic_velocity_cap_daily", 50);
  if ((wallet?.transaction_velocity_24h || 0) >= dailyVelocityCap) {
    return {
      allowed: false,
      reason: "Daily transaction limit exceeded",
      cooldown_seconds: 86400,
    };
  }

  // 4. Check micro-transaction abuse
  const microThreshold = getThreshold("economic_micro_threshold", 500);
  if (amount < microThreshold) {
    const microCount = (wallet?.micro_transaction_count_24h || 0) + 1;
    if (microCount > 20) {
      warnings.push("Excessive micro-transactions detected");
      await logAbuseDetection(supabase, userId, "fee_arbitrage_attempt", "moderate", "transaction_check", {
        micro_count: microCount,
        amount,
      });
    }
  }

  // 5. Check circular flow (money laundering pattern)
  const circularThreshold = getThreshold("circular_flow_threshold", 0.3);
  if ((wallet?.circular_flow_score || 0) > circularThreshold) {
    warnings.push("Circular transaction pattern detected");
    if ((wallet?.circular_flow_score || 0) > 0.6) {
      return { allowed: false, reason: "Suspicious circular transaction pattern" };
    }
  }

  // 6. Update reciprocal tracking for economic transactions
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

  // Check rate limit
  const rateCheck = await checkRateLimit(supabase, userId, "opportunity_post", dailyLimit, 24);
  if (!rateCheck.allowed) {
    return rateCheck;
  }

  // Check weekly limit
  const { count: weeklyCount } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", userId)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if ((weeklyCount || 0) >= weeklyLimit) {
    return { allowed: false, reason: "Weekly opportunity posting limit reached" };
  }

  // Check for keyword stuffing / spam patterns
  const { data: recentOffers } = await supabase
    .from("offers")
    .select("title, description, spam_score")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  const avgSpamScore = recentOffers?.reduce((sum, o) => sum + (o.spam_score || 0), 0) / (recentOffers?.length || 1);
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

  // 1. Check minimum deal amount
  const minAmount = getThreshold("min_deal_amount", 1000);
  if (amount < minAmount) {
    return { allowed: false, reason: `Minimum deal amount is ${minAmount} PKR` };
  }

  // 2. Check dispute rate
  const { data: profile } = await supabase
    .from("user_trust_profiles")
    .select("dispute_rate")
    .eq("user_id", userId)
    .maybeSingle();

  const disputeThreshold = getThreshold("dispute_rate_threshold", 0.25);
  if ((profile?.dispute_rate || 0) > disputeThreshold) {
    warnings.push("High dispute rate - deal under enhanced monitoring");
    
    // Require proof-of-work for high dispute rate users
    return {
      allowed: true,
      warnings,
      penalty_applied: "enhanced_monitoring",
    };
  }

  // 3. Check for active dispute abuse
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

  // 1. Trust farming detection
  const { data: trustEvents } = await supabase
    .from("trust_events")
    .select("trust_delta, reference_id, created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const positiveEvents = trustEvents?.filter(e => e.trust_delta > 0) || [];
  const uniqueRefs = new Set(positiveEvents.map(e => e.reference_id)).size;
  
  if (positiveEvents.length > 10 && uniqueRefs < 3) {
    patternsDetected.push("trust_farming_low_entropy");
    riskScore += 30;
  }

  // 2. Circular transaction detection
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("type, amount, reference_id")
    .eq("user_id", userId)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const inflow = transactions?.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0) || 0;
  const outflow = transactions?.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0) || 0;
  
  if (inflow > 0 && outflow > 0 && Math.abs(inflow - outflow) < inflow * 0.1) {
    patternsDetected.push("circular_flow_suspected");
    riskScore += 25;
  }

  // 3. Rapid velocity detection
  const velocity1h = transactions?.length || 0;
  if (velocity1h > 5) {
    patternsDetected.push("high_transaction_velocity");
    riskScore += 15;
  }

  // 4. Reciprocal trust ring detection
  const { data: reciprocals } = await supabase
    .from("reciprocal_relationships")
    .select("mutual_trust_events")
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .gt("mutual_trust_events", 3);

  if ((reciprocals?.length || 0) > 2) {
    patternsDetected.push("reciprocal_trust_ring");
    riskScore += 20;
  }

  // Apply automatic actions based on risk
  if (riskScore >= 50) {
    await supabase
      .from("user_trust_profiles")
      .update({ is_under_review: true, review_reason: patternsDetected.join(", ") })
      .eq("user_id", userId);
    actionsTaken.push("Account flagged for review");

    await logAbuseDetection(supabase, userId, "multi_pattern_abuse", "severe", "pattern_detection", {
      patterns: patternsDetected,
      risk_score: riskScore,
    });
  } else if (riskScore >= 30) {
    await logAbuseDetection(supabase, userId, "suspicious_activity", "warning", "pattern_detection", {
      patterns: patternsDetected,
      risk_score: riskScore,
    });
    actionsTaken.push("Warning logged");
  }

  return { patterns_detected: patternsDetected, risk_score: riskScore, actions_taken: actionsTaken };
}

// ============================================
// USER STATUS
// ============================================

async function getUserAbuseStatus(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Record<string, unknown>> {
  const { data: profile } = await supabase
    .from("user_trust_profiles")
    .select("is_frozen, is_under_review, review_reason, trust_velocity_24h, trust_velocity_7d")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("is_frozen, is_under_review, transaction_velocity_24h, circular_flow_score, risk_score")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: recentFlags } = await supabase
    .from("abuse_detections")
    .select("pattern_type, severity, created_at, resolved")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: rateLimits } = await supabase
    .from("user_rate_limits")
    .select("action_type, action_count, max_allowed, is_blocked, blocked_until")
    .eq("user_id", userId);

  return {
    trust_status: {
      frozen: profile?.is_frozen || false,
      under_review: profile?.is_under_review || false,
      review_reason: profile?.review_reason,
      velocity_24h: profile?.trust_velocity_24h || 0,
      velocity_7d: profile?.trust_velocity_7d || 0,
    },
    economic_status: {
      wallet_frozen: wallet?.is_frozen || false,
      wallet_under_review: wallet?.is_under_review || false,
      velocity_24h: wallet?.transaction_velocity_24h || 0,
      circular_flow_score: wallet?.circular_flow_score || 0,
      risk_score: wallet?.risk_score || 0,
    },
    recent_flags: recentFlags || [],
    rate_limits: rateLimits || [],
  };
}

// ============================================
// PENALTY APPLICATION
// ============================================

async function applyPenalty(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; penalty: string }> {
  const penaltyType = data?.penalty_type as string;
  const reason = data?.reason as string;

  switch (penaltyType) {
    case "freeze_trust":
      await supabase
        .from("user_trust_profiles")
        .update({ is_frozen: true, frozen_reason: reason, frozen_at: new Date().toISOString() })
        .eq("user_id", userId);
      break;

    case "freeze_wallet":
      await supabase
        .from("wallets")
        .update({ is_frozen: true, frozen_reason: reason })
        .eq("user_id", userId);
      break;

    case "flag_for_review":
      await supabase
        .from("user_trust_profiles")
        .update({ is_under_review: true, review_reason: reason })
        .eq("user_id", userId);
      break;

    case "apply_cooldown":
      const cooldownDays = (data?.cooldown_days as number) || 7;
      await supabase
        .from("user_trust_profiles")
        .update({ 
          resurrection_cooldown_until: new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq("user_id", userId);
      break;

    default:
      throw new Error(`Unknown penalty type: ${penaltyType}`);
  }

  await logAbuseDetection(supabase, userId, `penalty_${penaltyType}`, "moderate", "admin_action", { reason });

  return { success: true, penalty: penaltyType };
}

// ============================================
// FLAG RESOLUTION
// ============================================

async function resolveFlag(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean }> {
  const flagId = data?.flag_id as string;
  const resolverId = data?.resolver_id as string;
  const notes = data?.notes as string;

  await supabase
    .from("abuse_detections")
    .update({
      resolved: true,
      resolved_by: resolverId,
      resolved_at: new Date().toISOString(),
      resolution_notes: notes,
    })
    .eq("id", flagId)
    .eq("user_id", userId);

  return { success: true };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  actionType: string,
  maxAllowed: number,
  windowHours: number
): Promise<AbuseCheckResult> {
  const { data: existing } = await supabase
    .from("user_rate_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("action_type", actionType)
    .maybeSingle();

  if (existing) {
    const windowStart = new Date(existing.window_start);
    const windowEnd = new Date(windowStart.getTime() + existing.window_hours * 60 * 60 * 1000);

    if (new Date() > windowEnd) {
      // Reset window
      await supabase
        .from("user_rate_limits")
        .update({
          window_start: new Date().toISOString(),
          action_count: 1,
          is_blocked: false,
          blocked_reason: null,
          blocked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      return { allowed: true };
    }

    if (existing.is_blocked) {
      const remainingSeconds = Math.ceil((new Date(existing.blocked_until!).getTime() - Date.now()) / 1000);
      return {
        allowed: false,
        reason: existing.blocked_reason || "Rate limit exceeded",
        cooldown_seconds: Math.max(0, remainingSeconds),
      };
    }

    if (existing.action_count >= maxAllowed) {
      await supabase
        .from("user_rate_limits")
        .update({
          is_blocked: true,
          blocked_reason: `${actionType} rate limit exceeded`,
          blocked_until: windowEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      const remainingSeconds = Math.ceil((windowEnd.getTime() - Date.now()) / 1000);
      return {
        allowed: false,
        reason: `${actionType} rate limit exceeded`,
        cooldown_seconds: remainingSeconds,
      };
    }

    // Increment counter
    await supabase
      .from("user_rate_limits")
      .update({
        action_count: existing.action_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    // Create new rate limit entry
    await supabase
      .from("user_rate_limits")
      .insert({
        user_id: userId,
        action_type: actionType,
        window_hours: windowHours,
        action_count: 1,
        max_allowed: maxAllowed,
      });
  }

  return { allowed: true };
}

async function updateReciprocalTracking(
  supabase: ReturnType<typeof createClient>,
  userAId: string,
  userBId: string,
  eventType: "trust_event" | "transaction" | "collaboration"
): Promise<void> {
  const [smallerId, largerId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];

  const { data: existing } = await supabase
    .from("reciprocal_relationships")
    .select("*")
    .eq("user_a_id", smallerId)
    .eq("user_b_id", largerId)
    .maybeSingle();

  if (existing) {
    const updates: Record<string, unknown> = {
      last_interaction_at: new Date().toISOString(),
    };

    switch (eventType) {
      case "trust_event":
        updates.mutual_trust_events = existing.mutual_trust_events + 1;
        break;
      case "transaction":
        updates.mutual_transactions = existing.mutual_transactions + 1;
        break;
      case "collaboration":
        updates.mutual_collaborations = existing.mutual_collaborations + 1;
        break;
    }

    // Flag if too many mutual events
    if ((existing.mutual_trust_events + 1) > 5) {
      updates.is_flagged = true;
      updates.flag_reason = "Excessive reciprocal trust events";
    }

    await supabase
      .from("reciprocal_relationships")
      .update(updates)
      .eq("id", existing.id);
  } else {
    const insert: Record<string, unknown> = {
      user_a_id: smallerId,
      user_b_id: largerId,
      first_interaction_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString(),
    };

    switch (eventType) {
      case "trust_event":
        insert.mutual_trust_events = 1;
        break;
      case "transaction":
        insert.mutual_transactions = 1;
        break;
      case "collaboration":
        insert.mutual_collaborations = 1;
        break;
    }

    await supabase
      .from("reciprocal_relationships")
      .insert(insert);
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
