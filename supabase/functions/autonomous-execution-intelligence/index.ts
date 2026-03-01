import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;
    const { action, ...params } = await req.json();

    // MODULE 9: Execution Drift Detection
    if (action === "detect_execution_drift") {
      const { project_id } = params;

      const { data: deal } = await supabase.from("deal_rooms").select("*").eq("id", project_id).single();
      if (!deal) return new Response(JSON.stringify({ error: "Project not found" }), { status: 404, headers: corsHeaders });

      const milestones = (deal.milestones as any[]) || [];
      const now = new Date();
      let velocityScore = 100, delayTrend = 0, patternVariance = 0;

      const approved = milestones.filter((m: any) => m.status === "approved");
      const pending = milestones.filter((m: any) => m.status === "pending" || m.status === "submitted");
      const overdue = milestones.filter((m: any) => m.due_date && new Date(m.due_date) < now && m.status !== "approved");

      velocityScore = milestones.length > 0 ? Math.round((approved.length / milestones.length) * 100) : 50;
      delayTrend = overdue.length > 0 ? Math.min(100, overdue.length * 20) : 0;
      patternVariance = Math.abs(velocityScore - 50) + delayTrend * 0.5;

      const anomalyFlag = delayTrend >= 40 || velocityScore < 30;
      const severity = anomalyFlag && delayTrend >= 60 ? "critical" : anomalyFlag ? "warning" : "normal";
      const recommendation = severity === "critical"
        ? "Project shows severe execution drift. Immediate review recommended."
        : severity === "warning"
        ? "Execution velocity declining. Monitor closely."
        : "Project executing within normal parameters.";

      const { data, error } = await supabase.from("execution_drift_analysis").insert({
        project_id, milestone_velocity_score: velocityScore, delay_trend_score: delayTrend,
        completion_pattern_variance: patternVariance, anomaly_flag: anomalyFlag,
        drift_severity: severity, recommendation, generated_by: userId,
      }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, analysis: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // MODULE 10: Systemic Risk Monitor
    if (action === "compute_systemic_risk") {
      const { institution_id } = params;

      const { data: deals } = await supabase.from("deal_rooms").select("status, total_amount")
        .or(`buyer_id.eq.${institution_id},seller_id.eq.${institution_id}`).limit(200);

      const totalDeals = (deals || []).length;
      const disputed = (deals || []).filter((d: any) => d.status === "disputed").length;
      const totalAmount = (deals || []).reduce((s: number, d: any) => s + (d.total_amount || 0), 0);
      const maxDeal = Math.max(...(deals || []).map((d: any) => d.total_amount || 0), 0);

      const capitalConcentration = totalAmount > 0 ? Math.round((maxDeal / totalAmount) * 100) : 0;
      const disputeCluster = totalDeals > 0 ? Math.round((disputed / totalDeals) * 100) : 0;

      const failedDeals = (deals || []).filter((d: any) => d.status === "cancelled" || d.status === "disputed").length;
      const executionInstability = totalDeals > 0 ? Math.round((failedDeals / totalDeals) * 100) : 0;

      const { data: anomalies } = await supabase.from("governance_anomalies")
        .select("anomaly_score").eq("entity_id", institution_id).order("created_at", { ascending: false }).limit(5);
      const govPressure = (anomalies || []).reduce((s: number, a: any) => Math.max(s, a.anomaly_score || 0), 0);

      const overall = Math.round(capitalConcentration * 0.25 + disputeCluster * 0.3 + executionInstability * 0.25 + govPressure * 0.2);
      const grade = overall <= 20 ? "A" : overall <= 40 ? "B" : overall <= 60 ? "C" : "D";
      const period = new Date().toISOString().slice(0, 7);

      const { data, error } = await supabase.from("systemic_risk_index").upsert({
        institution_id, capital_concentration_risk: capitalConcentration, dispute_cluster_risk: disputeCluster,
        execution_instability_score: executionInstability, governance_pressure_score: govPressure,
        overall_risk_score: overall, risk_grade: grade, period, generated_by: userId,
      }, { onConflict: "institution_id,period" }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, risk: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // MODULE 11: Capital Allocation Optimizer
    if (action === "generate_capital_optimization") {
      const { project_id } = params;

      const { data: deal } = await supabase.from("deal_rooms").select("*").eq("id", project_id).single();
      if (!deal) return new Response(JSON.stringify({ error: "Project not found" }), { status: 404, headers: corsHeaders });

      const milestones = (deal.milestones as any[]) || [];
      const approved = milestones.filter((m: any) => m.status === "approved").length;
      const total = milestones.length;
      const completionRate = total > 0 ? approved / total : 0;

      // Check executor trust
      let executorTrust = 50;
      if (deal.seller_id) {
        const { data: trust } = await supabase.from("trust_profiles").select("trust_score").eq("user_id", deal.seller_id).maybeSingle();
        executorTrust = trust?.trust_score || 50;
      }

      const executionConfidence = Math.round(completionRate * 40 + (executorTrust / 100) * 40 + 20);
      const riskAdjusted = Math.round(executionConfidence * 0.7 + (100 - (deal.total_amount > 100000 ? 30 : 10)) * 0.3);

      let adjustment = 0;
      let rationale = "";
      if (executionConfidence >= 80) {
        adjustment = 10;
        rationale = "Strong execution track record. Consider increasing funding allocation.";
      } else if (executionConfidence >= 50) {
        adjustment = 0;
        rationale = "Moderate confidence. Maintain current funding level.";
      } else {
        adjustment = -15;
        rationale = "Low execution confidence. Consider reducing exposure or requiring additional milestones.";
      }

      const { data, error } = await supabase.from("capital_optimization_advice").insert({
        project_id, recommended_funding_adjustment: adjustment, risk_adjusted_score: riskAdjusted,
        execution_confidence_index: executionConfidence, rationale, generated_by: userId,
      }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, advice: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // MODULE 12: Institutional Drift Monitor
    if (action === "detect_institutional_drift") {
      const { institution_id } = params;

      // Trust trend
      const { data: trustData } = await supabase.from("institutional_trust_index")
        .select("composite_trust_score").eq("institution_id", institution_id).order("created_at", { ascending: false }).limit(3);
      const trustScores = (trustData || []).map((t: any) => t.composite_trust_score || 0);
      const trustTrend = trustScores.length >= 2 ? trustScores[0] - trustScores[trustScores.length - 1] : 0;

      // Execution quality trend
      const { data: deals } = await supabase.from("deal_rooms").select("status")
        .or(`buyer_id.eq.${institution_id},seller_id.eq.${institution_id}`).limit(100);
      const completed = (deals || []).filter((d: any) => d.status === "completed").length;
      const executionQuality = (deals || []).length > 0 ? Math.round((completed / (deals || []).length) * 100) : 50;

      // Endorsement integrity
      const { data: anomalyData } = await supabase.from("governance_anomalies")
        .select("anomaly_score").eq("entity_id", institution_id).eq("anomaly_type", "endorsement_burst").limit(5);
      const endorsementIntegrity = 100 - ((anomalyData || []).reduce((s: number, a: any) => Math.max(s, a.anomaly_score || 0), 0));

      const anomalyScore = Math.max(0, Math.abs(trustTrend) > 20 ? 40 : 0) +
        (executionQuality < 40 ? 30 : 0) + (endorsementIntegrity < 60 ? 30 : 0);

      const direction = trustTrend > 10 ? "improving" : trustTrend < -10 ? "declining" : "stable";
      const period = new Date().toISOString().slice(0, 7);

      const { data, error } = await supabase.from("institutional_drift_monitor").upsert({
        institution_id, trust_score_trend: trustTrend, execution_quality_trend: executionQuality,
        endorsement_integrity_trend: endorsementIntegrity, anomaly_score: Math.min(100, anomalyScore),
        drift_direction: direction, period, generated_by: userId,
      }, { onConflict: "institution_id,period" }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, drift: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
