import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompts: Record<string, string> = {
      match_facility: `You are the RCollab Scientific Infrastructure Advisor. Given a research need, recommend the best facility or equipment match. Return JSON using the tool provided.`,
      optimize_pricing: `You are the RCollab Infrastructure Pricing Advisor. Analyze market data and suggest optimal pricing for scientific equipment/facilities. Return JSON using the tool provided.`,
      predict_demand: `You are the RCollab Infrastructure Demand Predictor. Forecast demand for scientific resources based on research trends. Return JSON using the tool provided.`,
    };

    const tools: Record<string, any> = {
      match_facility: {
        name: "facility_match",
        description: "Return facility matching results",
        parameters: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  facility_type: { type: "string" },
                  match_score: { type: "number" },
                  rationale: { type: "string" },
                  estimated_cost: { type: "string" },
                  availability_window: { type: "string" },
                },
                required: ["facility_type", "match_score", "rationale"],
                additionalProperties: false,
              },
            },
            summary: { type: "string" },
          },
          required: ["recommendations", "summary"],
          additionalProperties: false,
        },
      },
      optimize_pricing: {
        name: "pricing_suggestion",
        description: "Return pricing optimization suggestions",
        parameters: {
          type: "object",
          properties: {
            suggested_hourly: { type: "number" },
            suggested_daily: { type: "number" },
            market_comparison: { type: "string" },
            demand_level: { type: "string" },
            optimization_tips: { type: "array", items: { type: "string" } },
          },
          required: ["suggested_hourly", "suggested_daily", "market_comparison", "demand_level", "optimization_tips"],
          additionalProperties: false,
        },
      },
      predict_demand: {
        name: "demand_forecast",
        description: "Return demand forecast",
        parameters: {
          type: "object",
          properties: {
            forecast_period: { type: "string" },
            predicted_bookings: { type: "number" },
            trending_categories: { type: "array", items: { type: "string" } },
            peak_months: { type: "array", items: { type: "string" } },
            revenue_estimate: { type: "string" },
          },
          required: ["forecast_period", "predicted_bookings", "trending_categories", "peak_months", "revenue_estimate"],
          additionalProperties: false,
        },
      },
    };

    const systemPrompt = prompts[action] || prompts.match_facility;
    const toolDef = tools[action] || tools.match_facility;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(payload) },
        ],
        tools: [{ type: "function", function: toolDef }],
        tool_choice: { type: "function", function: { name: toolDef.name } },
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
      result = toolCall ? JSON.parse(toolCall.function.arguments) : data.choices?.[0]?.message?.content;
    } catch {
      result = data.choices?.[0]?.message?.content;
    }

    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("sim-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
