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

    // 1. Fetch trust score
    const { data: trustProfile } = await supabase
      .from("user_trust_profiles")
      .select("trust_score, total_projects_completed, successful_rate, financial_reliability_score, is_verified_student, is_verified_researcher, is_verified_partner")
      .eq("user_id", userId)
      .maybeSingle();

    const trustScore = trustProfile?.trust_score ?? 0;

    // 2. Fetch deal success rate
    const { data: deals } = await supabase
      .from("deal_rooms")
      .select("status")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    const totalDeals = deals?.length ?? 0;
    const successfulDeals = deals?.filter((d: any) => d.status === "completed").length ?? 0;
    const dealSuccessRate = totalDeals > 0 ? (successfulDeals / totalDeals) * 100 : 0;

    // 3. Collaboration consistency (from accountability records)
    const { data: accountabilityRecords } = await supabase
      .from("accountability_records")
      .select("outcome_status, collaboration_type")
      .or(`initiator_id.eq.${userId},executor_id.eq.${userId}`);

    const totalCollabs = accountabilityRecords?.length ?? 0;
    const completedCollabs = accountabilityRecords?.filter((r: any) => r.outcome_status === "completed").length ?? 0;
    const collaborationConsistency = totalCollabs > 0 ? (completedCollabs / totalCollabs) * 100 : 50;

    // 4. Dispute ratio
    const { count: disputeCount } = await supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .or(`initiator_id.eq.${userId},respondent_id.eq.${userId}`);

    const disputeRatio = totalCollabs > 0 ? ((disputeCount ?? 0) / totalCollabs) * 100 : 0;
    // Invert: lower dispute ratio = higher score
    const disputeScore = Math.max(0, 100 - disputeRatio * 10);

    // 5. Institutional affiliation weight
    const { count: orgCount } = await supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const hasVerification = trustProfile?.is_verified_student || trustProfile?.is_verified_researcher || trustProfile?.is_verified_partner;
    const institutionalWeight = Math.min(((orgCount ?? 0) * 20) + (hasVerification ? 40 : 0), 100);

    // 6. Economic contribution score (wallet activity)
    const { data: wallet } = await supabase
      .from("wallets")
      .select("total_earned, total_spent")
      .eq("user_id", userId)
      .maybeSingle();

    const totalEconomicActivity = (wallet?.total_earned ?? 0) + (wallet?.total_spent ?? 0);
    // Normalize: cap at 100 for 500k+ activity
    const economicScore = Math.min((totalEconomicActivity / 5000) * 100, 100);

    // Compute weighted visibility score
    const rawScore =
      trustScore * 0.4 +
      dealSuccessRate * 0.2 +
      collaborationConsistency * 0.1 +
      disputeScore * 0.1 +
      institutionalWeight * 0.1 +
      economicScore * 0.1;

    const visibilityScore = Math.round(Math.min(Math.max(rawScore, 0), 100) * 10) / 10;

    const breakdown = {
      trust_score: { raw: trustScore, weight: 0.4, weighted: Math.round(trustScore * 0.4 * 10) / 10 },
      deal_success_rate: { raw: Math.round(dealSuccessRate * 10) / 10, weight: 0.2, weighted: Math.round(dealSuccessRate * 0.2 * 10) / 10 },
      collaboration_consistency: { raw: Math.round(collaborationConsistency * 10) / 10, weight: 0.1, weighted: Math.round(collaborationConsistency * 0.1 * 10) / 10 },
      dispute_score: { raw: Math.round(disputeScore * 10) / 10, weight: 0.1, weighted: Math.round(disputeScore * 0.1 * 10) / 10 },
      institutional_weight: { raw: Math.round(institutionalWeight * 10) / 10, weight: 0.1, weighted: Math.round(institutionalWeight * 0.1 * 10) / 10 },
      economic_contribution: { raw: Math.round(economicScore * 10) / 10, weight: 0.1, weighted: Math.round(economicScore * 0.1 * 10) / 10 },
    };

    // Store snapshot
    await supabase.from("visibility_scores").insert({
      user_id: userId,
      visibility_score: visibilityScore,
      breakdown,
      calculated_at: new Date().toISOString(),
    });

    // Update cached copy on profiles
    await supabase
      .from("profiles")
      .update({ visibility_score: visibilityScore })
      .eq("id", userId);

    return new Response(
      JSON.stringify({
        visibility_score: visibilityScore,
        breakdown,
        computed_at: new Date().toISOString(),
        top_trusted: visibilityScore >= 80,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
