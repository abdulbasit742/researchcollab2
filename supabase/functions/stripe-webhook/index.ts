import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.text();

    // Manual Stripe signature verification (no SDK dependency)
    const verified = await verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!verified) {
      console.error("Invalid Stripe signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id as string;
    const eventType = event.type as string;

    // Create service_role client for privileged operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency check — prevent replay attacks
    const { data: existing } = await supabase
      .from("stripe_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing) {
      console.log(`Event ${eventId} already processed, skipping`);
      return new Response(
        JSON.stringify({ received: true, duplicate: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process event based on type
    let dealId: string | null = null;
    let amount: number | null = null;

    if (eventType === "checkout.session.completed") {
      const session = event.data.object;
      dealId = session.metadata?.deal_id ?? null;
      amount = session.amount_total ? session.amount_total / 100 : null;

      if (dealId && amount) {
        // Fund escrow via direct DB operations (service_role bypasses RLS)
        const { data: deal, error: dealErr } = await supabase
          .from("deal_rooms")
          .select("*")
          .eq("id", dealId)
          .single();

        if (dealErr || !deal) {
          console.error("Deal not found for escrow funding:", dealId);
        } else if (deal.escrow_status === "pending") {
          // Lock funds in client wallet
          const { data: wallet } = await supabase
            .from("wallets")
            .select("*")
            .eq("user_id", deal.buyer_id)
            .single();

          if (wallet) {
            const newAvailable = wallet.available_balance + amount; // Stripe deposit
            const newEscrow = wallet.escrow_balance + amount;

            // Deposit then lock
            await supabase.from("wallets").update({
              available_balance: newAvailable - amount, // net zero on available
              escrow_balance: newEscrow,
              total_spent: wallet.total_spent + amount,
              updated_at: new Date().toISOString(),
            }).eq("id", wallet.id);

            // Record escrow transaction
            await supabase.from("wallet_transactions").insert({
              wallet_id: wallet.id,
              user_id: deal.buyer_id,
              type: "escrow_deposit",
              amount: -amount,
              balance_after: newAvailable - amount,
              description: `Stripe payment → escrow for deal: ${deal.title}`,
              reference_id: dealId,
              reference_type: "deal",
              status: "completed",
            });

            // Update deal escrow status
            await supabase.from("deal_rooms").update({
              escrow_status: "funded",
              escrow_amount: amount,
              updated_at: new Date().toISOString(),
            }).eq("id", dealId);

            // Notify parties
            await supabase.from("notifications").insert([
              {
                user_id: deal.buyer_id,
                type: "deal_update",
                title: "Payment Received",
                message: `PKR ${amount.toLocaleString()} payment processed and locked in escrow for "${deal.title}"`,
                data: { deal_id: dealId, link: `/deals/${dealId}` },
              },
              {
                user_id: deal.seller_id,
                type: "deal_update",
                title: "Escrow Funded",
                message: `Client has funded escrow (PKR ${amount.toLocaleString()}) for "${deal.title}". You can begin work.`,
                data: { deal_id: dealId, link: `/deals/${dealId}` },
              },
            ]);

            console.log(`Escrow funded for deal ${dealId}: PKR ${amount}`);
          }
        }
      }
    } else if (eventType === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      dealId = paymentIntent.metadata?.deal_id ?? null;

      if (dealId) {
        const { data: deal } = await supabase
          .from("deal_rooms")
          .select("buyer_id, title")
          .eq("id", dealId)
          .single();

        if (deal) {
          await supabase.from("notifications").insert({
            user_id: deal.buyer_id,
            type: "payment_failed",
            title: "Payment Failed",
            message: `Payment for "${deal.title}" failed. Please try again.`,
            data: { deal_id: dealId, link: `/deals/${dealId}` },
          });
        }
      }
    }

    // Record event as processed (idempotency)
    await supabase.from("stripe_events").insert({
      event_id: eventId,
      event_type: eventType,
      deal_id: dealId,
      amount,
      processed: true,
      processed_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Verify Stripe webhook signature manually.
 * Implements Stripe's v1 signature verification algorithm.
 */
async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = header.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
    const signatures = parts
      .filter((p) => p.startsWith("v1="))
      .map((p) => p.split("=")[1]);

    if (!timestamp || signatures.length === 0) return false;

    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sig = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedPayload)
    );

    const expectedSig = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return signatures.some((s) => s === expectedSig);
  } catch {
    return false;
  }
}
