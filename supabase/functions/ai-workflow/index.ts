import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "milestone-plan": `You are an expert project planner for an institutional collaboration platform. Given a milestone goal, generate a structured plan. Return JSON only:
{
  "task_breakdown": [{ "task": string, "estimated_hours": number, "priority": "high"|"medium"|"low" }],
  "estimated_timeline": string,
  "risk_factors": [string],
  "review_points": [string],
  "summary": string
}
Do NOT invent financial amounts, escrow values, or trust scores. Keep suggestions actionable and professional.`,

  "enhance-writing": `You are a professional writing assistant for an institutional platform. Improve the provided text for clarity, professionalism, and conciseness. Return JSON only:
{
  "enhanced_text": string,
  "changes_made": [string],
  "tone": "professional"|"academic"|"friendly"
}
Do NOT invent facts. Only rewrite the provided text. Do NOT add information that wasn't in the original.`,

  "task-suggestions": `You are a task prioritization expert. Given current milestone state and tasks, suggest next actions. Return JSON only:
{
  "suggestions": [{ "action": string, "priority": "high"|"medium"|"low", "reason": string }],
  "deadline_risk": "low"|"medium"|"high",
  "bottleneck": string|null
}
Do NOT suggest financial actions, escrow releases, or trust modifications.`,

  "review-analysis": `You are a submission review assistant. Analyze the submission content and provide feedback guidance. Return JSON only:
{
  "completeness_score": number,
  "missing_components": [string],
  "clarity_issues": [string],
  "suggested_questions": [string],
  "overall_assessment": string
}
Do NOT approve or reject. Advisory only. The reviewer must decide.`,

  "project-insights": `You are a project health analyst. Given project activity data, identify risks and insights. Return JSON only:
{
  "insights": [{ "type": "delay_risk"|"inactivity"|"bottleneck"|"imbalance"|"positive", "message": string, "confidence": number, "severity": "low"|"medium"|"high" }]
}
Do NOT suggest financial actions. Advisory insights only.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { feature, input, context } = await req.json();

    if (!feature || !SYSTEM_PROMPTS[feature]) {
      return new Response(JSON.stringify({ error: "Invalid feature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!input || typeof input !== "string" || input.length > 10000) {
      return new Response(JSON.stringify({ error: "Input too long or missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMessage = context
      ? `Context: ${JSON.stringify(context).slice(0, 3000)}\n\nUser input: ${input}`
      : input;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[feature] },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    const tokensUsed = aiResult.usage?.total_tokens || 0;

    // Log AI usage (fire-and-forget)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    serviceClient.from("ai_workflow_logs").insert({
      user_id: userId,
      context_type: feature,
      feature_used: feature,
      input_summary: input.slice(0, 200),
      output_hash: btoa(content.slice(0, 50)),
      tokens_used: tokensUsed,
    }).then(() => {}).catch(() => {});

    // Parse JSON from AI response
    let parsed;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/({[\s\S]*})/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch {
      parsed = { raw_response: content };
    }

    return new Response(JSON.stringify({
      result: parsed,
      ai_generated: true,
      disclaimer: "AI-generated — verify before applying.",
      tokens_used: tokensUsed,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-workflow error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
