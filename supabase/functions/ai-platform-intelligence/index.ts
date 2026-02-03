import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FeasibilityRequest {
  type: "feasibility";
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  deadline_days?: number;
}

interface BidScoreRequest {
  type: "bid-score";
  bid_amount: number;
  bid_message?: string;
  delivery_days: number;
  bidder_trust_score: number;
  bidder_completed_projects: number;
  project_budget_min?: number;
  project_budget_max?: number;
}

interface MatchConfidenceRequest {
  type: "match-confidence";
  project_title: string;
  project_description: string;
  project_tags: string[];
  candidate_interests: string[];
  candidate_department?: string;
  candidate_education_level?: string;
}

interface ProfileStrengthRequest {
  type: "profile-strength";
  full_name?: string;
  university?: string;
  department?: string;
  education_level?: string;
  interests: string[];
  portfolio_count: number;
  verification_status: {
    student: boolean;
    researcher: boolean;
    partner: boolean;
  };
}

interface SuggestedPricingRequest {
  type: "suggested-pricing";
  project_title: string;
  project_description: string;
  project_tags: string[];
  deadline_days?: number;
}

type AIRequest =
  | FeasibilityRequest
  | BidScoreRequest
  | MatchConfidenceRequest
  | ProfileStrengthRequest
  | SuggestedPricingRequest;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: AIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (request.type) {
      case "feasibility":
        systemPrompt = `You are an expert project feasibility analyst for an academic freelance marketplace. 
Analyze project proposals and provide structured feasibility assessments.
Always be constructive and provide actionable suggestions.
Consider: scope clarity, budget appropriateness, timeline realism, skill availability.
Respond ONLY with valid JSON.`;
        
        userPrompt = `Analyze this project for feasibility:
Title: ${request.title}
Description: ${request.description}
Budget: PKR ${request.budget_min || 'Not specified'} - ${request.budget_max || 'Not specified'}
Deadline: ${request.deadline_days ? `${request.deadline_days} days` : 'Not specified'}

Provide a JSON response with:
{
  "feasibility_score": <1-100>,
  "risk_level": "low" | "medium" | "high",
  "risk_factors": ["factor1", "factor2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "explanation": "Brief explanation of the assessment"
}`;
        break;

      case "bid-score":
        systemPrompt = `You are a bid quality evaluator for an academic marketplace.
Score bids based on value proposition, bidder credibility, and alignment with project needs.
This score is used internally for ranking - be objective and fair.
Respond ONLY with valid JSON.`;

        userPrompt = `Score this bid:
Bid Amount: PKR ${request.bid_amount}
Bid Message: ${request.bid_message || 'No message provided'}
Delivery Days: ${request.delivery_days}
Bidder Trust Score: ${request.bidder_trust_score}/100
Bidder Completed Projects: ${request.bidder_completed_projects}
Project Budget Range: PKR ${request.project_budget_min || '?'} - ${request.project_budget_max || '?'}

Provide a JSON response with:
{
  "quality_score": <1-100>,
  "ranking_factors": {
    "value_alignment": <1-10>,
    "bidder_credibility": <1-10>,
    "communication_quality": <1-10>,
    "timeline_realism": <1-10>
  },
  "explanation": "Brief internal note on the scoring"
}`;
        break;

      case "match-confidence":
        systemPrompt = `You are a research matching expert for an academic collaboration platform.
Evaluate how well a candidate matches a project based on skills, interests, and qualifications.
Consider academic alignment, skill overlap, and potential for successful collaboration.
Respond ONLY with valid JSON.`;

        userPrompt = `Evaluate this match:
Project: ${request.project_title}
Description: ${request.project_description}
Project Tags: ${request.project_tags.join(", ")}

Candidate Profile:
- Interests: ${request.candidate_interests.join(", ")}
- Department: ${request.candidate_department || 'Not specified'}
- Education Level: ${request.candidate_education_level || 'Not specified'}

Provide a JSON response with:
{
  "match_score": <1-100>,
  "skill_alignment": <1-100>,
  "skill_gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2"],
  "explanation": "Brief explanation of the match assessment"
}`;
        break;

      case "profile-strength":
        systemPrompt = `You are a career advisor helping users optimize their academic marketplace profiles.
Analyze profile completeness and provide actionable improvement suggestions.
Be encouraging but specific about what needs improvement.
Respond ONLY with valid JSON.`;

        userPrompt = `Analyze this user profile:
Name: ${request.full_name || 'Not provided'}
University: ${request.university || 'Not provided'}
Department: ${request.department || 'Not provided'}
Education Level: ${request.education_level || 'Not provided'}
Interests: ${request.interests.length > 0 ? request.interests.join(", ") : 'None listed'}
Portfolio Projects: ${request.portfolio_count}
Verifications: Student: ${request.verification_status.student}, Researcher: ${request.verification_status.researcher}, Partner: ${request.verification_status.partner}

Provide a JSON response with:
{
  "strength_score": <1-100>,
  "completeness": {
    "basic_info": <1-100>,
    "academic_info": <1-100>,
    "portfolio": <1-100>,
    "verification": <1-100>
  },
  "improvement_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "priority_action": "The single most important thing to improve"
}`;
        break;

      case "suggested-pricing":
        systemPrompt = `You are a pricing analyst for an academic freelance marketplace in Pakistan.
Suggest appropriate pricing based on project scope, complexity, and market rates.
All prices should be in PKR (Pakistani Rupees).
Consider typical rates: Simple tasks 5,000-15,000 PKR, Medium projects 15,000-50,000 PKR, Complex projects 50,000-200,000+ PKR.
Respond ONLY with valid JSON.`;

        userPrompt = `Suggest pricing for this project:
Title: ${request.project_title}
Description: ${request.project_description}
Tags: ${request.project_tags.join(", ")}
Deadline: ${request.deadline_days ? `${request.deadline_days} days` : 'Flexible'}

Provide a JSON response with:
{
  "suggested_min": <number in PKR>,
  "suggested_max": <number in PKR>,
  "market_benchmark": <average market rate in PKR>,
  "pricing_factors": ["factor1", "factor2"],
  "explanation": "Brief explanation of the pricing recommendation"
}`;
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
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from AI
    let parsedContent;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
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
    console.error("AI Platform Intelligence error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
