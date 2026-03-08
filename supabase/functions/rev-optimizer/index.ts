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
      detect_signals: `You are the RCollab Revenue Signal Engine. Analyze platform activity data and detect revenue opportunities: high-demand domains, frequent sponsor requests, popular datasets, high-performing talent. Return JSON: { signals: [{ signal_type, title, description, revenue_potential, confidence_score, priority }] }`,
      find_sponsors: `You are the RCollab Sponsor Discovery Agent. Based on research trends, dataset demand, and technology gaps, identify potential sponsor companies. Return JSON: { leads: [{ company_name, industry, match_reason, match_score, target_domains, estimated_budget }] }`,
      detect_premium: `You are the RCollab Premium Feature Detector. Identify users or institutions that would benefit from premium upgrades based on engagement patterns. Return JSON: { candidates: [{ entity_type, entity_name, current_tier, recommended_tier, upgrade_reason, engagement_score, estimated_revenue }] }`,
      forecast: `You are the RCollab Revenue Forecaster. Based on current metrics, project future revenue across streams. Return JSON: { forecasts: [{ forecast_period, forecast_type, projected_revenue, projected_growth_rate, assumptions }] }`,
      generate_alerts: `You are the RCollab Revenue Alert System. Detect actionable revenue opportunities requiring immediate attention. Return JSON: { alerts: [{ alert_type, title, description, severity, revenue_impact }] }`,
    };

    const systemPrompt = prompts[action] || prompts.detect_signals;

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
            name: "revenue_output",
            description: "Structured revenue optimization output",
            parameters: {
              type: "object",
              properties: { result: { type: "object" } },
              required: ["result"],
              additionalProperties: false,
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "revenue_output" } },
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
    } catch {
      result = { result: data.choices?.[0]?.message?.content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rev-optimizer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
