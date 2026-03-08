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

    const systemPrompts: Record<string, string> = {
      analyze_signals: `You are the RCollab Ecosystem Orchestration Engine. Analyze platform events and detect high-value opportunity signals. Return JSON with: signals (array of {signal_type, title, description, confidence_score, priority, target_entity_type}).`,
      recommend_collaborations: `You are the RCollab Collaboration Recommendation Engine. Analyze entities and suggest partnerships between institutions, researchers, and companies. Return JSON with: recommendations (array of {rec_type, entity_a_description, entity_b_description, match_score, reasoning}).`,
      generate_strategic_report: `You are the RCollab Strategic Insight Engine. Generate executive-level reports on ecosystem trends, emerging research domains, funding patterns, and market opportunities. Return JSON with: title, summary, insights (array of strings), recommendations (array of strings).`,
      assess_health: `You are the RCollab Ecosystem Health Monitor. Evaluate platform health metrics and provide assessment. Return JSON with: overall_score (0-100), strengths (array), risks (array), recommendations (array).`,
      orchestrate: `You are the RCollab Ecosystem Orchestrator. Given platform events, determine optimal actions to improve collaboration, growth, and efficiency. Return JSON with: actions (array of {action_type, description, priority, target}).`,
    };

    const systemPrompt = systemPrompts[action] || systemPrompts.orchestrate;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(payload) },
        ],
        tools: [{
          type: "function",
          function: {
            name: "ecosystem_output",
            description: "Structured ecosystem orchestration output",
            parameters: {
              type: "object",
              properties: {
                result: { type: "object", description: "The structured output based on the action type" }
              },
              required: ["result"],
              additionalProperties: false,
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "ecosystem_output" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    let result;
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      result = toolCall ? JSON.parse(toolCall.function.arguments) : { result: data.choices?.[0]?.message?.content };
    } catch {
      result = { result: data.choices?.[0]?.message?.content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("eco-orchestrator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
