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

    // Fetch all earning projects with their skills
    const { data: projects } = await supabase
      .from("earning_projects")
      .select("id, skills_required, budget_min, budget_max, status")
      .in("status", ["open", "in_progress"]);

    // Fetch bids
    const { data: bids } = await supabase
      .from("earning_bids")
      .select("id, project_id, bid_amount, status");

    // Fetch completed deals
    const { data: completedDeals } = await supabase
      .from("deal_rooms")
      .select("id, status, agreed_amount, created_at")
      .eq("status", "completed");

    // Aggregate by skill
    const skillMap: Record<string, {
      activeProjects: number;
      activeBids: number;
      totalBidAmount: number;
      totalBudget: number;
      completedDeals: number;
    }> = {};

    (projects ?? []).forEach((p: any) => {
      const skills = p.skills_required ?? [];
      skills.forEach((skill: string) => {
        if (!skillMap[skill]) {
          skillMap[skill] = { activeProjects: 0, activeBids: 0, totalBidAmount: 0, totalBudget: 0, completedDeals: 0 };
        }
        skillMap[skill].activeProjects++;
        skillMap[skill].totalBudget += ((p.budget_min ?? 0) + (p.budget_max ?? 0)) / 2;
      });
    });

    (bids ?? []).forEach((b: any) => {
      // Find which project this bid belongs to and its skills
      const project = (projects ?? []).find((p: any) => p.id === b.project_id);
      if (project) {
        (project.skills_required ?? []).forEach((skill: string) => {
          if (skillMap[skill]) {
            skillMap[skill].activeBids++;
            skillMap[skill].totalBidAmount += b.bid_amount ?? 0;
          }
        });
      }
    });

    // Compute metrics per skill
    const results: any[] = [];
    for (const [skill, data] of Object.entries(skillMap)) {
      const avgBidPrice = data.activeBids > 0 ? data.totalBidAmount / data.activeBids : 0;
      const avgBudget = data.activeProjects > 0 ? data.totalBudget / data.activeProjects : 0;
      const conversionRate = data.activeBids > 0 ? Math.min((data.completedDeals / data.activeBids) * 100, 100) : 0;
      
      // Liquidity = demand/supply ratio * success factor
      const supplyDemandRatio = data.activeBids > 0 ? data.activeProjects / data.activeBids : 0;
      const liquidityScore = Math.min(supplyDemandRatio * 50 + conversionRate * 0.5, 100);

      const metric = {
        skill_name: skill,
        total_active_projects: data.activeProjects,
        total_active_bids: data.activeBids,
        avg_bid_price: Math.round(avgBidPrice),
        avg_project_budget: Math.round(avgBudget),
        deal_conversion_rate: Math.round(conversionRate * 10) / 10,
        trust_weighted_success_rate: Math.round(conversionRate * 0.8 * 10) / 10,
        liquidity_score: Math.round(liquidityScore * 10) / 10,
      };

      results.push(metric);

      // Upsert into skill_market_metrics
      const { data: existing } = await supabase
        .from("skill_market_metrics")
        .select("id")
        .eq("skill_name", skill)
        .maybeSingle();

      if (existing) {
        await supabase.from("skill_market_metrics").update({
          ...metric,
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("skill_market_metrics").insert(metric);
      }
    }

    return new Response(
      JSON.stringify({
        skills_analyzed: results.length,
        metrics: results.sort((a, b) => b.liquidity_score - a.liquidity_score),
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
