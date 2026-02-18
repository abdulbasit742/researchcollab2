import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const userId = claimsData.claims.sub as string;

    const { deal_id } = await req.json();
    if (!deal_id) {
      return new Response(JSON.stringify({ error: "deal_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch deal
    const { data: deal } = await supabase
      .from("deal_rooms")
      .select("*")
      .eq("id", deal_id)
      .maybeSingle();

    if (!deal) {
      return new Response(JSON.stringify({ error: "Deal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch trust profiles for both parties
    const participants = [deal.buyer_id, deal.seller_id].filter(Boolean);
    const { data: trustProfiles } = await supabase
      .from("user_trust_profiles")
      .select("user_id, trust_score, dispute_rate, total_projects_completed, successful_rate")
      .in("user_id", participants);

    const trustMap: Record<string, any> = {};
    (trustProfiles ?? []).forEach((t: any) => { trustMap[t.user_id] = t; });

    const buyerTrust = trustMap[deal.buyer_id]?.trust_score ?? 50;
    const sellerTrust = trustMap[deal.seller_id]?.trust_score ?? 50;
    const avgTrust = (buyerTrust + sellerTrust) / 2;

    const buyerDispute = trustMap[deal.buyer_id]?.dispute_rate ?? 0;
    const sellerDispute = trustMap[deal.seller_id]?.dispute_rate ?? 0;

    // Compute dispute probability
    const baseDisputeProb = (buyerDispute + sellerDispute) / 2;
    const trustFactor = Math.max(0, 1 - avgTrust / 100);
    const disputeProbability = Math.min(100, Math.round((baseDisputeProb * 0.6 + trustFactor * 40) * 10) / 10);

    // Compute risk score
    const riskScore = Math.min(100, Math.round(disputeProbability * 0.5 + (100 - avgTrust) * 0.3 + (deal.agreed_amount > 100000 ? 20 : deal.agreed_amount > 50000 ? 10 : 0)) * 10 / 10);

    // Pricing intelligence
    const agreedAmount = deal.agreed_amount ?? 0;
    const priceLow = Math.round(agreedAmount * 0.8);
    const priceHigh = Math.round(agreedAmount * 1.3);

    // Trust impact projection
    const trustImpact = disputeProbability < 20 ? Math.round(avgTrust * 0.05) : -Math.round(disputeProbability * 0.1);

    // Suggested milestones
    const milestoneCount = agreedAmount > 100000 ? 5 : agreedAmount > 50000 ? 4 : 3;
    const milestoneAmount = Math.round(agreedAmount / milestoneCount);
    const suggestedMilestones = Array.from({ length: milestoneCount }, (_, i) => ({
      title: `Phase ${i + 1}`,
      amount: i === milestoneCount - 1 ? agreedAmount - milestoneAmount * (milestoneCount - 1) : milestoneAmount,
      percentage: Math.round(100 / milestoneCount),
    }));

    const contributingFactors: Record<string, any> = {
      trust_gap: Math.abs(buyerTrust - sellerTrust),
      high_value: agreedAmount > 100000,
      low_trust_participant: Math.min(buyerTrust, sellerTrust) < 30,
      dispute_history: Math.max(buyerDispute, sellerDispute) > 10,
    };

    // Store session
    const { data: session } = await supabase
      .from("negotiation_sessions")
      .insert({
        deal_id,
        initiated_by: userId,
        suggested_price_range: { low: priceLow, high: priceHigh, current: agreedAmount },
        risk_score: riskScore,
        dispute_probability: disputeProbability,
        trust_impact_projection: trustImpact,
        suggested_milestones: suggestedMilestones,
      })
      .select()
      .single();

    // Store dispute prediction
    await supabase.from("dispute_prediction_logs").insert({
      deal_id,
      predicted_risk_score: disputeProbability,
      contributing_factors: contributingFactors,
    });

    return new Response(
      JSON.stringify({
        session_id: session?.id,
        deal_id,
        suggested_price_range: { low: priceLow, high: priceHigh, current: agreedAmount },
        risk_score: riskScore,
        dispute_probability: disputeProbability,
        trust_impact_projection: trustImpact,
        suggested_milestones: suggestedMilestones,
        contributing_factors: contributingFactors,
        participants: {
          buyer: { trust: buyerTrust, dispute_rate: buyerDispute },
          seller: { trust: sellerTrust, dispute_rate: sellerDispute },
        },
        computed_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
