import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = claimsData.claims.sub;
    const { action, ...params } = await req.json();

    if (action === "predict_milestone_failure") {
      const { deal_id } = params;

      // Fetch deal and its milestones
      const { data: deal } = await supabase
        .from("deal_rooms")
        .select("*")
        .eq("id", deal_id)
        .single();

      if (!deal) {
        return new Response(JSON.stringify({ error: "Deal not found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      const milestones = (deal.milestones as any[]) || [];
      const factors: any[] = [];
      let riskScore = 0;

      // Factor 1: Overdue milestones
      const overdueMilestones = milestones.filter(
        (m: any) => m.due_date && new Date(m.due_date) < new Date() && m.status !== "approved"
      );
      if (overdueMilestones.length > 0) {
        riskScore += 25 * overdueMilestones.length;
        factors.push({
          factor: "overdue_milestones",
          count: overdueMilestones.length,
          impact: "high",
          description: `${overdueMilestones.length} milestone(s) past due date`,
        });
      }

      // Factor 2: Low completion rate
      const approved = milestones.filter((m: any) => m.status === "approved").length;
      const completionRate = milestones.length > 0 ? approved / milestones.length : 0;
      if (completionRate < 0.3 && milestones.length > 2) {
        riskScore += 20;
        factors.push({
          factor: "low_completion_rate",
          rate: completionRate,
          impact: "medium",
          description: `Only ${Math.round(completionRate * 100)}% milestones completed`,
        });
      }

      // Factor 3: Rejected milestones
      const rejected = milestones.filter((m: any) => m.status === "rejected").length;
      if (rejected > 0) {
        riskScore += 15 * rejected;
        factors.push({
          factor: "rejected_milestones",
          count: rejected,
          impact: "high",
          description: `${rejected} milestone(s) rejected`,
        });
      }

      // Factor 4: Check executor's historical trust
      if (deal.seller_id) {
        const { data: trustData } = await supabase
          .from("trust_profiles")
          .select("trust_score")
          .eq("user_id", deal.seller_id)
          .maybeSingle();

        if (trustData && trustData.trust_score < 50) {
          riskScore += 15;
          factors.push({
            factor: "low_executor_trust",
            trust_score: trustData.trust_score,
            impact: "medium",
            description: `Executor trust score is ${trustData.trust_score}/100`,
          });
        }
      }

      riskScore = Math.min(riskScore, 100);
      const severity = riskScore >= 70 ? "critical" : riskScore >= 40 ? "high" : riskScore >= 20 ? "medium" : "low";

      // Store prediction
      await supabase.from("funding_predictions").insert({
        entity_type: "deal",
        entity_id: deal_id,
        prediction_type: "milestone_failure",
        risk_score: riskScore,
        confidence: 0.7 + (factors.length * 0.05),
        predicted_outcome: riskScore >= 50 ? "likely_failure" : "on_track",
        factors,
        severity,
        recommendation: riskScore >= 50
          ? "Consider escalating to dispute resolution or requesting revised timeline"
          : "Deal is progressing normally",
        computed_by: userId,
      });

      return new Response(
        JSON.stringify({
          deal_id,
          risk_score: riskScore,
          severity,
          factors,
          predicted_outcome: riskScore >= 50 ? "likely_failure" : "on_track",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "detect_synthetic_endorsements") {
      const { user_id: targetUserId } = params;

      // Look for endorsement patterns that might be synthetic
      const { data: endorsements } = await supabase
        .from("endorsements")
        .select("*")
        .eq("endorsed_user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(100);

      const flags: any[] = [];
      let riskScore = 0;

      if (endorsements && endorsements.length > 0) {
        // Check for burst endorsements (many in short period)
        const recentEndorsements = endorsements.filter(
          (e: any) =>
            new Date(e.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        );
        if (recentEndorsements.length > 10) {
          riskScore += 30;
          flags.push({
            type: "burst_pattern",
            count: recentEndorsements.length,
            description: `${recentEndorsements.length} endorsements in last 7 days`,
          });
        }

        // Check for reciprocal endorsements
        const endorserIds = endorsements.map((e: any) => e.endorser_id);
        const { data: reciprocal } = await supabase
          .from("endorsements")
          .select("endorsed_user_id")
          .eq("endorser_id", targetUserId)
          .in("endorsed_user_id", endorserIds);

        if (reciprocal && reciprocal.length > endorsements.length * 0.5) {
          riskScore += 25;
          flags.push({
            type: "reciprocal_pattern",
            reciprocal_count: reciprocal.length,
            description: `${reciprocal.length}/${endorsements.length} endorsements are reciprocal`,
          });
        }

        // Check for endorsers with low trust
        const { data: lowTrustEndorsers } = await supabase
          .from("trust_profiles")
          .select("user_id, trust_score")
          .in("user_id", endorserIds)
          .lt("trust_score", 30);

        if (lowTrustEndorsers && lowTrustEndorsers.length > endorsements.length * 0.3) {
          riskScore += 20;
          flags.push({
            type: "low_trust_endorsers",
            count: lowTrustEndorsers.length,
            description: `${lowTrustEndorsers.length} endorsers have trust < 30`,
          });
        }
      }

      riskScore = Math.min(riskScore, 100);

      await supabase.from("funding_predictions").insert({
        entity_type: "user",
        entity_id: targetUserId,
        prediction_type: "synthetic_endorsement",
        risk_score: riskScore,
        confidence: 0.65,
        predicted_outcome: riskScore >= 40 ? "suspicious" : "clean",
        flagged_issues: flags,
        severity: riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low",
        recommendation: riskScore >= 40
          ? "Review endorsement patterns — possible gaming detected"
          : "No synthetic endorsement patterns detected",
        computed_by: userId,
      });

      return new Response(
        JSON.stringify({
          target_user_id: targetUserId,
          risk_score: riskScore,
          flags,
          verdict: riskScore >= 40 ? "suspicious" : "clean",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "compute_institutional_trust") {
      const { institution_id } = params;

      // Fetch org info
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", institution_id)
        .single();

      // Compute scores from various sources
      // 1. Execution score from completed deals
      const { data: deals } = await supabase
        .from("deal_rooms")
        .select("status")
        .or(`buyer_id.eq.${institution_id},seller_id.eq.${institution_id}`);

      const completedDeals = (deals || []).filter((d: any) => d.status === "completed").length;
      const totalDeals = (deals || []).length;
      const executionScore = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 50;

      // 2. Dispute ratio
      const disputedDeals = (deals || []).filter((d: any) => d.status === "disputed").length;
      const disputeRatio = totalDeals > 0 ? (disputedDeals / totalDeals) * 100 : 0;

      // 3. Capital efficiency from escrows
      const { data: escrows } = await supabase
        .from("escrow_transactions")
        .select("status, amount")
        .eq("institution_id", institution_id);

      const totalEscrow = (escrows || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const releasedEscrow = (escrows || [])
        .filter((e: any) => e.status === "released")
        .reduce((s: number, e: any) => s + (e.amount || 0), 0);
      const capitalEfficiency = totalEscrow > 0 ? (releasedEscrow / totalEscrow) * 100 : 50;

      // Composite score
      const compositeScore = Math.round(
        executionScore * 0.35 +
        (100 - disputeRatio) * 0.2 +
        capitalEfficiency * 0.25 +
        50 * 0.1 + // peer_validation placeholder
        50 * 0.1   // cross_border placeholder
      );

      const tier = compositeScore >= 85 ? "AAA" :
                   compositeScore >= 70 ? "AA" :
                   compositeScore >= 55 ? "A" :
                   compositeScore >= 40 ? "BBB" :
                   compositeScore >= 25 ? "BB" : "B";

      // Store
      await supabase.from("institutional_trust_index").insert({
        institution_id,
        institution_name: org?.name || "Unknown",
        execution_score: executionScore,
        dispute_ratio: disputeRatio,
        capital_efficiency: capitalEfficiency,
        peer_validation_score: 50,
        cross_border_collab_score: 50,
        research_output_score: 50,
        composite_trust_score: compositeScore,
        tier,
        period: new Date().toISOString().slice(0, 7),
      });

      return new Response(
        JSON.stringify({
          institution_id,
          institution_name: org?.name,
          composite_trust_score: compositeScore,
          tier,
          execution_score: executionScore,
          dispute_ratio: disputeRatio,
          capital_efficiency: capitalEfficiency,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
