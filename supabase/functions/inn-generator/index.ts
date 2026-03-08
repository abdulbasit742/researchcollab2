import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompts: Record<string, string> = {
      generate_innovation: `You are the RCollab Innovation Generator. Given the platform context (execution economy, escrow-backed milestones, trust engine, institutional coordination), generate a novel platform capability proposal. Return JSON: { title, category, overview, core_components (array of {name, description}), architecture_design: {pattern, services, data_flow}, data_model: {tables: [{name, fields}]}, integration_points (array of strings), revenue_model: {streams: [{source, model, estimate}]}, expected_impact: {users, institutions, revenue_12m}, innovation_score (0-100), revenue_potential, complexity (low/medium/high) }`,
      evaluate_proposal: `You are the RCollab Innovation Evaluator. Assess the feasibility, market fit, and strategic value of a platform proposal. Return JSON: { feasibility_score (0-100), market_fit_score (0-100), strategic_alignment (0-100), risks (array of strings), recommendations (array of strings), projected_timeline, overall_verdict }`,
      generate_roadmap: `You are the RCollab Expansion Planner. Create a phased implementation roadmap for innovations. Return JSON: { phases: [{ phase, title, description, items: [{title, estimated_effort, priority, dependencies}], target_quarter }] }`,
      project_impact: `You are the RCollab Impact Modeler. Project the financial and growth impact of innovations over multiple time horizons. Return JSON: { projections: [{ time_horizon, projected_revenue, projected_users, projected_institutions, confidence_score, assumptions, risks }] }`,
    };

    const systemPrompt = prompts[action] || prompts.generate_innovation;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(payload) },
        ],
        tools: [{
          type: "function",
          function: {
            name: "innovation_output",
            description: "Structured innovation output",
            parameters: { type: "object", properties: { result: { type: "object" } }, required: ["result"], additionalProperties: false }
          }
        }],
        tool_choice: { type: "function", function: { name: "innovation_output" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let result;
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      result = toolCall ? JSON.parse(toolCall.function.arguments) : { result: data.choices?.[0]?.message?.content };
    } catch { result = { result: data.choices?.[0]?.message?.content }; }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("inn-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
