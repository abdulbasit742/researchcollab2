import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { agentType, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Log agent run
    const { data: run } = await supabase.from("aian_agent_runs")
      .insert({ agent_type: agentType, status: "running" }).select().single();

    const agentPrompts: Record<string, string> = {
      opportunity_discovery: `Analyze this platform activity data and identify potential collaboration opportunities, research partnerships, commercialization signals, and startup candidates. Return structured insights.`,
      talent_matching: `Analyze execution histories and capability data to recommend talent matches for active projects, research teams, and ventures. Return specific match recommendations with confidence scores.`,
      growth: `Analyze user behavior patterns and suggest specific actions to increase platform engagement and growth. Identify users who should post projects, institutions that should explore opportunities, and potential collaborations.`,
      sponsor_discovery: `Analyze research domains and activity to identify potential sponsor organizations (companies, governments, foundations) that may fund research in active domains. Generate sponsor lead suggestions.`,
      market_intelligence: `Analyze trends across research domains, funding flows, and institution participation. Generate strategic insights about emerging opportunities and market movements.`,
      knowledge_synthesis: `Analyze recent research outputs and generate knowledge summaries, domain insights, and trend reports. Identify emerging patterns and cross-disciplinary connections.`,
      operator_assistant: `Summarize recent platform activity, detect anomalies or concerns, and suggest operational actions for platform administrators.`,
    };

    const systemPrompt = agentPrompts[agentType] || agentPrompts.opportunity_discovery;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are an autonomous AI agent for a global research execution platform. ${systemPrompt} All recommendations are advisory only — never mutate financial or trust systems.` },
          { role: "user", content: `Platform context:\n${JSON.stringify(context || {})}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_insights",
            description: "Return structured AI insights and recommendations",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      insight_type: { type: "string", enum: ["opportunity", "collaboration", "talent_match", "growth_action", "sponsor_lead", "market_trend", "knowledge_summary", "anomaly", "recommendation"] },
                      title: { type: "string" },
                      summary: { type: "string" },
                      confidence_score: { type: "number", description: "0-100" },
                      priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      action_suggested: { type: "string" },
                    },
                    required: ["insight_type", "title", "summary", "confidence_score", "priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["insights"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let parsed = { insights: [] as any[] };
    if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
    }

    // Store insights
    if (parsed.insights.length > 0) {
      const insightRows = parsed.insights.map((i: any) => ({
        agent_type: agentType,
        agent_run_id: run?.id,
        insight_type: i.insight_type,
        title: i.title,
        summary: i.summary,
        confidence_score: i.confidence_score,
        priority: i.priority,
        action_suggested: i.action_suggested,
      }));
      await supabase.from("aian_insights").insert(insightRows);
    }

    // Update run
    if (run?.id) {
      await supabase.from("aian_agent_runs").update({
        status: "completed",
        insights_generated: parsed.insights.length,
        completed_at: new Date().toISOString(),
      }).eq("id", run.id);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("aian-orchestrator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
