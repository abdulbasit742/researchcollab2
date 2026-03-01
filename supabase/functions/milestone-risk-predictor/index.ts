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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: corsHeaders,
      });
    }

    const userId = claimsData.claims.sub;
    const { action, ...params } = await req.json();

    if (action === "predict_milestone_risk") {
      const { deal_id, milestone_id } = params;

      const { data: deal } = await supabase
        .from("deal_rooms")
        .select("*")
        .eq("id", deal_id)
        .single();

      if (!deal) {
        return new Response(JSON.stringify({ error: "Deal not found" }), {
          status: 404, headers: corsHeaders,
        });
      }

      const milestones = (deal.milestones as any[]) || [];
      const target = milestone_id
        ? milestones.find((m: any) => m.id === milestone_id)
        : null;

      const factors: any[] = [];
      let riskScore = 0;
      let failureProbability = 0;
      let disputeProbability = 0;
      let predictedDelay = 0;

      // Factor 1: Overdue check
      const now = new Date();
      if (target?.due_date && new Date(target.due_date) < now && target.status !== "approved") {
        const daysOverdue = Math.ceil((now.getTime() - new Date(target.due_date).getTime()) / 86400000);
        riskScore += Math.min(30, daysOverdue * 3);
        predictedDelay = daysOverdue + 5;
        factors.push({ factor: "overdue", days: daysOverdue, impact: "high" });
      }

      // Factor 2: Historical rejection pattern
      const rejectedCount = milestones.filter((m: any) => m.status === "rejected").length;
      if (rejectedCount > 0) {
        riskScore += rejectedCount * 12;
        disputeProbability += rejectedCount * 10;
        factors.push({ factor: "rejection_history", count: rejectedCount, impact: "high" });
      }

      // Factor 3: Completion velocity
      const approvedCount = milestones.filter((m: any) => m.status === "approved").length;
      const totalCount = milestones.length;
      if (totalCount > 2 && approvedCount / totalCount < 0.3) {
        riskScore += 15;
        failureProbability += 20;
        factors.push({ factor: "slow_velocity", rate: approvedCount / totalCount, impact: "medium" });
      }

      // Factor 4: Executor trust
      if (deal.seller_id) {
        const { data: trust } = await supabase
          .from("trust_profiles")
          .select("trust_score")
          .eq("user_id", deal.seller_id)
          .maybeSingle();
        if (trust && trust.trust_score < 40) {
          riskScore += 20;
          failureProbability += 15;
          factors.push({ factor: "low_executor_trust", score: trust.trust_score, impact: "high" });
        }
      }

      riskScore = Math.min(100, riskScore);
      failureProbability = Math.min(100, failureProbability + riskScore * 0.4);
      disputeProbability = Math.min(100, disputeProbability + riskScore * 0.2);

      const recommendation = riskScore >= 70
        ? "Critical: Immediate intervention recommended. Consider dispute resolution."
        : riskScore >= 40
        ? "Warning: Monitor closely. Request progress update from executor."
        : "On track. No immediate action required.";

      // Store forecast
      const { data: forecast, error } = await supabase
        .from("milestone_risk_forecasts")
        .insert({
          milestone_id: milestone_id || deal_id,
          deal_id,
          risk_score: riskScore,
          failure_probability: failureProbability,
          dispute_probability: disputeProbability,
          predicted_delay_days: predictedDelay,
          risk_factors: factors,
          recommendation,
          generated_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        forecast,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "compute_supervisor_index") {
      const { supervisor_id } = params;

      // Fetch supervised deals
      const { data: deals } = await supabase
        .from("deal_rooms")
        .select("status, milestones")
        .eq("buyer_id", supervisor_id);

      const totalDeals = (deals || []).length;
      const completedDeals = (deals || []).filter((d: any) => d.status === "completed").length;
      const disputedDeals = (deals || []).filter((d: any) => d.status === "disputed").length;

      const completionScore = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 50;
      const disputeScore = totalDeals > 0 ? (1 - disputedDeals / totalDeals) * 100 : 100;

      // Funding success
      const { data: escrows } = await supabase
        .from("escrow_transactions")
        .select("status")
        .eq("funder_id", supervisor_id);

      const fundedCount = (escrows || []).length;
      const releasedCount = (escrows || []).filter((e: any) => e.status === "released").length;
      const fundingRate = fundedCount > 0 ? (releasedCount / fundedCount) * 100 : 50;

      // Validation score from peer reviews
      const { count: validationCount } = await supabase
        .from("peer_reviews")
        .select("id", { count: "exact", head: true })
        .eq("reviewer_id", supervisor_id);

      const validationScore = Math.min(100, (validationCount || 0) * 10);

      const compositeScore = Math.round(
        completionScore * 0.3 + disputeScore * 0.25 + fundingRate * 0.25 + validationScore * 0.2
      );

      const grade = compositeScore >= 90 ? "A+" :
                    compositeScore >= 80 ? "A" :
                    compositeScore >= 70 ? "B+" :
                    compositeScore >= 60 ? "B" :
                    compositeScore >= 50 ? "C" : "D";

      const period = new Date().toISOString().slice(0, 7);

      // Upsert
      const { data, error } = await supabase
        .from("supervisor_performance_index")
        .upsert({
          supervisor_id,
          completion_score: completionScore,
          dispute_involvement_score: disputeScore,
          funding_success_rate: fundingRate,
          validation_score: validationScore,
          composite_score: compositeScore,
          grade,
          period,
          updated_at: new Date().toISOString(),
        }, { onConflict: "supervisor_id,period" })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        index: data,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
});
