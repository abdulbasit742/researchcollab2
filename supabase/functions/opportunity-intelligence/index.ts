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
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Fetch all needed data in parallel
    const [profileRes, trustRes, ledgerRes, projectsRes, bidsRes, skillsRes, dealsRes] =
      await Promise.all([
        supabase.from("profiles").select("interests, university, location, role").eq("id", userId).maybeSingle(),
        supabase.from("user_trust_profiles").select("trust_score, trust_tier, total_projects_completed, successful_rate, is_verified_student, is_verified_researcher").eq("user_id", userId).maybeSingle(),
        supabase.from("consequence_ledgers").select("completion_rate, escrow_success_rate, projects_completed, total_escrow_released").eq("user_id", userId).maybeSingle(),
        supabase.from("earning_projects").select("id, title, tags, budget_min, budget_max, deadline_days, status").eq("status", "open").order("created_at", { ascending: false }).limit(100),
        supabase.from("earning_bids").select("id, project_id, bid_amount, status").eq("bidder_id", userId).order("created_at", { ascending: false }).limit(50),
        supabase.from("user_skills").select("skill_name, proficiency_level").eq("user_id", userId),
        supabase.from("deal_health_metrics").select("health_score, risk_level").eq("user_id", userId).order("assessed_at", { ascending: false }).limit(10),
      ]);

    const profile = profileRes.data;
    const trust = trustRes.data;
    const ledger = ledgerRes.data;
    const openProjects = projectsRes.data || [];
    const userBids = bidsRes.data || [];
    const userSkills = (skillsRes.data || []).map((s: any) => s.skill_name.toLowerCase());
    const dealHealth = dealsRes.data || [];

    // ── 1. Opportunity Match Score (0–100) ───────────────────────
    const userInterests = (profile?.interests || []).map((i: string) => i.toLowerCase());
    const allUserSkillTokens = [...new Set([...userSkills, ...userInterests])];

    let skillMatchCount = 0;
    const tagDemand: Record<string, number> = {};

    for (const project of openProjects) {
      const tags = (project.tags || []).map((t: string) => t.toLowerCase());
      for (const tag of tags) {
        tagDemand[tag] = (tagDemand[tag] || 0) + 1;
        if (allUserSkillTokens.some((s) => tag.includes(s) || s.includes(tag))) {
          skillMatchCount++;
        }
      }
    }

    const trustScore = trust?.trust_score || 0;
    const completionRate = ledger?.completion_rate || 0;
    const escrowRate = ledger?.escrow_success_rate || 0;
    const verifiedBonus = (trust?.is_verified_student || trust?.is_verified_researcher) ? 10 : 0;

    const matchRaw =
      Math.min(skillMatchCount * 3, 30) +        // skill relevance (max 30)
      Math.min(trustScore * 0.3, 30) +            // trust contribution (max 30)
      Math.min(completionRate * 0.15, 15) +       // delivery track record (max 15)
      Math.min(escrowRate * 0.15, 15) +           // financial reliability (max 15)
      verifiedBonus;                              // verification bonus (max 10)

    const opportunityScore = Math.round(Math.min(matchRaw, 100));

    // ── 2. Projected Income (next 90 days) ───────────────────────
    const completedProjects = ledger?.projects_completed || trust?.total_projects_completed || 0;
    const totalReleased = ledger?.total_escrow_released || 0;

    let avgProjectValue = 0;
    if (completedProjects > 0) {
      avgProjectValue = totalReleased / completedProjects;
    } else {
      // Estimate from market average
      const budgets = openProjects.filter((p: any) => p.budget_min).map((p: any) => ((p.budget_min || 0) + (p.budget_max || 0)) / 2);
      avgProjectValue = budgets.length > 0 ? budgets.reduce((a: number, b: number) => a + b, 0) / budgets.length : 0;
    }

    const matchingProjects = openProjects.filter((p: any) => {
      const tags = (p.tags || []).map((t: string) => t.toLowerCase());
      return tags.some((t: string) => allUserSkillTokens.some((s) => t.includes(s) || s.includes(t)));
    });

    const projectsPerMonth = completedProjects > 0 ? Math.max(completedProjects / 6, 0.5) : 0.5;
    const projectedIncome = Math.round(avgProjectValue * projectsPerMonth * 3 * (opportunityScore / 100));

    // ── 3. Skill Gap Analysis ────────────────────────────────────
    const demandedSkills = Object.entries(tagDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    const skillGaps = demandedSkills
      .filter(([tag]) => !allUserSkillTokens.some((s) => tag.includes(s) || s.includes(tag)))
      .slice(0, 8)
      .map(([skill, demand]) => ({
        skill,
        demand,
        priority: demand >= 5 ? "high" : demand >= 3 ? "medium" : "low",
        potential_projects: openProjects.filter((p: any) =>
          (p.tags || []).some((t: string) => t.toLowerCase().includes(skill))
        ).length,
      }));

    const skillGapIndex = allUserSkillTokens.length > 0
      ? Math.round((skillGaps.length / Math.max(demandedSkills.length, 1)) * 100)
      : 100;

    // ── 4. Trust Growth Potential ────────────────────────────────
    const maxTrust = 100;
    const currentTrust = trustScore;
    const growthRoom = maxTrust - currentTrust;
    const activeDeals = dealHealth.length;
    const avgDealHealth = dealHealth.length > 0
      ? dealHealth.reduce((sum: number, d: any) => sum + (d.health_score || 0), 0) / dealHealth.length
      : 0;

    const trustGrowthPotential = Math.round(
      Math.min(
        growthRoom * 0.5 +
        Math.min(activeDeals * 3, 15) +
        Math.min(avgDealHealth * 0.2, 10) +
        (matchingProjects.length > 3 ? 10 : matchingProjects.length * 3),
        growthRoom
      )
    );

    // ── 5. Market Heat Map ───────────────────────────────────────
    const topCategories = Object.entries(tagDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, demand]) => {
        // Count bids for projects in this category
        const projectIds = openProjects
          .filter((p: any) => (p.tags || []).some((t: string) => t.toLowerCase() === category))
          .map((p: any) => p.id);
        return {
          category,
          demand,
          user_has_skill: allUserSkillTokens.some((s) => category.includes(s) || s.includes(category)),
          competition: "moderate" as string, // Simplified
        };
      });

    // ── 6. Recommended Actions ───────────────────────────────────
    const actions: { action: string; priority: string; impact: string; link: string }[] = [];

    if (trustScore < 40) {
      actions.push({ action: "Complete your profile verification to boost trust", priority: "high", impact: "+10-15 trust points", link: "/verification" });
    }
    if (skillGaps.length > 0) {
      actions.push({ action: `Learn "${skillGaps[0].skill}" — ${skillGaps[0].potential_projects} open projects need it`, priority: "high", impact: `Access ${skillGaps[0].potential_projects} more projects`, link: "/profile" });
    }
    if (matchingProjects.length > 0 && userBids.length < 3) {
      actions.push({ action: `Bid on matching projects (${matchingProjects.length} available)`, priority: "high", impact: `Up to PKR ${Math.round(avgProjectValue).toLocaleString()} per project`, link: "/earn" });
    }
    if (completionRate < 80 && completedProjects > 0) {
      actions.push({ action: "Improve delivery consistency to raise trust score", priority: "medium", impact: "+5-10 trust points", link: "/home" });
    }
    if (skillGaps.length > 3) {
      actions.push({ action: "Diversify your skills to match market demand", priority: "medium", impact: `Unlock ${skillGaps.reduce((s, g) => s + g.potential_projects, 0)} more opportunities`, link: "/profile" });
    }
    if (actions.length === 0) {
      actions.push({ action: "You're well-positioned — keep bidding on relevant projects", priority: "low", impact: "Maintain momentum", link: "/earn" });
    }

    // ── 7. Persist snapshot ──────────────────────────────────────
    const { data: latestSnapshot } = await supabase
      .from("opportunity_insights")
      .select("snapshot_version")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latestSnapshot?.snapshot_version || 0) + 1;

    await supabase.from("opportunity_insights").insert({
      user_id: userId,
      opportunity_score: opportunityScore,
      projected_income: projectedIncome,
      skill_gap_json: { gaps: skillGaps, skill_gap_index: skillGapIndex },
      trust_growth_potential: trustGrowthPotential,
      recommended_actions: actions,
      market_heat_map: { categories: topCategories },
      snapshot_version: nextVersion,
    });

    const result = {
      opportunity_score: opportunityScore,
      projected_income: projectedIncome,
      skill_gap_index: skillGapIndex,
      skill_gaps: skillGaps,
      trust_growth_potential: trustGrowthPotential,
      recommended_actions: actions,
      market_heat_map: topCategories,
      snapshot_version: nextVersion,
      computed_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("OIE Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
