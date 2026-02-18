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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: authErr } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const { institution_id } = await req.json();
    if (!institution_id) {
      return new Response(JSON.stringify({ error: "institution_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is institution admin
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", institution_id)
      .eq("user_id", userId)
      .maybeSingle();

    const { data: isAdminRole } = await supabase.rpc("is_admin", { check_user_id: userId });

    if (!isAdminRole && (!membership || !["admin", "owner"].includes(membership.role))) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Get all member user IDs
    const { data: members } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("org_id", institution_id);

    const memberIds = (members || []).map((m: any) => m.user_id);
    const totalMembers = memberIds.length;

    if (totalMembers === 0) {
      const emptyResult = {
        institution_id,
        total_members: 0,
        avg_trust_score: 0,
        avg_visibility_score: 0,
        total_active_deals: 0,
        total_completed_deals: 0,
        avg_deal_health: 0,
        skill_distribution: {},
        income_generated_last_90_days: 0,
        skill_gaps: [],
        forecast: { projected_growth_90_days: 0, projected_income_90_days: 0, projected_trust_growth: 0, risk_alert_level: "low" },
        performance: { collaboration_score: 0, reliability_score: 0, dispute_ratio: 0, economic_velocity: 0, knowledge_output_score: 0 },
        health_index: 0,
        badges: [],
        calculated_at: new Date().toISOString(),
      };
      return new Response(JSON.stringify(emptyResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Aggregate trust scores
    const { data: trustProfiles } = await supabase
      .from("user_trust_profiles")
      .select("trust_score, total_projects_completed, successful_rate, dispute_rate, financial_reliability_score")
      .in("user_id", memberIds);

    const trustScores = (trustProfiles || []).map((t: any) => t.trust_score || 0);
    const avgTrustScore = trustScores.length > 0
      ? Math.round((trustScores.reduce((a: number, b: number) => a + b, 0) / trustScores.length) * 10) / 10
      : 0;

    // 3. Aggregate visibility scores
    const { data: profiles } = await supabase
      .from("profiles")
      .select("visibility_score, skills")
      .in("id", memberIds);

    const visScores = (profiles || []).map((p: any) => p.visibility_score || 0);
    const avgVisibilityScore = visScores.length > 0
      ? Math.round((visScores.reduce((a: number, b: number) => a + b, 0) / visScores.length) * 10) / 10
      : 0;

    // 4. Build skill distribution
    const skillCounts: Record<string, number> = {};
    (profiles || []).forEach((p: any) => {
      const skills = p.skills || [];
      skills.forEach((s: string) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    // 5. Deal stats
    const { data: deals } = await supabase
      .from("deal_rooms")
      .select("status, health_score")
      .or(memberIds.map((id: string) => `buyer_id.eq.${id},provider_id.eq.${id}`).join(","));

    const activeDeals = (deals || []).filter((d: any) => d.status === "active").length;
    const completedDeals = (deals || []).filter((d: any) => d.status === "completed").length;
    const healthScores = (deals || []).map((d: any) => d.health_score || 50);
    const avgDealHealth = healthScores.length > 0
      ? Math.round((healthScores.reduce((a: number, b: number) => a + b, 0) / healthScores.length) * 10) / 10
      : 0;

    // 6. Income last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: transactions } = await supabase
      .from("wallet_transactions")
      .select("amount")
      .in("user_id", memberIds)
      .eq("type", "milestone_release")
      .gte("created_at", ninetyDaysAgo);

    const income90 = (transactions || []).reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

    // 7. Skill gap analysis (compare member skills vs active project requirements)
    const { data: activeProjects } = await supabase
      .from("earning_projects")
      .select("required_skills")
      .eq("status", "open")
      .limit(100);

    const demandCounts: Record<string, number> = {};
    (activeProjects || []).forEach((p: any) => {
      (p.required_skills || []).forEach((s: string) => {
        demandCounts[s] = (demandCounts[s] || 0) + 1;
      });
    });

    const allSkillNames = new Set([...Object.keys(skillCounts), ...Object.keys(demandCounts)]);
    const skillGaps = Array.from(allSkillNames).map((skill) => {
      const supply = skillCounts[skill] || 0;
      const demand = demandCounts[skill] || 0;
      return {
        skill_name: skill,
        demand_index: demand,
        supply_index: supply,
        gap_score: demand > 0 ? Math.round(Math.max(0, (demand - supply) / demand * 100) * 10) / 10 : 0,
      };
    }).sort((a, b) => b.gap_score - a.gap_score);

    // 8. Performance metrics
    const avgSuccessRate = (trustProfiles || []).reduce((sum: number, t: any) => sum + (t.successful_rate || 0), 0) / (totalMembers || 1);
    const avgDisputeRate = (trustProfiles || []).reduce((sum: number, t: any) => sum + (t.dispute_rate || 0), 0) / (totalMembers || 1);
    const avgFinancialReliability = (trustProfiles || []).reduce((sum: number, t: any) => sum + (t.financial_reliability_score || 50), 0) / (totalMembers || 1);

    const performance = {
      collaboration_score: Math.round(Math.min(avgSuccessRate * 1.1, 100) * 10) / 10,
      reliability_score: Math.round(avgFinancialReliability * 10) / 10,
      dispute_ratio: Math.round(avgDisputeRate * 10) / 10,
      economic_velocity: Math.round((income90 / Math.max(totalMembers, 1)) * 10) / 10,
      knowledge_output_score: Math.round(Math.min(completedDeals * 5, 100) * 10) / 10,
    };

    // 9. Forecast
    const growthRate = completedDeals > 0 ? (activeDeals / completedDeals) * 100 : 0;
    const forecast = {
      projected_growth_90_days: Math.round(growthRate * 10) / 10,
      projected_income_90_days: Math.round(income90 * 1.1 * 100) / 100,
      projected_trust_growth: Math.round(Math.min(avgTrustScore * 0.05, 10) * 10) / 10,
      risk_alert_level: avgDisputeRate > 15 ? "high" : avgDisputeRate > 5 ? "medium" : "low",
    };

    // 10. Health Index (0-100 composite)
    const healthIndex = Math.round(
      avgTrustScore * 0.3 +
      avgVisibilityScore * 0.2 +
      performance.collaboration_score * 0.2 +
      performance.reliability_score * 0.15 +
      (100 - performance.dispute_ratio) * 0.15
    );

    // 11. Badge assignment
    const badges: string[] = [];
    if (healthIndex >= 80) badges.push("Top Institution");
    if (avgTrustScore >= 70) badges.push("High Trust Organization");
    if (income90 > 100000) badges.push("Economic Contributor Tier 1");
    else if (income90 > 10000) badges.push("Economic Contributor Tier 2");

    // Store snapshot
    await supabase.from("institutional_talent_snapshots").insert({
      institution_id,
      total_members: totalMembers,
      avg_trust_score: avgTrustScore,
      avg_visibility_score: avgVisibilityScore,
      total_active_deals: activeDeals,
      total_completed_deals: completedDeals,
      avg_deal_health: avgDealHealth,
      skill_distribution: skillCounts,
      income_generated_last_90_days: income90,
    });

    // Store skill gaps
    if (skillGaps.length > 0) {
      const gapRows = skillGaps.slice(0, 20).map((g) => ({
        institution_id,
        skill_name: g.skill_name,
        demand_index: g.demand_index,
        supply_index: g.supply_index,
        gap_score: g.gap_score,
      }));
      await supabase.from("institutional_skill_gaps").insert(gapRows);
    }

    // Store forecast
    await supabase.from("talent_forecasts").insert({
      institution_id,
      ...forecast,
    });

    // Store performance
    await supabase.from("institutional_performance_metrics").insert({
      institution_id,
      ...performance,
    });

    const result = {
      institution_id,
      total_members: totalMembers,
      avg_trust_score: avgTrustScore,
      avg_visibility_score: avgVisibilityScore,
      total_active_deals: activeDeals,
      total_completed_deals: completedDeals,
      avg_deal_health: avgDealHealth,
      skill_distribution: skillCounts,
      income_generated_last_90_days: income90,
      skill_gaps: skillGaps.slice(0, 10),
      forecast,
      performance,
      health_index: healthIndex,
      badges,
      calculated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("compute-institutional-intelligence error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
