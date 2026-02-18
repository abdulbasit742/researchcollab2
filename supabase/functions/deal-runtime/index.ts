import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type DealAction =
  | "create_deal"
  | "activate_deal"
  | "advance_milestone"
  | "submit_milestone"
  | "approve_milestone"
  | "release_payment"
  | "dispute"
  | "resolve_dispute"
  | "cancel_deal"
  | "complete_deal"
  | "reject_milestone";

interface DealRuntimeRequest {
  action: DealAction;
  deal_id?: string;
  milestone_id?: string;
  idempotency_key?: string;
  data?: Record<string, unknown>;
}

// Valid state transitions for deals
const DEAL_STATES: Record<string, string[]> = {
  draft: ["proposed"],
  proposed: ["active", "cancelled"],
  active: ["disputed", "completed", "cancelled"],
  disputed: ["active", "cancelled", "resolved"],
  completed: [],
  cancelled: [],
  resolved: ["completed"],
};

// Valid state transitions for milestones
const MILESTONE_STATES: Record<string, string[]> = {
  pending: ["in_progress"],
  in_progress: ["submitted", "cancelled"],
  submitted: ["approved", "rejected", "disputed"],
  approved: ["released"],
  rejected: ["in_progress"],
  released: [],
  disputed: ["approved", "rejected"],
  cancelled: [],
};

function structuredLog(level: "info" | "warn" | "error", action: string, details: Record<string, unknown>) {
  const entry = { level, ts: new Date().toISOString(), fn: "deal-runtime", action, ...details };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms)
    ),
  ]);
}

type ErrorCategory = "validation" | "state_violation" | "financial" | "not_found" | "auth" | "timeout" | "internal";

