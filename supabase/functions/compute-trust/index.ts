import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TrustComputeRequest {
  action?: "compute" | "apply_event" | "decay" | "freeze" | "unfreeze";
  target_user_id?: string; // Only for admin actions (freeze/unfreeze)
  event?: {
    event_type: string;
    event_source: string;
    trust_delta: number;
    reference_type?: string;
    reference_id?: string;
    evidence_summary?: string;
  };
  reason?: string;
}

interface TrustComponents {
  delivery_score: number;
  financial_score: number;
  collaboration_score: number;
  institutional_score: number;
  consistency_score: number;
}

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and extract user ID
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

    const callerUserId = claimsData.claims.sub as string;

    const body: TrustComputeRequest = await req.json();
    const { action = "compute", event, reason, target_user_id } = body;

    // For freeze/unfreeze, require admin and use target_user_id
    // For all other actions, operate on the caller's own profile
    let user_id = callerUserId;

    if (action === "freeze" || action === "unfreeze") {
      // Check if caller is admin
      const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: callerUserId });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Only admins can freeze/unfreeze trust profiles" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!target_user_id) {
        return new Response(JSON.stringify({ error: "target_user_id required for freeze/unfreeze" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      user_id = target_user_id;
    }

    // Get current trust profile
    const { data: trustProfile, error: profileError } = await supabase
      .from("user_trust_profiles")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (profileError) throw profileError;

    // Check if trust is frozen (unless we're unfreezing)
    if (trustProfile?.is_frozen && action !== "unfreeze") {
      return new Response(
        JSON.stringify({ 
          error: "Trust profile is frozen", 
          frozen_reason: trustProfile.frozen_reason 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      case "compute": {
        const components = await computeTrustComponents(supabase, user_id);
        const totalScore = calculateTotalScore(components);
        const tier = determineTier(totalScore);

        const { error: updateError } = await supabase
          .from("user_trust_profiles")
          .update({
            trust_score: totalScore,
            trust_tier: tier,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        if (updateError) throw updateError;

        await logStateTransition(supabase, "trust_profile", user_id, "active", "computed", "Trust score recomputed");

        result = {
          success: true,
          user_id,
          trust_score: totalScore,
          trust_tier: tier,
          components,
        };
        break;
      }

      case "apply_event": {
        if (!event) throw new Error("event is required for apply_event action");

        // ─── Trust Velocity Limiting ────────────────────────────
        if (event.trust_delta > 0) {
          const dailyCap = 15;
          const weeklyCap = 40;

          // Check daily velocity
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data: dailyEvents } = await supabase
            .from("trust_events")
            .select("trust_delta")
            .eq("user_id", user_id)
            .gt("trust_delta", 0)
            .gte("created_at", oneDayAgo);

          const dailyTotal = (dailyEvents || []).reduce((sum: number, e: any) => sum + (e.trust_delta || 0), 0);
          if (dailyTotal + event.trust_delta > dailyCap) {
            return new Response(JSON.stringify({
              error: "Daily trust velocity cap exceeded",
              daily_used: dailyTotal,
              daily_cap: dailyCap,
            }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          // Check weekly velocity
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const { data: weeklyEvents } = await supabase
            .from("trust_events")
            .select("trust_delta")
            .eq("user_id", user_id)
            .gt("trust_delta", 0)
            .gte("created_at", oneWeekAgo);

          const weeklyTotal = (weeklyEvents || []).reduce((sum: number, e: any) => sum + (e.trust_delta || 0), 0);
          if (weeklyTotal + event.trust_delta > weeklyCap) {
            return new Response(JSON.stringify({
              error: "Weekly trust velocity cap exceeded",
              weekly_used: weeklyTotal,
              weekly_cap: weeklyCap,
            }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        const oldScore = trustProfile?.trust_score || 0;
        const newScore = Math.max(0, Math.min(100, oldScore + event.trust_delta));
        const newTier = determineTier(newScore);

        const { error: eventError } = await supabase
          .from("trust_events")
          .insert({
            user_id,
            event_type: event.event_type,
            event_source: event.event_source,
            trust_delta: event.trust_delta,
            trust_before: oldScore,
            trust_after: newScore,
            reference_type: event.reference_type,
            reference_id: event.reference_id,
            evidence_summary: event.evidence_summary,
          });

        if (eventError) throw eventError;

        const { error: updateError } = await supabase
          .from("user_trust_profiles")
          .update({
            trust_score: newScore,
            trust_tier: newTier,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        if (updateError) throw updateError;

        result = {
          success: true,
          user_id,
          old_score: oldScore,
          new_score: newScore,
          delta: event.trust_delta,
          tier: newTier,
        };
        break;
      }

      case "decay": {
        const lastActivity = trustProfile?.last_activity_at;
        if (!lastActivity) {
          result = { success: true, message: "No activity to decay from" };
          break;
        }

        const daysSinceActivity = Math.floor(
          (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceActivity < 30) {
          result = { success: true, message: "Not enough time for decay", days_since_activity: daysSinceActivity };
          break;
        }

        const decayAmount = Math.min(10, Math.floor(daysSinceActivity / 30));
        const oldScore = trustProfile?.trust_score || 0;
        const newScore = Math.max(0, oldScore - decayAmount);

        const { error: decayError } = await supabase
          .from("trust_events")
          .insert({
            user_id,
            event_type: "inactivity_decay",
            event_source: "system",
            trust_delta: -decayAmount,
            trust_before: oldScore,
            trust_after: newScore,
            evidence_summary: `${daysSinceActivity} days of inactivity`,
          });

        if (decayError) throw decayError;

        await supabase
          .from("user_trust_profiles")
          .update({
            trust_score: newScore,
            trust_tier: determineTier(newScore),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        result = {
          success: true,
          user_id,
          old_score: oldScore,
          new_score: newScore,
          decay_amount: decayAmount,
          days_inactive: daysSinceActivity,
        };
        break;
      }

      case "freeze": {
        const { error: freezeError } = await supabase
          .from("user_trust_profiles")
          .update({
            is_frozen: true,
            frozen_reason: reason || "Administrative action",
            frozen_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        if (freezeError) throw freezeError;

        await supabase
          .from("admin_audit_logs")
          .insert({
            action: "freeze_trust",
            entity_type: "user",
            entity_id: user_id,
            admin_id: callerUserId,
            details: { reason },
          });

        result = { success: true, user_id, frozen: true, reason };
        break;
      }

      case "unfreeze": {
        const { error: unfreezeError } = await supabase
          .from("user_trust_profiles")
          .update({
            is_frozen: false,
            frozen_reason: null,
            frozen_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        if (unfreezeError) throw unfreezeError;

        await supabase
          .from("admin_audit_logs")
          .insert({
            action: "unfreeze_trust",
            entity_type: "user",
            entity_id: user_id,
            admin_id: callerUserId,
            details: { reason },
          });

        result = { success: true, user_id, frozen: false };
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
    console.error("Trust compute error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function computeTrustComponents(supabase: ReturnType<typeof createClient>, userId: string): Promise<TrustComponents> {
  const { data: components } = await supabase
    .from("trust_score_components")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!components) {
    return {
      delivery_score: 0,
      financial_score: 0,
      collaboration_score: 0,
      institutional_score: 0,
      consistency_score: 0,
    };
  }

  const deliveryScore = Math.max(0, Math.min(100,
    (components.projects_completed * 10) +
    (components.partial_deliveries * 5) -
    (components.projects_failed * 20) +
    ((components.on_time_rate || 0) * 0.5)
  ));

  const financialScore = Math.max(0, Math.min(100,
    (components.escrow_releases_successful * 8) -
    (components.disputes_raised * 5) -
    (components.disputes_lost * 25) -
    (components.refunds_issued * 10) -
    (components.escrow_cancellations * 15)
  ));

  const collaborationScore = Math.max(0, Math.min(100,
    ((components.avg_peer_rating || 0) * 20) +
    (components.repeat_collaborations * 5) -
    (components.abandoned_collaborations * 30)
  ));

  const institutionalScore = Math.max(0, Math.min(100,
    (components.verifications_count * 20) +
    (components.institutional_affiliations * 10) +
    (components.grants_executed * 15) -
    (components.institutional_disputes * 25)
  ));

  const consistencyScore = Math.max(0, Math.min(100,
    Math.min((components.active_months || 0) * 5, 50) -
    Math.min((components.longest_inactive_days || 0) / 10, 30) -
    ((components.trust_volatility || 0) * 10)
  ));

  return {
    delivery_score: deliveryScore,
    financial_score: financialScore,
    collaboration_score: collaborationScore,
    institutional_score: institutionalScore,
    consistency_score: consistencyScore,
  };
}

function calculateTotalScore(components: TrustComponents): number {
  return Math.round(
    (components.delivery_score * 0.40) +
    (components.financial_score * 0.25) +
    (components.collaboration_score * 0.15) +
    (components.institutional_score * 0.10) +
    (components.consistency_score * 0.10)
  );
}

function determineTier(score: number): string {
  if (score >= 75) return "platinum";
  if (score >= 50) return "gold";
  if (score >= 25) return "silver";
  return "bronze";
}

async function logStateTransition(
  supabase: ReturnType<typeof createClient>,
  entityType: string,
  entityId: string,
  fromState: string,
  toState: string,
  reason: string
): Promise<void> {
  await supabase
    .from("state_transition_logs")
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      from_state: fromState,
      to_state: toState,
      trigger_reason: reason,
      triggered_by: null,
    });
}
