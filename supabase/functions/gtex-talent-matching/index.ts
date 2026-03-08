import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { opportunity, candidates } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a talent matching engine for a research execution platform. Match candidates to this opportunity based on execution history, not resumes.

Opportunity:
- Title: ${opportunity.title}
- Description: ${opportunity.description || "N/A"}
- Domain: ${opportunity.domain || "N/A"}
- Required Skills: ${JSON.stringify(opportunity.required_skills || [])}
- Min Trust Score: ${opportunity.min_trust_score || 0}

Candidates (${candidates.length}):
${candidates.map((c: any, i: number) => `${i + 1}. ${c.display_name} | Domain: ${(c.domain_expertise || []).join(", ")} | Skills: ${(c.skills || []).join(", ")} | Trust: ${c.trust_score_snapshot} | Projects: ${c.total_projects_completed} | Reliability: ${c.execution_reliability}%`).join("\n")}

Rank the top candidates and explain why each is a strong match.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an execution-based talent matching engine. Prioritize verified outcomes over credentials." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "rank_candidates",
            description: "Return ranked candidate matches for the opportunity",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      candidate_index: { type: "integer" },
                      confidence_score: { type: "number", description: "0-100" },
                      match_reasons: { type: "array", items: { type: "string" } },
                      risk_factors: { type: "array", items: { type: "string" } },
                    },
                    required: ["candidate_index", "confidence_score", "match_reasons"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["matches"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "rank_candidates" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let matches = { matches: [] };
    if (toolCall?.function?.arguments) {
      matches = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(matches), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gtex-talent-matching error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
