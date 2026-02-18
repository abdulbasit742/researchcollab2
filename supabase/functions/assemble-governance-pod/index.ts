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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: claimsData.claims.sub });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const podType = body.pod_type || "risk";
    const minTrustScore = body.min_trust_score || 40;
    const maxDisputeRate = body.max_dispute_rate || 20;
    const podSize = body.pod_size || 7;

    // Fetch eligible candidates
    const { data: candidates } = await supabase
      .from("user_trust_profiles")
      .select("user_id, trust_score, dispute_rate, total_projects_completed, is_verified_researcher, is_verified_student, is_verified_partner")
      .gte("trust_score", minTrustScore)
      .order("trust_score", { ascending: false })
      .limit(100);

    if (!candidates || candidates.length < 3) {
      return new Response(JSON.stringify({ error: "Insufficient eligible candidates", candidates_found: candidates?.length || 0 }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter by dispute rate
    const eligible = candidates.filter((c: any) => (Number(c.dispute_rate) || 0) < maxDisputeRate);

    // Get institution affiliations for diversity
    const userIds = eligible.map((c: any) => c.user_id);
    const { data: orgMembers } = await supabase
      .from("organization_members")
      .select("user_id, org_id")
      .in("user_id", userIds.slice(0, 50));

    const userInstitutions: Record<string, string> = {};
    (orgMembers || []).forEach((om: any) => { userInstitutions[om.user_id] = om.org_id; });

    // Compute voting weights and enforce institutional diversity
    const institutionCounts: Record<string, number> = {};
    const selectedMembers: any[] = [];

    for (const candidate of eligible) {
      if (selectedMembers.length >= podSize) break;

      const instId = userInstitutions[candidate.user_id] || "independent";
      const currentInstCount = institutionCounts[instId] || 0;

      // Cap institution representation at 30% of pod
      if (currentInstCount >= Math.ceil(podSize * 0.3)) continue;

      const trustScore = Number(candidate.trust_score) || 0;
      const collaborationScore = Math.min((Number(candidate.total_projects_completed) || 0) * 5, 100);
      const instBalance = instId === "independent" ? 0.8 : 1.0;

      const votingWeight = Math.round((trustScore * 0.5 + collaborationScore * 0.3 + instBalance * 20 * 0.2) * 100) / 100;

      selectedMembers.push({
        user_id: candidate.user_id,
        trust_snapshot: trustScore,
        voting_weight: votingWeight,
        institution_id: instId === "independent" ? null : instId,
      });

      institutionCounts[instId] = currentInstCount + 1;
    }

    if (selectedMembers.length < 3) {
      return new Response(JSON.stringify({ error: "Could not form diverse pod", eligible: eligible.length, selected: selectedMembers.length }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the pod
    const { data: pod, error: podError } = await supabase
      .from("agp_pods")
      .insert({ pod_type: podType, formation_method: "trust-weighted", status: "active" })
      .select()
      .single();

    if (podError) throw podError;

    // Insert members
    const memberRows = selectedMembers.map((m) => ({ ...m, pod_id: pod.id }));
    const { error: membersError } = await supabase.from("agp_members").insert(memberRows);
    if (membersError) throw membersError;

    // Log formation
    await supabase.from("agp_audit_logs").insert({
      pod_id: pod.id,
      action_type: "pod_formed",
      metadata: { pod_type: podType, member_count: selectedMembers.length, formation_method: "trust-weighted" },
    });

    return new Response(JSON.stringify({
      pod_id: pod.id,
      pod_type: podType,
      member_count: selectedMembers.length,
      members: selectedMembers,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
