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

    if (action === "compute_sovereign_metrics") {
      const { node_id } = params;

      const { data: node } = await supabase.from("sovereign_nodes").select("*").eq("id", node_id).single();
      if (!node) return new Response(JSON.stringify({ error: "Node not found" }), { status: 404, headers: corsHeaders });

      // Compute metrics from existing data
      const { count: researchCount } = await supabase
        .from("research_executions").select("id", { count: "exact", head: true });

      const { data: deals } = await supabase.from("deal_rooms").select("status").limit(500);
      const completed = (deals || []).filter((d: any) => d.status === "completed").length;
      const total = (deals || []).length;

      const executionEfficiency = total > 0 ? Math.round((completed / total) * 100) : 50;
      const researchOutput = Math.min(100, (researchCount || 0) * 2);
      const fundingVelocity = Math.round(executionEfficiency * 0.8 + researchOutput * 0.2);
      const nationalTrust = Math.round(executionEfficiency * 0.4 + researchOutput * 0.3 + 50 * 0.3);

      const period = new Date().toISOString().slice(0, 7);
      const { data, error } = await supabase.from("sovereign_metrics").upsert({
        node_id, research_output_index: researchOutput, execution_efficiency_index: executionEfficiency,
        national_trust_score: nationalTrust, funding_velocity: fundingVelocity, period, updated_at: new Date().toISOString(),
      }, { onConflict: "node_id,period" }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, metrics: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "detect_governance_anomaly") {
      const { entity_type, entity_id } = params;

      const anomalies: any[] = [];
      let totalScore = 0;

      if (entity_type === "user") {
        // Check endorsement patterns
        const { data: endorsements } = await supabase.from("endorsements").select("*").eq("endorsed_user_id", entity_id).limit(100);
        const recent = (endorsements || []).filter((e: any) => new Date(e.created_at).getTime() > Date.now() - 7 * 86400000);
        if (recent.length > 15) {
          totalScore += 35;
          anomalies.push({ type: "endorsement_burst", count: recent.length, reason: "Excessive endorsements in 7 days" });
        }

        // Check dispute patterns
        const { count: disputeCount } = await supabase.from("disputes").select("id", { count: "exact", head: true })
          .or(`complainant_id.eq.${entity_id},respondent_id.eq.${entity_id}`);
        if ((disputeCount || 0) > 5) {
          totalScore += 25;
          anomalies.push({ type: "dispute_frequency", count: disputeCount, reason: "High dispute involvement" });
        }
      }

      if (entity_type === "institution") {
        const { data: deals } = await supabase.from("deal_rooms").select("status").or(`buyer_id.eq.${entity_id},seller_id.eq.${entity_id}`);
        const disputed = (deals || []).filter((d: any) => d.status === "disputed").length;
        const ratio = (deals || []).length > 0 ? disputed / (deals || []).length : 0;
        if (ratio > 0.3) {
          totalScore += 40;
          anomalies.push({ type: "high_dispute_ratio", ratio, reason: "Dispute ratio exceeds 30%" });
        }
      }

      totalScore = Math.min(100, totalScore);
      const severity = totalScore >= 60 ? "high" : totalScore >= 30 ? "medium" : "low";

      // Store anomalies
      for (const a of anomalies) {
        await supabase.from("governance_anomalies").insert({
          entity_type, entity_id, anomaly_score: totalScore, anomaly_type: a.type,
          flagged_reason: a.reason, severity, detected_by: userId,
        });
      }

      return new Response(JSON.stringify({
        entity_type, entity_id, anomaly_score: totalScore, severity,
        anomalies, advisory: totalScore >= 50 ? "Review recommended" : "No immediate action needed",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "compute_governance_health") {
      const { entity_id, entity_type } = params;

      // Aggregate anomaly scores
      const { data: anomalyData } = await supabase.from("governance_anomalies")
        .select("anomaly_type, anomaly_score").eq("entity_id", entity_id).order("created_at", { ascending: false }).limit(20);

      const endorsementIrregularity = (anomalyData || [])
        .filter((a: any) => a.anomaly_type === "endorsement_burst")
        .reduce((s: number, a: any) => Math.max(s, a.anomaly_score), 0);

      const disputePattern = (anomalyData || [])
        .filter((a: any) => ["dispute_frequency", "high_dispute_ratio"].includes(a.anomaly_type))
        .reduce((s: number, a: any) => Math.max(s, a.anomaly_score), 0);

      const manipulationRisk = Math.min(100, Math.round(endorsementIrregularity * 0.5 + disputePattern * 0.5));
      const composite = Math.round(100 - manipulationRisk * 0.4 - endorsementIrregularity * 0.3 - disputePattern * 0.3);
      const grade = composite >= 85 ? "A" : composite >= 70 ? "B" : composite >= 50 ? "C" : "D";
      const period = new Date().toISOString().slice(0, 7);

      const { data, error } = await supabase.from("governance_health_index").upsert({
        entity_id, entity_type: entity_type || "institution",
        manipulation_risk_score: manipulationRisk, endorsement_irregularity_score: endorsementIrregularity,
        dispute_pattern_score: disputePattern, governance_composite_score: composite,
        grade, period, updated_at: new Date().toISOString(),
      }, { onConflict: "entity_id,period" }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, health: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "compute_human_capital") {
      const { institution_id } = params;

      // Compute from existing data
      const { data: members } = await supabase.from("organization_members").select("user_id").eq("organization_id", institution_id).limit(500);
      const memberIds = (members || []).map((m: any) => m.user_id);

      let skillGrowth = 50, executionMaturity = 50, commercialization = 0, employability = 50, retention = 80;

      if (memberIds.length > 0) {
        const { data: trustData } = await supabase.from("trust_profiles").select("trust_score").in("user_id", memberIds.slice(0, 50));
        const avgTrust = (trustData || []).reduce((s: number, t: any) => s + (t.trust_score || 0), 0) / Math.max(1, (trustData || []).length);
        executionMaturity = Math.min(100, Math.round(avgTrust));
        skillGrowth = Math.min(100, Math.round(avgTrust * 0.7 + 30));
        employability = Math.min(100, Math.round(avgTrust * 0.6 + 40));
      }

      const composite = Math.round(skillGrowth * 0.25 + executionMaturity * 0.25 + commercialization * 0.2 + employability * 0.2 + retention * 0.1);
      const period = new Date().toISOString().slice(0, 7);

      const { data, error } = await supabase.from("human_capital_index").upsert({
        institution_id, skill_growth_rate: skillGrowth, execution_maturity_score: executionMaturity,
        research_commercialization_index: commercialization, graduate_employability_index: employability,
        talent_retention_score: retention, composite_hci: composite, period, updated_at: new Date().toISOString(),
      }, { onConflict: "institution_id,period" }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, hci: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
