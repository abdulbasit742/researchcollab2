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
    // JWT Authentication - Admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: claimsData.claims.sub });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all invariants
    const { data: invariants } = await supabase
      .from("constitutional_invariants")
      .select("*");

    if (!invariants?.length) {
      return new Response(JSON.stringify({ message: "No invariants configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch platform data for analysis
    const [
      { data: trustProfiles },
      { data: wallets },
      { data: disputes },
      { data: agpVotes },
    ] = await Promise.all([
      supabase.from("user_trust_profiles").select("trust_score, user_id"),
      supabase.from("wallets").select("available_balance, escrow_balance, user_id"),
      supabase.from("disputes").select("id, status, created_at"),
      supabase.from("agp_votes").select("pod_id, voter_id, weighted_score"),
    ]);

    const scores = (trustProfiles || []).map((p: any) => p.trust_score || 0);
    const totalUsers = scores.length || 1;

    // --- Compute metrics ---

    // 1. Trust Gini coefficient
    const sorted = [...scores].sort((a, b) => a - b);
    let giniNum = 0;
    for (let i = 0; i < sorted.length; i++) {
      giniNum += (2 * (i + 1) - sorted.length - 1) * sorted[i];
    }
    const giniDen = sorted.length * (sorted.reduce((s, v) => s + v, 0) || 1);
    const trustGini = Math.abs(giniNum / giniDen);

    // 2. Max capital share %
    const balances = (wallets || []).map((w: any) => (w.available_balance || 0) + (w.escrow_balance || 0));
    const totalCapital = balances.reduce((s: number, v: number) => s + v, 0) || 1;
    const maxCapital = Math.max(...balances, 0);
    const maxCapitalSharePct = (maxCapital / totalCapital) * 100;

    // 3. Governance vote imbalance (institution-level approximation via voter clustering)
    const voterCounts: Record<string, number> = {};
    (agpVotes || []).forEach((v: any) => {
      voterCounts[v.voter_id] = (voterCounts[v.voter_id] || 0) + (v.weighted_score || 1);
    });
    const totalVoteWeight = Object.values(voterCounts).reduce((s, v) => s + v, 0) || 1;
    const maxVoteShare = Math.max(...Object.values(voterCounts), 0);
    const maxVoteSharePct = (maxVoteShare / totalVoteWeight) * 100;

    // 4. Platform dispute rate
    const totalDisputes = (disputes || []).length;
    const platformDisputeRate = totalUsers > 0 ? (totalDisputes / totalUsers) * 100 : 0;

    // 5. Visibility concentration (top 10% trust score share)
    const top10Count = Math.max(1, Math.ceil(totalUsers * 0.1));
    const topScores = [...scores].sort((a, b) => b - a).slice(0, top10Count);
    const totalScore = scores.reduce((s, v) => s + v, 0) || 1;
    const top10VisibilityPct = (topScores.reduce((s, v) => s + v, 0) / totalScore) * 100;

    // 6. Institutional deal dominance (simplified)
    const maxInstDealSharePct = 10; // Placeholder - needs institution-deal joins

    const metricMap: Record<string, number> = {
      trust_gini: trustGini,
      max_capital_share_pct: maxCapitalSharePct,
      max_vote_share_pct: maxVoteSharePct,
      platform_dispute_rate: platformDisputeRate,
      top10_visibility_pct: top10VisibilityPct,
      max_inst_deal_share_pct: maxInstDealSharePct,
    };

    // --- Check invariants and create violations ---
    const violations: any[] = [];
    const auditLogs: any[] = [];
    let overallHealth = 100;

    for (const inv of invariants) {
      const currentValue = metricMap[inv.monitoring_metric] ?? 0;
      const exceeded = currentValue > inv.threshold_value;
      const anomalyScore = exceeded
        ? Math.min(100, ((currentValue - inv.threshold_value) / inv.threshold_value) * 100)
        : 0;

      // EMA smoothing - reduce false positives
      const smoothedAnomaly = anomalyScore * 0.7;

      if (smoothedAnomaly > 10) {
        const severity =
          smoothedAnomaly > 60 ? "critical" : smoothedAnomaly > 30 ? "high" : "warning";

        violations.push({
          invariant_id: inv.id,
          detected_value: currentValue,
          severity_level: severity,
          flagged_by: "AI",
        });

        overallHealth -= smoothedAnomaly * 0.15;
      }

      auditLogs.push({
        system_checked: inv.monitoring_metric,
        anomaly_score: smoothedAnomaly,
        explanation: {
          invariant: inv.invariant_name,
          threshold: inv.threshold_value,
          current: currentValue,
          exceeded,
        },
      });
    }

    // Store violations
    if (violations.length > 0) {
      await supabase.from("constitutional_violations").insert(violations);
    }

    // Store audit logs
    if (auditLogs.length > 0) {
      await supabase.from("guardian_audit_logs").insert(auditLogs);
    }

    // Store concentration metrics
    await supabase.from("concentration_metrics").insert([
      { metric_type: "capital", concentration_index: maxCapitalSharePct },
      { metric_type: "governance_votes", concentration_index: maxVoteSharePct },
      { metric_type: "visibility", concentration_index: top10VisibilityPct },
    ]);

    // Store bias record for trust distribution
    await supabase.from("bias_monitoring_records").insert({
      algorithm_name: "trust_scoring",
      bias_score: trustGini,
      affected_group: "all_users",
    });

    return new Response(
      JSON.stringify({
        overallHealth: Math.max(0, Math.round(overallHealth)),
        violations: violations.length,
        metrics: metricMap,
        auditCount: auditLogs.length,
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
