import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CareerCopilotRequest {
  type: "ask" | "trust-analysis" | "opportunity-advice" | "failure-recovery" | "weekly-insights";
  user_id: string; // Will be overridden by JWT
  question?: string;
  opportunity_id?: string;
  project_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const request: CareerCopilotRequest = await req.json();
    // Override user_id with authenticated user - prevent impersonation
    request.user_id = userId;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch user context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: trustProfile } = await supabase
      .from("user_trust_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: ledger } = await supabase
      .from("consequence_ledgers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: recentRecords } = await supabase
      .from("accountability_records")
      .select("*")
      .eq("executor_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Build user context string
    const userContext = `
User Profile:
- Name: ${profile?.full_name || "Unknown"}
- University: ${profile?.university || "Not specified"}
- Department: ${profile?.department || "Not specified"}
- Education Level: ${profile?.education_level || "Not specified"}
- Skills/Interests: ${(profile?.interests || []).join(", ") || "None listed"}

Trust Profile:
- Trust Score: ${trustProfile?.trust_score || 0}/100
- Trust Tier: ${(trustProfile?.trust_score || 0) >= 80 ? "Platinum" : (trustProfile?.trust_score || 0) >= 60 ? "Gold" : (trustProfile?.trust_score || 0) >= 40 ? "Silver" : "Bronze"}
- Verified Student: ${trustProfile?.is_verified_student ? "Yes" : "No"}
- Verified Researcher: ${trustProfile?.is_verified_researcher ? "Yes" : "No"}

Work History (Consequence Ledger):
- Projects Completed: ${ledger?.projects_completed || 0}
- Projects Failed: ${ledger?.projects_failed || 0}
- Completion Rate: ${ledger?.completion_rate || 0}%
- On-Time Rate: ${ledger?.on_time_rate || 0}%
- Total Earned: PKR ${ledger?.total_escrow_released?.toLocaleString() || 0}
- Disputes Won: ${ledger?.disputes_won || 0}
- Disputes Lost: ${ledger?.disputes_lost || 0}
- Trust Trajectory: ${ledger?.trust_trajectory || "Unknown"}

Recent Projects:
${(recentRecords || []).map((r: any) => `- ${r.outcome_status}: ${r.promised_deliverables?.slice(0, 2).join(", ") || "Unknown deliverables"}`).join("\n") || "No recent projects"}
`;

    let systemPrompt = "";
    let userPrompt = "";

    switch (request.type) {
      case "ask":
        systemPrompt = `You are a professional career advisor for RCollab, a trust-based professional platform. 
You have full access to the user's work history, trust profile, and platform data.
Your role is to provide honest, actionable career guidance based on their ACTUAL work record.
Never be generic. Reference specific data from their profile.
Focus on helping them build trust, find better opportunities, and recover from setbacks.
Be encouraging but honest about weaknesses.
Respond with JSON only.`;

        userPrompt = `${userContext}

User's Question: "${request.question}"

Provide a JSON response with:
{
  "question": "the user's question",
  "answer": "Your detailed, personalized advice (2-3 paragraphs)",
  "insights": [
    {
      "type": "opportunity" | "trust" | "skill" | "risk" | "growth",
      "title": "Short insight title",
      "description": "Explanation",
      "priority": "high" | "medium" | "low",
      "action": { "label": "CTA text", "href": "/path" } // optional
    }
  ],
  "nextSteps": ["Step 1", "Step 2", "Step 3"],
  "confidenceLevel": "high" | "medium" | "low"
}`;
        break;

      case "trust-analysis":
        systemPrompt = `You are a trust score analyst for RCollab.
Analyze the user's trust trajectory and provide specific, actionable recommendations.
Be precise about what's blocking them and how to improve.
Respond with JSON only.`;

        userPrompt = `${userContext}

Analyze this user's trust profile and provide a JSON response with:
{
  "current_score": ${trustProfile?.trust_score || 0},
  "trajectory": "improving" | "stable" | "declining",
  "blockers": ["Specific blocker 1", "Specific blocker 2"],
  "accelerators": ["What they're doing right 1", "What they're doing right 2"],
  "timeline_to_next_tier": "Estimated time to reach next tier with recommended actions"
}`;
        break;

      case "opportunity-advice":
        // Fetch opportunity details
        let opportunityContext = "";
        if (request.opportunity_id) {
          const { data: opportunity } = await supabase
            .from("earning_projects")
            .select("*")
            .eq("id", request.opportunity_id)
            .single();

          if (opportunity) {
            opportunityContext = `
Opportunity Details:
- Title: ${opportunity.title}
- Description: ${opportunity.description}
- Budget: PKR ${opportunity.budget_min} - ${opportunity.budget_max}
- Deadline: ${opportunity.deadline_days} days
- Tags: ${(opportunity.tags || []).join(", ")}
`;
          }
        }

        systemPrompt = `You are an opportunity matching advisor for RCollab.
Analyze whether this opportunity is a good fit for the user based on their skills, trust level, and work history.
Be honest about risks and provide a realistic bid recommendation.
Respond with JSON only.`;

        userPrompt = `${userContext}
${opportunityContext}

Provide a JSON response with:
{
  "id": "${request.opportunity_id}",
  "title": "Opportunity title",
  "match_confidence": <1-100>,
  "match_reasons": ["Why this is a good match"],
  "risk_factors": ["Potential risks for this user"],
  "recommended_bid_range": { "min": <number>, "max": <number> }
}`;
        break;

      case "failure-recovery":
        systemPrompt = `You are a failure analysis and recovery advisor for RCollab.
When projects fail, you help users understand why and create a concrete recovery plan.
Be empathetic but honest. Focus on learning and rebuilding trust.
Respond with JSON only.`;

        userPrompt = `${userContext}

The user has experienced project failures. Analyze their situation and provide a JSON response with:
{
  "analysis": "Detailed analysis of what went wrong based on their record",
  "root_causes": ["Likely cause 1", "Likely cause 2"],
  "recovery_steps": ["Specific step 1", "Specific step 2", "Specific step 3"],
  "timeline": "How long recovery might take",
  "trust_recovery_estimate": <estimated trust points they can recover>
}`;
        break;

      case "weekly-insights":
        systemPrompt = `You are a career progress advisor for RCollab.
Provide weekly insights and recommendations based on the user's recent activity and platform trends.
Focus on actionable opportunities and skill development.
Respond with JSON only.`;

        userPrompt = `${userContext}

Generate weekly insights for this user. Provide a JSON array of insights:
[
  {
    "type": "opportunity" | "trust" | "skill" | "risk" | "growth",
    "title": "Insight title",
    "description": "Detailed insight",
    "priority": "high" | "medium" | "low",
    "action": { "label": "CTA", "href": "/path" }
  }
]

Generate 3-5 personalized insights based on their profile and work history.`;
        break;

      default:
        throw new Error("Invalid request type");
    }

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
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let parsedContent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      parsedContent = { raw_response: content, parse_error: true };
    }

    return new Response(
      JSON.stringify({
        success: true,
        type: request.type,
        result: parsedContent,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Career Copilot error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
