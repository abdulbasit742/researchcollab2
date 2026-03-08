import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { problem_id } = await req.json();
    if (!problem_id) throw new Error("problem_id required");

    const { data: problem, error: pErr } = await supabase
      .from("gpe_problem_registry")
      .select("*")
      .eq("id", problem_id)
      .single();
    if (pErr || !problem) throw new Error("Problem not found");

    // Fetch platform context: top profiles, institutions
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, role, institution_id, skills, trust_score")
      .order("trust_score", { ascending: false })
      .limit(50);

    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name, type, country")
      .limit(30);

    const prompt = `Match this research problem to the best execution candidates.

Problem: ${problem.problem_title}
Category: ${problem.category}
Required Capabilities: ${(problem.required_capabilities || []).join(", ")}
Domain: ${(problem.domain_tags || []).join(", ")}
Budget: ${problem.budget_range_min}-${problem.budget_range_max}
Geographic Scope: ${problem.geographic_scope}

Available Researchers (top by trust): ${JSON.stringify((profiles || []).slice(0, 20).map(p => ({ id: p.id, name: p.display_name, role: p.role, skills: p.skills, trust: p.trust_score })))}

Available Institutions: ${JSON.stringify((orgs || []).slice(0, 15).map(o => ({ id: o.id, name: o.name, type: o.type, country: o.country })))}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an AI matching engine for research execution. Match problems to the best candidates." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "match_problem",
            description: "Return best-fit matches for a research problem",
            parameters: {
              type: "object",
              properties: {
                matched_institutions: { type: "array", items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, confidence: { type: "number" }, reason: { type: "string" } } } },
                matched_researchers: { type: "array", items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, confidence: { type: "number" }, role_suggestion: { type: "string" }, reason: { type: "string" } } } },
                team_suggestions: { type: "array", items: { type: "string" } },
                missing_roles: { type: "array", items: { type: "string" } },
                risk_notes: { type: "array", items: { type: "string" } },
                overall_confidence: { type: "number" },
              },
              required: ["matched_institutions", "matched_researchers", "overall_confidence"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "match_problem" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const matches = toolCall ? JSON.parse(toolCall.function.arguments) : null;
    if (!matches) throw new Error("AI did not return matches");

    const { data: matchRun, error: mErr } = await supabase.from("gpe_ai_matching_runs").insert({
      problem_id,
      matched_institutions: matches.matched_institutions || [],
      matched_researchers: matches.matched_researchers || [],
      confidence_scores: { overall: matches.overall_confidence },
      match_explanations: [...(matches.matched_institutions || []), ...(matches.matched_researchers || [])].map((m: any) => m.reason).filter(Boolean),
      risk_notes: matches.risk_notes || [],
      team_composition_suggestions: matches.team_suggestions || [],
      missing_role_suggestions: matches.missing_roles || [],
      model_used: "google/gemini-3-flash-preview",
    }).select().single();
    if (mErr) throw mErr;

    await supabase.from("gpe_audit_events").insert({
      event_name: "problem_matched",
      entity_type: "problem",
      entity_id: problem_id,
      metadata: { match_run_id: matchRun.id },
    });

    return new Response(JSON.stringify({ success: true, matches: matchRun }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gpe-ai-matching error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
