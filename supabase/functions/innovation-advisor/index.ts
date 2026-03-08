import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { domain, category, platform_context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an Innovation Architect for RCollab, a Global Execution Economy Infrastructure platform.

Your job is to generate a structured innovation proposal for a new platform extension.

The platform already has these systems: Trust Engine, Escrow Engine, Milestone Lifecycle, Research Hub, Knowledge Graph, Talent Discovery, Dataset Marketplace, Research Capital Market, Industry Partnerships, Mentorship Economy, Venture Studio, Proof of Execution, and more.

Generate a NOVEL system that does NOT duplicate existing functionality.

Return a JSON response using the provided tool.`;

    const userPrompt = `Generate an innovation proposal for domain: "${domain || "general"}", category: "${category || "any"}".
${platform_context ? `Additional context: ${platform_context}` : ""}

The proposal should be novel, revenue-generating, and integrate with existing execution infrastructure without modifying it.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_innovation_proposal",
              description: "Generate a structured innovation proposal for RCollab.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Concise name for the innovation" },
                  summary: { type: "string", description: "2-3 sentence overview" },
                  core_components: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["name", "description"],
                      additionalProperties: false,
                    },
                    description: "3-5 core architectural components",
                  },
                  revenue_model: { type: "string", description: "How this generates platform revenue" },
                  estimated_impact: { type: "string", description: "Expected impact on platform growth" },
                  integration_points: {
                    type: "array",
                    items: { type: "string" },
                    description: "Which existing RCollab systems this integrates with",
                  },
                },
                required: ["title", "summary", "core_components", "revenue_model", "estimated_impact", "integration_points"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_innovation_proposal" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const proposal = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ proposal }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("innovation-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
