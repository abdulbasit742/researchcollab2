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

    const { project_id } = await req.json();
    if (!project_id) {
      return new Response(JSON.stringify({ error: "project_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch project requirements
    const { data: project } = await supabase
      .from("earning_projects")
      .select("id, title, skills_required, budget_min, budget_max, created_by")
      .eq("id", project_id)
      .maybeSingle();

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requiredSkills: string[] = project.skills_required ?? [];

    // Fetch candidates with matching skills and visibility scores
    const { data: candidates } = await supabase
      .from("profiles")
      .select("id, full_name, skills, visibility_score")
      .neq("id", project.created_by)
      .limit(50);

    // Fetch trust profiles for candidates
    const candidateIds = (candidates ?? []).map((c: any) => c.id);
    const { data: trustProfiles } = await supabase
      .from("user_trust_profiles")
      .select("user_id, trust_score, dispute_rate")
      .in("user_id", candidateIds);

    const trustMap: Record<string, any> = {};
    (trustProfiles ?? []).forEach((t: any) => { trustMap[t.user_id] = t; });

    // Score candidates
    const scored = (candidates ?? []).map((c: any) => {
      const userSkills: string[] = c.skills ?? [];
      const matchingSkills = requiredSkills.filter(s => userSkills.includes(s));
      const skillMatch = requiredSkills.length > 0 ? matchingSkills.length / requiredSkills.length : 0;
      const trust = trustMap[c.id]?.trust_score ?? 0;
      const disputeRate = trustMap[c.id]?.dispute_rate ?? 0;
      const visibility = c.visibility_score ?? 0;

      return {
        id: c.id,
        name: c.full_name,
        skills: userSkills,
        matchingSkills,
        skillMatch,
        trust,
        disputeRate,
        visibility,
        compositeScore: skillMatch * 40 + (trust / 100) * 30 + (visibility / 100) * 20 + (1 - disputeRate / 100) * 10,
      };
    }).filter(c => c.skillMatch > 0).sort((a, b) => b.compositeScore - a.compositeScore);

    // Generate up to 3 pod configurations
    const pods: any[] = [];
    const podSize = Math.min(3, Math.max(2, requiredSkills.length));

    for (let podIdx = 0; podIdx < 3; podIdx++) {
      const startIdx = podIdx;
      const members = scored.slice(startIdx, startIdx + podSize);
      if (members.length < 2) break;

      const avgTrust = members.reduce((s, m) => s + m.trust, 0) / members.length;
      const skillCoverage = new Set(members.flatMap(m => m.matchingSkills));
      const skillCompleteness = requiredSkills.length > 0 ? skillCoverage.size / requiredSkills.length : 0;
      const avgDisputeRate = members.reduce((s, m) => s + m.disputeRate, 0) / members.length;

      const trustCompatibility = Math.min(100, avgTrust);
      const skillCompletenessScore = Math.round(skillCompleteness * 100);
      const executionProb = Math.round((trustCompatibility * 0.4 + skillCompletenessScore * 0.4 + (100 - avgDisputeRate) * 0.2) * 10) / 10;

      // Insert pod
      const { data: pod } = await supabase
        .from("collaboration_pods")
        .insert({
          project_id,
          pod_score: executionProb,
          trust_compatibility_score: trustCompatibility,
          skill_completeness_score: skillCompletenessScore,
          historical_synergy_score: 50, // Default baseline
          pricing_alignment_score: 70, // Default baseline
          overall_execution_probability: executionProb,
        })
        .select()
        .single();

      if (pod) {
        // Insert members
        const memberInserts = members.map((m, i) => ({
          pod_id: pod.id,
          user_id: m.id,
          assigned_role: m.matchingSkills[0] ?? "contributor",
          role_skill_match_score: m.skillMatch * 100,
          trust_score_snapshot: m.trust,
          availability_status: "available",
        }));
        await supabase.from("pod_members").insert(memberInserts);

        pods.push({
          pod_id: pod.id,
          execution_probability: executionProb,
          trust_compatibility: trustCompatibility,
          skill_completeness: skillCompletenessScore,
          members: members.map(m => ({
            id: m.id,
            name: m.name,
            role: m.matchingSkills[0] ?? "contributor",
            skill_match: Math.round(m.skillMatch * 100),
            trust: m.trust,
          })),
        });
      }
    }

    return new Response(
      JSON.stringify({
        project_id,
        pods_generated: pods.length,
        pods,
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