function categorizeError(err: Error): { category: ErrorCategory; status: number } {
  const msg = err.message.toLowerCase();
  if (msg.includes("timeout")) return { category: "timeout", status: 504 };
  if (msg.includes("not found")) return { category: "not_found", status: 404 };
  if (msg.includes("cannot") || msg.includes("invalid state") || msg.includes("must be")) return { category: "state_violation", status: 409 };
  if (msg.includes("insufficient") || msg.includes("escrow") || msg.includes("refund failed")) return { category: "financial", status: 422 };
  if (msg.includes("only the") || msg.includes("not authenticated")) return { category: "auth", status: 403 };
  if (msg.includes("required") || msg.includes("must equal")) return { category: "validation", status: 400 };
  return { category: "internal", status: 500 };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let action = "unknown";

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

    const user_id = claimsData.claims.sub as string;

    const body: DealRuntimeRequest = await req.json();
    action = body.action;
    const { deal_id, milestone_id, idempotency_key, data } = body;

    structuredLog("info", action, { deal_id, milestone_id, user_id, idempotency_key });

    // ─── Idempotency check ─────────────────────────────────
    if (idempotency_key) {
      const { data: existing } = await supabase
        .from("state_transition_logs")
        .select("id")
        .eq("trigger_reason", `idempotency:${idempotency_key}`)
        .limit(1);

      if (existing && existing.length > 0) {
        structuredLog("info", action, { msg: "Idempotent duplicate skipped", idempotency_key });
        return new Response(JSON.stringify({ success: true, idempotent: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      // ─── CREATE DEAL ────────────────────────────────────────────
      case "create_deal": {
        const { offer_id, terms, amount, milestones } = data as {
          offer_id: string;
          terms: string;
          amount: number;
          milestones: { title: string; amount: number; deadline?: string }[];
        };

        const { data: offer, error: offerError } = await withTimeout(
          supabase.from("offers").select("id, status, price").eq("id", offer_id).single(),
          5000, "fetch offer"
        );

        if (offerError || !offer) throw new Error("Offer not found");
        if (offer.status !== "open") throw new Error("Offer is not open for deals");

        if (milestones && milestones.length > 0) {
          const milestoneSum = milestones.reduce((sum, m) => sum + m.amount, 0);
          if (Math.abs(milestoneSum - amount) > 0.01) {
            throw new Error(`Milestone amounts (${milestoneSum}) must equal deal amount (${amount})`);
          }
        }

        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .update({
            status: "proposed",
            price: amount,
            deal_terms: terms,
            updated_at: new Date().toISOString(),
          })
          .eq("id", offer_id)
          .select()
          .single();

        if (dealError) throw dealError;

        if (milestones && milestones.length > 0) {
          const milestoneInserts = milestones.map((m, index) => ({
            offer_id: offer_id,
            title: m.title,
            amount: m.amount,
            expected_delivery: m.deadline || null,
            status: "pending",
            order_index: index,
          }));

          const { error: milestoneError } = await supabase
            .from("milestones")
            .insert(milestoneInserts);

          if (milestoneError) throw milestoneError;
        }

        const reason = idempotency_key ? `idempotency:${idempotency_key}` : "Deal created";
        await logStateTransition(supabase, "deal", offer_id, "open", "proposed", user_id, reason);
        result = { success: true, deal_id: offer_id, status: "proposed" };
        break;
      }

      // ─── ACTIVATE DEAL (LOCK ESCROW) ───────────────────────────
      case "activate_deal": {
        if (!deal_id) throw new Error("deal_id required");

        const { data: deal, error: dealError } = await withTimeout(
          supabase.from("offers").select("id, status, recipient_id, price").eq("id", deal_id).single(),
          5000, "fetch deal"
        );

        if (dealError || !deal) throw new Error("Deal not found");
        if (deal.status !== "proposed") throw new Error(`Cannot activate deal in ${deal.status} state`);

        const buyerId = deal.recipient_id;
        const totalAmount = deal.price;

        if (!totalAmount || totalAmount <= 0) {
          throw new Error("Deal has no valid amount");
        }

        const { data: lockResult, error: lockError } = await withTimeout(
          supabase.rpc("execute_escrow_lock", {
            p_offer_id: deal_id,
            p_buyer_id: buyerId,
            p_total_amount: totalAmount,
          }),
          10000, "escrow lock"
        );

        if (lockError) throw new Error(`Escrow lock failed: ${lockError.message}`);

        const { error: updateError } = await supabase
          .from("offers")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", deal_id);

        if (updateError) throw updateError;

        const reason = idempotency_key ? `idempotency:${idempotency_key}` : "Deal activated, escrow locked";
        await logStateTransition(supabase, "deal", deal_id, "proposed", "active", user_id, reason);

        result = { success: true, deal_id, status: "active", escrow: lockResult };
        break;
      }

      // ─── ADVANCE MILESTONE ─────────────────────────────────────
      case "advance_milestone": {
        if (!deal_id || !milestone_id) throw new Error("deal_id and milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("id, status")
          .eq("id", milestone_id)
          .single();

        if (msError) throw msError;

        const currentState = milestone.status;
        if (!MILESTONE_STATES[currentState]?.includes("in_progress")) {
          throw new Error(`Cannot advance milestone from ${currentState}`);
        }

        const { error: updateError } = await supabase
          .from("milestones")
          .update({ status: "in_progress", started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", milestone_id);

        if (updateError) throw updateError;

        await logStateTransition(supabase, "milestone", milestone_id, currentState, "in_progress", user_id, "Milestone started");
        result = { success: true, milestone_id, status: "in_progress" };
        break;
      }

      // ─── SUBMIT MILESTONE ──────────────────────────────────────
      case "submit_milestone": {
        if (!milestone_id) throw new Error("milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("id, status")
          .eq("id", milestone_id)
          .single();

        if (msError) throw msError;

        const currentState = milestone.status;
        if (!MILESTONE_STATES[currentState]?.includes("submitted")) {
          throw new Error(`Cannot submit milestone from ${currentState}`);
        }

        const { error: updateError } = await supabase
          .from("milestones")
          .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
            submission_notes: (data?.notes as string) || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", milestone_id);

        if (updateError) throw updateError;

        await logStateTransition(supabase, "milestone", milestone_id, currentState, "submitted", user_id, "Milestone submitted for review");
        result = { success: true, milestone_id, status: "submitted" };
        break;
      }

      // ─── APPROVE MILESTONE ─────────────────────────────────────
      case "approve_milestone": {
        if (!milestone_id) throw new Error("milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("id, status, offers!inner(sender_id, recipient_id)")
          .eq("id", milestone_id)
          .single();

        if (msError) throw msError;

        if (user_id !== milestone.offers.recipient_id) {
          throw new Error("Only the client can approve milestones");
        }

        const currentState = milestone.status;
        if (!MILESTONE_STATES[currentState]?.includes("approved")) {
          throw new Error(`Cannot approve milestone from ${currentState}`);
        }

        const { error: updateError } = await supabase
          .from("milestones")
          .update({
            status: "approved",
            approved_at: new Date().toISOString(),
            approved_by: user_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", milestone_id);

        if (updateError) throw updateError;

        await logStateTransition(supabase, "milestone", milestone_id, currentState, "approved", user_id, "Milestone approved");
        result = { success: true, milestone_id, status: "approved" };
        break;
      }

      // ─── RELEASE PAYMENT (ATOMIC) ──────────────────────────────
      case "release_payment": {
        if (!milestone_id) throw new Error("milestone_id required");

        const { data: releaseResult, error: releaseError } = await withTimeout(
          supabase.rpc("execute_milestone_release", {
            p_milestone_id: milestone_id,
            p_released_by: user_id,
          }),
          15000, "milestone release"
        );

        if (releaseError) throw new Error(`Payment release failed: ${releaseError.message}`);

        const { data: msData } = await supabase
          .from("milestones")
          .select("id, offers!inner(sender_id)")
          .eq("id", milestone_id)
          .single();

        if (msData) {
          await applyTrustEvent(supabase, msData.offers.sender_id, {
            event_type: "payment_received",
            event_source: "deal_runtime",
            trust_delta: 3,
            reference_type: "milestone",
            reference_id: milestone_id,
            evidence_summary: `Payment released`,
          });
        }

        await logStateTransition(supabase, "milestone", milestone_id, "approved", "released", user_id, "Payment released atomically");

        result = { success: true, milestone_id, status: "released", ...releaseResult };
        break;
      }

      // ─── DISPUTE ───────────────────────────────────────────────
      case "dispute": {
        if (!deal_id) throw new Error("deal_id required");

        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .select("id, status")
          .eq("id", deal_id)
          .single();

        if (dealError) throw dealError;

        if (!["active", "proposed"].includes(deal.status)) {
          throw new Error(`Cannot dispute deal in ${deal.status} state`);
        }

        const { error: disputeError } = await supabase
          .from("disputes")
          .insert({
            milestone_id: milestone_id || null,
            offer_id: deal_id,
            initiated_by: user_id,
            reason: (data?.reason as string) || "No reason provided",
            status: "open",
          });

        if (disputeError) throw disputeError;

        await supabase
          .from("offers")
          .update({ status: "disputed", updated_at: new Date().toISOString() })
          .eq("id", deal_id);

        await applyTrustEvent(supabase, user_id, {
          event_type: "dispute_raised",
          event_source: "deal_runtime",
          trust_delta: -3,
          reference_type: "deal",
          reference_id: deal_id,
          evidence_summary: "Raised a dispute",
        });

        await logStateTransition(supabase, "deal", deal_id, deal.status, "disputed", user_id, (data?.reason as string) || "Dispute raised");
        result = { success: true, deal_id, status: "disputed" };
        break;
      }

      // ─── RESOLVE DISPUTE ───────────────────────────────────────
      case "resolve_dispute": {
        if (!deal_id) throw new Error("deal_id required");

        // Only admins can resolve disputes
        const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: user_id });
        if (!isAdmin) {
          throw new Error("Only admins can resolve disputes");
        }

        const { resolution, winner_id } = data as { resolution: string; winner_id?: string };

        const { error: disputeError } = await supabase
          .from("disputes")
          .update({ status: "resolved", resolution, resolved_at: new Date().toISOString() })
          .eq("offer_id", deal_id)
          .eq("status", "open");

        if (disputeError) throw disputeError;

        await supabase
          .from("offers")
          .update({ status: "resolved", updated_at: new Date().toISOString() })
          .eq("id", deal_id);

        if (winner_id) {
          await applyTrustEvent(supabase, winner_id, {
            event_type: "dispute_won",
            event_source: "deal_runtime",
            trust_delta: 5,
            reference_type: "deal",
            reference_id: deal_id,
            evidence_summary: "Won dispute resolution",
          });
        }

        await logStateTransition(supabase, "deal", deal_id, "disputed", "resolved", user_id, resolution);
        result = { success: true, deal_id, status: "resolved", resolution };
        break;
      }

      // ─── COMPLETE DEAL ─────────────────────────────────────────
      case "complete_deal": {
        if (!deal_id) throw new Error("deal_id required");

        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .select("id, status, sender_id, recipient_id, milestones(id, status)")
          .eq("id", deal_id)
          .single();

        if (dealError) throw dealError;

        const unreleased = deal.milestones?.filter((m: { status: string }) => m.status !== "released" && m.status !== "cancelled");
        if (unreleased && unreleased.length > 0) {
          throw new Error(`${unreleased.length} milestone(s) not yet released or cancelled`);
        }

        await supabase
          .from("offers")
          .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", deal_id);

        await applyTrustEvent(supabase, deal.sender_id, {
          event_type: "deal_completed",
          event_source: "deal_runtime",
          trust_delta: 5,
          reference_type: "deal",
          reference_id: deal_id,
          evidence_summary: "Successfully completed deal as provider",
        });

        await applyTrustEvent(supabase, deal.recipient_id, {
          event_type: "deal_completed",
          event_source: "deal_runtime",
          trust_delta: 3,
          reference_type: "deal",
          reference_id: deal_id,
          evidence_summary: "Successfully completed deal as client",
        });

        await logStateTransition(supabase, "deal", deal_id, deal.status, "completed", user_id, "Deal completed successfully");
        result = { success: true, deal_id, status: "completed" };
        break;
      }

      // ─── CANCEL DEAL (WITH REFUND) ─────────────────────────────
      case "cancel_deal": {
        if (!deal_id) throw new Error("deal_id required");

        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .select("id, status")
          .eq("id", deal_id)
          .single();

        if (dealError) throw dealError;

        if (!["proposed", "active", "disputed"].includes(deal.status)) {
          throw new Error(`Cannot cancel deal in ${deal.status} state`);
        }

        let refundResult = null;
        if (deal.status === "active" || deal.status === "disputed") {
          const { data: refund, error: refundError } = await withTimeout(
            supabase.rpc("execute_escrow_refund", {
              p_offer_id: deal_id,
              p_refund_reason: (data?.reason as string) || "Deal cancelled",
            }),
            10000, "escrow refund"
          );

          if (refundError) throw new Error(`Refund failed: ${refundError.message}`);
          refundResult = refund;
        }

        await supabase
          .from("offers")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: (data?.reason as string) || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal_id);

        await logStateTransition(supabase, "deal", deal_id, deal.status, "cancelled", user_id, (data?.reason as string) || "Deal cancelled");
        result = { success: true, deal_id, status: "cancelled", refund: refundResult };
        break;
      }

      // ─── REJECT MILESTONE ──────────────────────────────────────
      case "reject_milestone": {
        if (!milestone_id) throw new Error("milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("id, status, offers!inner(sender_id, recipient_id)")
          .eq("id", milestone_id)
          .single();

        if (msError) throw msError;

        if (user_id !== milestone.offers.recipient_id) {
          throw new Error("Only the client can reject milestones");
        }

        const currentState = milestone.status;
        if (!MILESTONE_STATES[currentState]?.includes("rejected")) {
          throw new Error(`Cannot reject milestone from ${currentState}`);
        }

        const { error: updateError } = await supabase
          .from("milestones")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", milestone_id);

        if (updateError) throw updateError;

        await logStateTransition(supabase, "milestone", milestone_id, currentState, "rejected", user_id, (data?.reason as string) || "Milestone rejected");
        result = { success: true, milestone_id, status: "rejected" };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const duration = Date.now() - startTime;
    structuredLog("info", action, { msg: "completed", duration_ms: duration, ...result });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error instanceof Error ? error : new Error("Unknown error");
    const { category, status } = categorizeError(err);

    structuredLog("error", action, {
      msg: err.message,
      category,
      duration_ms: duration,
      stack: err.stack?.split("\n").slice(0, 3),
    });

    return new Response(
      JSON.stringify({ error: err.message, category }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
    );
  }
});

// ─── Helper: Log state transitions ───────────────────────────────
async function logStateTransition(
  supabase: ReturnType<typeof createClient>,
  entityType: string,
  entityId: string,
  fromState: string,
  toState: string,
  triggeredBy: string,
  reason: string
): Promise<void> {
  await supabase
    .from("state_transition_logs")
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      from_state: fromState,
      to_state: toState,
      triggered_by: triggeredBy,
      trigger_reason: reason,
    });
}

// ─── Helper: Apply trust events ──────────────────────────────────
async function applyTrustEvent(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  event: {
    event_type: string;
    event_source: string;
    trust_delta: number;
    reference_type?: string;
    reference_id?: string;
    evidence_summary?: string;
  }
): Promise<void> {
  const { data: profile } = await supabase
    .from("user_trust_profiles")
    .select("trust_score")
    .eq("user_id", userId)
    .single();

  const oldScore = profile?.trust_score || 0;
  const newScore = Math.max(0, Math.min(100, oldScore + event.trust_delta));

  await supabase
    .from("trust_events")
    .insert({
      user_id: userId,
      ...event,
      trust_before: oldScore,
      trust_after: newScore,
    });

  await supabase
    .from("user_trust_profiles")
    .update({ trust_score: newScore, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}
