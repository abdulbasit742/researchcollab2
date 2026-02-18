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
    const podId = body.pod_id;
    const issueReferenceId = body.issue_reference_id || null;
    const quorumPercent = body.quorum_percent || 60;

    if (!podId) {
      return new Response(JSON.stringify({ error: "pod_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get pod members
    const { data: members } = await supabase
      .from("agp_members")
      .select("user_id, voting_weight")
      .eq("pod_id", podId);

    if (!members || members.length === 0) {
      return new Response(JSON.stringify({ error: "No members in pod" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get votes for this pod + issue
    let votesQuery = supabase.from("agp_votes").select("*").eq("pod_id", podId);
    if (issueReferenceId) votesQuery = votesQuery.eq("issue_reference_id", issueReferenceId);
    const { data: votes } = await votesQuery;

    if (!votes || votes.length === 0) {
      return new Response(JSON.stringify({ error: "No votes cast yet", members: members.length }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check quorum
    const voterIds = new Set(votes.map((v: any) => v.voter_id));
    const participationRate = (voterIds.size / members.length) * 100;

    if (participationRate < quorumPercent) {
      return new Response(JSON.stringify({
        error: "Quorum not met",
        participation: participationRate,
        required: quorumPercent,
        voted: voterIds.size,
        total: members.length,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Compute weighted vote outcome
    const decisionScores: Record<string, number> = {};
    const memberWeights: Record<string, number> = {};
    members.forEach((m: any) => { memberWeights[m.user_id] = Number(m.voting_weight) || 1; });

    votes.forEach((v: any) => {
      const weight = memberWeights[v.voter_id] || 1;
      decisionScores[v.vote_decision] = (decisionScores[v.vote_decision] || 0) + weight;
    });

    // Determine winner
    const sortedDecisions = Object.entries(decisionScores).sort((a, b) => b[1] - a[1]);
    const winningDecision = sortedDecisions[0][0];
    const totalWeight = Object.values(decisionScores).reduce((a, b) => a + b, 0);
    const winningPercent = Math.round((sortedDecisions[0][1] / totalWeight) * 100);

    // Determine if execution required (supermajority > 66%)
    const executionRequired = winningPercent >= 66;

    const decisionSummary = `Decision: ${winningDecision} (${winningPercent}% weighted support, ${voterIds.size}/${members.length} participated)`;

    // Store decision
    const { data: decision, error: decError } = await supabase.from("agp_decisions").insert({
      pod_id: podId,
      issue_reference_id: issueReferenceId,
      decision_summary: decisionSummary,
      execution_required: executionRequired,
    }).select().single();

    if (decError) throw decError;

    // Audit log
    await supabase.from("agp_audit_logs").insert({
      pod_id: podId,
      action_type: "decision_rendered",
      metadata: {
        decision_id: decision.id,
        winning_decision: winningDecision,
        winning_percent: winningPercent,
        participation_rate: participationRate,
        execution_required: executionRequired,
        vote_breakdown: decisionScores,
      },
    });

    return new Response(JSON.stringify({
      decision_id: decision.id,
      winning_decision: winningDecision,
      winning_percent: winningPercent,
      participation_rate: participationRate,
      execution_required: executionRequired,
      vote_breakdown: decisionScores,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
