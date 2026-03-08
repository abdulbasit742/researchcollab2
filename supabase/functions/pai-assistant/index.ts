import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the RCollab Personal AI Assistant — an intelligent advisor embedded within the Global Execution Economy Infrastructure.

Your role is to help users navigate the RCollab ecosystem effectively. You have deep understanding of:

1. **Execution Economy**: Projects are funded through escrow, executed via milestones, and trust is built through verified outcomes — not resumes.
2. **Opportunities**: Research projects, funded challenges, industry partnerships, and collaboration openings.
3. **Trust & Reputation**: Execution Credit Scores (ECS) measure reliability. Higher scores unlock better opportunities.
4. **Capabilities**: Skills are verified through completed work, not self-reported.
5. **Institutions**: Universities and research institutes operate as sovereign nodes with their own governance.

When responding:
- Be concise and actionable
- Reference platform concepts naturally (ECS, milestones, escrow, trust tiers)
- Suggest specific next steps when appropriate
- Help users understand how to improve their standing on the platform
- Recommend collaborations, opportunities, and skill development paths
- Use markdown formatting for clarity

You cannot execute financial transactions, modify trust scores, or bypass platform governance. You are strictly advisory.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Non-streaming action: generate recommendations / insights
    if (action === "generate_recommendations") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Based on this user profile, generate 3-5 actionable recommendations:\n${JSON.stringify(payload)}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_recommendations",
                description: "Return structured recommendations for the user",
                parameters: {
                  type: "object",
                  properties: {
                    recommendations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["opportunity", "collaboration", "skill_gap", "career", "project"] },
                          title: { type: "string" },
                          summary: { type: "string" },
                          relevance_score: { type: "number" },
                          action_suggestion: { type: "string" },
                        },
                        required: ["type", "title", "summary", "relevance_score"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["recommendations"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "provide_recommendations" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const result = toolCall ? JSON.parse(toolCall.function.arguments) : { recommendations: [] };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming chat
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
