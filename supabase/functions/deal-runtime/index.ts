import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type DealAction = 
  | "create_deal"
  | "advance_milestone"
  | "submit_milestone"
  | "approve_milestone"
  | "reject_milestone"
  | "release_payment"
  | "dispute"
  | "resolve_dispute"
  | "cancel_deal"
  | "complete_deal";

interface DealRuntimeRequest {
  action: DealAction;
  deal_id?: string;
  milestone_id?: string;
  user_id: string;
  data?: Record<string, unknown>;
}

// Valid state transitions for deals
const DEAL_STATES = {
  draft: ["proposed"],
  proposed: ["active", "cancelled"],
  active: ["disputed", "completed", "cancelled"],
  disputed: ["active", "cancelled", "resolved"],
  completed: [],
  cancelled: [],
  resolved: ["completed"],
};

// Valid state transitions for milestones
const MILESTONE_STATES = {
  pending: ["in_progress"],
  in_progress: ["submitted", "cancelled"],
  submitted: ["approved", "rejected", "disputed"],
  approved: ["released"],
  rejected: ["in_progress"],
  released: [],
  disputed: ["approved", "rejected"],
  cancelled: [],
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: DealRuntimeRequest = await req.json();
    const { action, deal_id, milestone_id, user_id, data } = body;

    if (!user_id) throw new Error("user_id is required");

    let result: Record<string, unknown> = {};

    switch (action) {
      case "create_deal": {
        const { offer_id, terms, amount, milestones } = data as {
          offer_id: string;
          terms: string;
          amount: number;
          milestones: { title: string; amount: number; deadline: string }[];
        };

        // Validate offer exists and is open
        const { data: offer, error: offerError } = await supabase
          .from("offers")
          .select("*")
          .eq("id", offer_id)
          .single();

        if (offerError || !offer) throw new Error("Offer not found");
        if (offer.status !== "open") throw new Error("Offer is not open for deals");

        // Create the deal (using offers table as deals)
        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .update({
            status: "proposed",
            amount,
            deal_terms: terms,
            updated_at: new Date().toISOString(),
          })
          .eq("id", offer_id)
          .select()
          .single();

        if (dealError) throw dealError;

        // Create milestones
        if (milestones && milestones.length > 0) {
          const milestoneInserts = milestones.map((m, index) => ({
            offer_id: offer_id,
            title: m.title,
            amount: m.amount,
            due_date: m.deadline,
            status: "pending",
            order_index: index,
          }));

          const { error: milestoneError } = await supabase
            .from("milestones")
            .insert(milestoneInserts);

          if (milestoneError) throw milestoneError;
        }

        // Log state transition
        await logStateTransition(supabase, "deal", offer_id, "open", "proposed", user_id, "Deal created");

        result = { success: true, deal_id: offer_id, status: "proposed" };
        break;
      }

      case "advance_milestone": {
        if (!deal_id || !milestone_id) throw new Error("deal_id and milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("*")
          .eq("id", milestone_id)
          .single();

        if (msError) throw msError;

        // Validate state transition
        const currentState = milestone.status;
        if (!MILESTONE_STATES[currentState]?.includes("in_progress")) {
          throw new Error(`Cannot advance milestone from ${currentState}`);
        }

        const { error: updateError } = await supabase
          .from("milestones")
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", milestone_id);

        if (updateError) throw updateError;

        await logStateTransition(supabase, "milestone", milestone_id, currentState, "in_progress", user_id, "Milestone started");

        result = { success: true, milestone_id, status: "in_progress" };
        break;
      }

      case "submit_milestone": {
        if (!milestone_id) throw new Error("milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("*")
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
            submission_notes: data?.notes as string,
            auto_release_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            updated_at: new Date().toISOString(),
          })
          .eq("id", milestone_id);

        if (updateError) throw updateError;

        await logStateTransition(supabase, "milestone", milestone_id, currentState, "submitted", user_id, "Milestone submitted for review");

        result = { success: true, milestone_id, status: "submitted" };
        break;
      }

      case "approve_milestone": {
        if (!milestone_id) throw new Error("milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("*, offers!inner(sender_id, recipient_id)")
          .eq("id", milestone_id)
          .single();

        if (msError) throw msError;

        // Only client (recipient) can approve
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

      case "release_payment": {
        if (!milestone_id) throw new Error("milestone_id required");

        const { data: milestone, error: msError } = await supabase
          .from("milestones")
          .select("*, offers!inner(sender_id, recipient_id, id)")
          .eq("id", milestone_id)
          .single();

        if (msError) throw msError;

        if (milestone.status !== "approved") {
          throw new Error("Milestone must be approved before payment release");
        }

        // Get provider's wallet
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", milestone.offers.sender_id)
          .single();

        if (walletError) throw walletError;

        // Create wallet transaction
        const { error: txError } = await supabase
          .from("wallet_transactions")
          .insert({
            wallet_id: wallet.id,
            user_id: milestone.offers.sender_id,
            type: "credit",
            amount: milestone.amount,
            status: "completed",
            description: `Payment for milestone: ${milestone.title}`,
            reference_type: "milestone",
            reference_id: milestone_id,
          });

        if (txError) throw txError;

        // Update wallet balance
        await supabase
          .from("wallets")
          .update({
            available_balance: wallet.available_balance + milestone.amount,
            total_earned: wallet.total_earned + milestone.amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", wallet.id);

        // Update milestone status
        await supabase
          .from("milestones")
          .update({
            status: "released",
            released_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", milestone_id);

        // Apply trust event for successful payment
        await applyTrustEvent(supabase, milestone.offers.sender_id, {
          event_type: "payment_received",
          event_source: "deal_runtime",
          trust_delta: 3,
          reference_type: "milestone",
          reference_id: milestone_id,
          evidence_summary: `Payment of ${milestone.amount} released for milestone`,
        });

        await logStateTransition(supabase, "milestone", milestone_id, "approved", "released", user_id, "Payment released");

        result = { success: true, milestone_id, status: "released", amount: milestone.amount };
        break;
      }

      case "dispute": {
        if (!deal_id) throw new Error("deal_id required");

        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .select("*")
          .eq("id", deal_id)
          .single();

        if (dealError) throw dealError;

        if (!["active", "proposed"].includes(deal.status)) {
          throw new Error(`Cannot dispute deal in ${deal.status} state`);
        }

        // Create dispute record
        const { error: disputeError } = await supabase
          .from("disputes")
          .insert({
            offer_id: deal_id,
            milestone_id: milestone_id || null,
            raised_by_id: user_id,
            reason: data?.reason as string,
            status: "open",
          });

        if (disputeError) throw disputeError;

        // Update deal status
        await supabase
          .from("offers")
          .update({
            status: "disputed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal_id);

        // Apply negative trust event
        await applyTrustEvent(supabase, user_id, {
          event_type: "dispute_raised",
          event_source: "deal_runtime",
          trust_delta: -3,
          reference_type: "deal",
          reference_id: deal_id,
          evidence_summary: "Raised a dispute",
        });

        await logStateTransition(supabase, "deal", deal_id, deal.status, "disputed", user_id, data?.reason as string || "Dispute raised");

        result = { success: true, deal_id, status: "disputed" };
        break;
      }

      case "resolve_dispute": {
        if (!deal_id) throw new Error("deal_id required");

        const { resolution, winner_id } = data as { resolution: string; winner_id?: string };

        // Update dispute
        const { error: disputeError } = await supabase
          .from("disputes")
          .update({
            status: "resolved",
            resolution,
            resolved_at: new Date().toISOString(),
          })
          .eq("offer_id", deal_id)
          .eq("status", "open");

        if (disputeError) throw disputeError;

        // Update deal status
        await supabase
          .from("offers")
          .update({
            status: "resolved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal_id);

        // Apply trust consequences
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

      case "complete_deal": {
        if (!deal_id) throw new Error("deal_id required");

        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .select("*, milestones(*)")
          .eq("id", deal_id)
          .single();

        if (dealError) throw dealError;

        // Check all milestones are released
        const unreleased = deal.milestones?.filter((m: { status: string }) => m.status !== "released");
        if (unreleased && unreleased.length > 0) {
          throw new Error(`${unreleased.length} milestone(s) not yet released`);
        }

        // Update deal status
        await supabase
          .from("offers")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal_id);

        // Apply positive trust events to both parties
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

      case "cancel_deal": {
        if (!deal_id) throw new Error("deal_id required");

        const { data: deal, error: dealError } = await supabase
          .from("offers")
          .select("*")
          .eq("id", deal_id)
          .single();

        if (dealError) throw dealError;

        if (!["proposed", "active", "disputed"].includes(deal.status)) {
          throw new Error(`Cannot cancel deal in ${deal.status} state`);
        }

        await supabase
          .from("offers")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: data?.reason as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal_id);

        await logStateTransition(supabase, "deal", deal_id, deal.status, "cancelled", user_id, data?.reason as string || "Deal cancelled");

        result = { success: true, deal_id, status: "cancelled" };
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
    console.error("Deal runtime error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

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
    .update({
      trust_score: newScore,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
