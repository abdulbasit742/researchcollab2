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

    // Fetch problem
    const { data: problem, error: pErr } = await supabase
      .from("gpe_problem_registry")
      .select("*")
      .eq("id", problem_id)
      .single();
    if (pErr || !problem) throw new Error("Problem not found");

    const prompt = `You are an expert research problem analyst. Analyze this problem statement and return structured scores and recommendations.

Problem Title: ${problem.problem_title}
Summary: ${problem.problem_summary || "N/A"}
Full Brief: ${problem.full_problem_brief || "N/A"}
Category: ${problem.category}
Domain Tags: ${(problem.domain_tags || []).join(", ")}
Budget Range: ${problem.budget_range_min} - ${problem.budget_range_max}
Timeline: ${problem.timeline_expectation || "N/A"}
Urgency: ${problem.urgency_level}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a research problem triage AI. Analyze problems and return structured assessments." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "triage_problem",
            description: "Return structured triage scores for a research problem",
            parameters: {
              type: "object",
              properties: {
                clarity_score: { type: "number", description: "0-100 score for problem clarity" },
                fundability_score: { type: "number", description: "0-100 likelihood of attracting funding" },
                research_intensity_score: { type: "number", description: "0-100 depth of research required" },
                commercialization_potential: { type: "number", description: "0-100 commercial viability" },
                execution_readiness_score: { type: "number", description: "0-100 readiness for execution" },
                risk_tags: { type: "array", items: { type: "string" }, description: "Identified risk factors" },
                capabilities_needed: { type: "array", items: { type: "string" }, description: "Required capabilities" },
                deliverables_suggested: { type: "array", items: { type: "string" }, description: "Suggested deliverables" },
                structured_summary: { type: "string", description: "Clean structured problem summary" },
                recommendations: { type: "array", items: { type: "string" }, description: "Improvement recommendations" },
              },
              required: ["clarity_score", "fundability_score", "research_intensity_score", "commercialization_potential", "execution_readiness_score", "structured_summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "triage_problem" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const triage = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    if (!triage) throw new Error("AI did not return structured triage");

    // Save triage run
    const { data: triageRun, error: tErr } = await supabase.from("gpe_ai_triage_runs").insert({
      problem_id,
      clarity_score: triage.clarity_score,
      fundability_score: triage.fundability_score,
      research_intensity_score: triage.research_intensity_score,
      commercialization_potential: triage.commercialization_potential,
      execution_readiness_score: triage.execution_readiness_score,
      risk_tags: triage.risk_tags || [],
      capability_extraction: triage.capabilities_needed || [],
      deliverable_extraction: triage.deliverables_suggested || [],
      structured_summary: triage.structured_summary,
      recommendations: triage.recommendations || [],
      model_used: "google/gemini-3-flash-preview",
    }).select().single();
    if (tErr) throw tErr;

    // Update problem with AI scores
    await supabase.from("gpe_problem_registry").update({
      ai_triage_score: triage.execution_readiness_score,
      ai_clarity_score: triage.clarity_score,
      ai_fundability_score: triage.fundability_score,
      ai_commercialization_score: triage.commercialization_potential,
      updated_at: new Date().toISOString(),
    }).eq("id", problem_id);

    // Audit event
    await supabase.from("gpe_audit_events").insert({
      event_name: "problem_triaged",
      entity_type: "problem",
      entity_id: problem_id,
      metadata: { triage_run_id: triageRun.id, scores: triage },
    });

    return new Response(JSON.stringify({ success: true, triage: triageRun }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gpe-ai-triage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
