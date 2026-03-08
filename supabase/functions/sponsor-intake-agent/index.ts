import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Sponsor Intake Agent — Converts vague sponsor messages into structured GPE problem records.
 * Uses AI to extract problem structure, domain, expertise needs, budget signals, and timeline.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { raw_input, contact_id, conversation_id, channel_type } = await req.json();

    if (!raw_input) {
      return new Response(JSON.stringify({ error: "raw_input is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!lovableKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI to structure the sponsor's vague problem statement
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a sponsor intake analyst for RCollab, a global research execution platform. 
Your job is to convert vague sponsor messages into structured research problem records.

Extract the following from the sponsor's message:
- problem_title: A clear, concise title for the research problem
- problem_description: A structured 2-3 sentence description
- domain_category: The primary domain (e.g., AI, agriculture, healthcare, energy, climate, cybersecurity, manufacturing, education)
- required_expertise: Array of specific expertise areas needed
- budget_range: Estimated budget range if mentioned (e.g., "$10K-$50K", "enterprise", "unknown")
- timeline: Expected timeline if mentioned (e.g., "3 months", "6 months", "unknown")
- expected_outcomes: What the sponsor likely expects as deliverables
- clarity_score: 0-100 score of how clear the problem statement is
- fundability_score: 0-100 score of how likely this is to attract funding
- ai_confidence: 0-100 your confidence in the extraction accuracy
- follow_up_questions: Array of 2-3 questions to ask the sponsor for clarification`
          },
          { role: "user", content: raw_input }
        ],
        tools: [{
          type: "function",
          function: {
            name: "structure_problem",
            description: "Structure a sponsor's problem statement into a research challenge",
            parameters: {
              type: "object",
              properties: {
                problem_title: { type: "string" },
                problem_description: { type: "string" },
                domain_category: { type: "string" },
                required_expertise: { type: "array", items: { type: "string" } },
                budget_range: { type: "string" },
                timeline: { type: "string" },
                expected_outcomes: { type: "string" },
                clarity_score: { type: "number" },
                fundability_score: { type: "number" },
                ai_confidence: { type: "number" },
                follow_up_questions: { type: "array", items: { type: "string" } },
              },
              required: ["problem_title", "problem_description", "domain_category", "required_expertise", "clarity_score", "fundability_score", "ai_confidence", "follow_up_questions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "structure_problem" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let structured: any = {};

    if (toolCall?.function?.arguments) {
      structured = JSON.parse(toolCall.function.arguments);
    }

    // Save the intake session
    const { data: session, error } = await supabase.from("omni_sponsor_intake_sessions").insert({
      contact_id,
      conversation_id,
      channel_type: channel_type || "webchat",
      raw_input,
      structured_problem: structured,
      problem_title: structured.problem_title,
      domain_category: structured.domain_category,
      required_expertise: structured.required_expertise,
      budget_range: structured.budget_range || "unknown",
      timeline: structured.timeline || "unknown",
      expected_outcomes: structured.expected_outcomes,
      ai_confidence: structured.ai_confidence,
      clarity_score: structured.clarity_score,
      fundability_score: structured.fundability_score,
      intake_status: "captured",
    }).select().single();

    if (error) throw error;

    // Log analytics event
    await supabase.from("omni_analytics_events").insert({
      event_type: "sponsor_intake_captured",
      channel: channel_type || "webchat",
      contact_id,
      conversation_id,
      metadata: {
        session_id: session.id,
        domain: structured.domain_category,
        clarity_score: structured.clarity_score,
        fundability_score: structured.fundability_score,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      session_id: session.id,
      structured_problem: structured,
      follow_up_questions: structured.follow_up_questions,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sponsor-intake-agent error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
