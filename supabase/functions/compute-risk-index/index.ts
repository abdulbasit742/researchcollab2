import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const entityType = body.entity_type || null;
    const entityId = body.entity_id || null;

    // 1. Trust volatility - stddev of recent trust score changes
    const { data: trustHistory } = await supabase
      .from("trust_score_history")
      .select("user_id, new_score, previous_score, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    const trustChanges = (trustHistory || []).map((h: any) => Math.abs((h.new_score || 0) - (h.previous_score || 0)));
    const avgTrustChange = trustChanges.length > 0 ? trustChanges.reduce((a: number, b: number) => a + b, 0) / trustChanges.length : 0;
    const trustVolatility = Math.min(avgTrustChange * 10, 100); // normalize to 0-100

    // 2. Dispute spike rate
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();

    const { count: recentDisputes } = await supabase
      .from("academic_disputes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo);

    const { count: priorDisputes } = await supabase
      .from("academic_disputes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo)
      .lt("created_at", thirtyDaysAgo);

    const disputeSpikeRate = priorDisputes && priorDisputes > 0
      ? Math.min(((recentDisputes || 0) / priorDisputes - 1) * 50 + 50, 100)
      : (recentDisputes || 0) > 0 ? 60 : 0;

    // 3. Liquidity distortion from skill_market_metrics
    const { data: skillMetrics } = await supabase
      .from("skill_market_metrics")
      .select("liquidity_score, skill_name")
      .limit(100);

    const liquidityScores = (skillMetrics || []).map((s: any) => Number(s.liquidity_score) || 0);
    const avgLiquidity = liquidityScores.length > 0 ? liquidityScores.reduce((a: number, b: number) => a + b, 0) / liquidityScores.length : 50;
    const liquidityVariance = liquidityScores.length > 0
      ? liquidityScores.reduce((sum: number, s: number) => sum + Math.pow(s - avgLiquidity, 2), 0) / liquidityScores.length
      : 0;
    const liquidityDistortion = Math.min(Math.sqrt(liquidityVariance) * 2, 100);

    // 4. Capital concentration - top wallets vs rest
    const { data: wallets } = await supabase
      .from("wallets")
      .select("available_balance, total_earned")
      .order("total_earned", { ascending: false })
      .limit(100);

    let capitalConcentration = 0;
    if (wallets && wallets.length > 5) {
      const totalEarned = wallets.reduce((s: number, w: any) => s + (Number(w.total_earned) || 0), 0);
      const topEarned = wallets.slice(0, Math.ceil(wallets.length * 0.1)).reduce((s: number, w: any) => s + (Number(w.total_earned) || 0), 0);
      capitalConcentration = totalEarned > 0 ? Math.min((topEarned / totalEarned) * 100, 100) : 0;
    }

    // 5. Pricing anomaly - variance in bid prices
    const { data: bids } = await supabase
      .from("earning_bids")
      .select("bid_amount")
      .order("created_at", { ascending: false })
      .limit(200);

    const bidAmounts = (bids || []).map((b: any) => Number(b.bid_amount) || 0).filter((b: number) => b > 0);
    let pricingAnomaly = 0;
    if (bidAmounts.length > 5) {
      const avgBid = bidAmounts.reduce((a: number, b: number) => a + b, 0) / bidAmounts.length;
      const bidVariance = bidAmounts.reduce((s: number, b: number) => s + Math.pow(b - avgBid, 2), 0) / bidAmounts.length;
      const cv = avgBid > 0 ? Math.sqrt(bidVariance) / avgBid : 0;
      pricingAnomaly = Math.min(cv * 50, 100);
    }

    // 6. Centralization risk - pod formation dominance
    const { data: podMembers } = await supabase
      .from("pod_members")
      .select("user_id")
      .limit(500);

    let centralizationRisk = 0;
    if (podMembers && podMembers.length > 10) {
      const userCounts: Record<string, number> = {};
      podMembers.forEach((pm: any) => { userCounts[pm.user_id] = (userCounts[pm.user_id] || 0) + 1; });
      const counts = Object.values(userCounts);
      const maxCount = Math.max(...counts);
      centralizationRisk = Math.min((maxCount / podMembers.length) * 200, 100);
    }

    // Compute composite score with EMA smoothing
    const compositeRaw =
      trustVolatility * 0.25 +
      disputeSpikeRate * 0.20 +
      liquidityDistortion * 0.15 +
      capitalConcentration * 0.15 +
      pricingAnomaly * 0.15 +
      centralizationRisk * 0.10;

    // Get previous score for EMA smoothing
    const targetEntityType = entityType || "platform";
    const targetEntityId = entityId || "global";

    const { data: prevMetric } = await supabase
      .from("risk_metrics")
      .select("composite_risk_score")
      .eq("entity_type", targetEntityType)
      .eq("entity_id", targetEntityId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const alpha = 0.3; // EMA smoothing factor
    const prevScore = prevMetric?.composite_risk_score || compositeRaw;
    const compositeScore = Math.round((alpha * compositeRaw + (1 - alpha) * Number(prevScore)) * 100) / 100;

    // Assign risk level
    let riskLevel = "stable";
    if (compositeScore >= 75) riskLevel = "critical";
    else if (compositeScore >= 50) riskLevel = "high";
    else if (compositeScore >= 25) riskLevel = "elevated";

    // Store in risk_metrics
    const { error: insertError } = await supabase.from("risk_metrics").insert({
      entity_type: targetEntityType,
      entity_id: targetEntityId,
      trust_volatility: Math.round(trustVolatility * 100) / 100,
      dispute_spike_rate: Math.round(disputeSpikeRate * 100) / 100,
      liquidity_distortion: Math.round(liquidityDistortion * 100) / 100,
      capital_concentration_index: Math.round(capitalConcentration * 100) / 100,
      pricing_anomaly_score: Math.round(pricingAnomaly * 100) / 100,
      centralization_risk: Math.round(centralizationRisk * 100) / 100,
      composite_risk_score: compositeScore,
      risk_level: riskLevel,
    });

    // Append to risk_trends
    await supabase.from("risk_trends").insert({
      entity_type: targetEntityType,
      entity_id: targetEntityId,
      risk_score: compositeScore,
    });

    // Check for level change and generate alert
    if (prevMetric) {
      let prevLevel = "stable";
      const ps = Number(prevMetric.composite_risk_score);
      if (ps >= 75) prevLevel = "critical";
      else if (ps >= 50) prevLevel = "high";
      else if (ps >= 25) prevLevel = "elevated";

      if (prevLevel !== riskLevel) {
        const severity = compositeScore > ps ? (riskLevel === "critical" ? "critical" : "warning") : "info";
        await supabase.from("systemic_alerts").insert({
          entity_type: targetEntityType,
          entity_id: targetEntityId,
          alert_type: "risk_level_change",
          severity,
          description: `Risk level changed from ${prevLevel} to ${riskLevel} (score: ${compositeScore})`,
        });
      }
    }

    return new Response(JSON.stringify({
      entity_type: targetEntityType,
      entity_id: targetEntityId,
      composite_risk_score: compositeScore,
      risk_level: riskLevel,
      breakdown: {
        trust_volatility: Math.round(trustVolatility * 100) / 100,
        dispute_spike_rate: Math.round(disputeSpikeRate * 100) / 100,
        liquidity_distortion: Math.round(liquidityDistortion * 100) / 100,
        capital_concentration_index: Math.round(capitalConcentration * 100) / 100,
        pricing_anomaly_score: Math.round(pricingAnomaly * 100) / 100,
        centralization_risk: Math.round(centralizationRisk * 100) / 100,
      },
      error: insertError?.message || null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
