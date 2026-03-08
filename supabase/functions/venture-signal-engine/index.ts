import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { projectTitle, projectDescription, domain, milestoneOutcomes, sponsorDemand, impactMetrics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a research commercialization analyst. Analyze this research project and assess its startup potential.

Project: ${projectTitle}
Description: ${projectDescription || "N/A"}
Domain: ${domain || "N/A"}
Milestone Outcomes: ${JSON.stringify(milestoneOutcomes || [])}
Sponsor Demand Signals: ${JSON.stringify(sponsorDemand || [])}
Impact Metrics: ${JSON.stringify(impactMetrics || {})}

Evaluate and return structured data.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert research commercialization analyst for a global execution economy platform." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "assess_commercialization",
            description: "Return commercialization assessment for a research project",
            parameters: {
              type: "object",
              properties: {
                commercialization_score: { type: "number", description: "0-100 score" },
                technology_readiness_level: { type: "integer", description: "1-9 TRL" },
                market_opportunity: { type: "string", description: "Brief market opportunity description" },
                strengths: { type: "array", items: { type: "string" } },
                risks: { type: "array", items: { type: "string" } },
                recommended_path: { type: "string", enum: ["startup", "licensing", "industry_partnership", "consulting", "product"] },
                suggested_next_steps: { type: "array", items: { type: "string" } },
              },
              required: ["commercialization_score", "technology_readiness_level", "market_opportunity", "recommended_path"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "assess_commercialization" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let assessment = {};
    if (toolCall?.function?.arguments) {
      assessment = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(assessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("venture-signal-engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
