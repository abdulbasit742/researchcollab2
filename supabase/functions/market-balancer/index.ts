import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MarketMetrics {
  supply: {
    openOpportunities: number;
    avgTimeToFillDays: number;
    byCategory: Record<string, number>;
  };
  demand: {
    activeSeekers: number;
    bySkill: Record<string, number>;
  };
  balance: {
    fillRate: number;
    saturation: "oversaturated" | "balanced" | "undersaturated";
    healthScore: number;
  };
  adjustments: {
    matchingThreshold: number;
    visibilityMultiplier: number;
    notificationFrequency: number;
  };
}

interface ErrorResponse {
  error_code: string;
  error: string;
  missing?: string;
  action?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // =========================================================================
    // PRECONDITION CHECKS
    // =========================================================================
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      const error: ErrorResponse = {
        error_code: "MISSING_ENV",
        error: "Required environment variables not configured",
        missing: !supabaseUrl ? "SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY",
        action: "Ensure Lovable Cloud is properly connected",
      };
      return new Response(JSON.stringify(error), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // JWT Authentication - Admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!supabaseUrl || !supabaseKey) {
      const error: ErrorResponse = {
        error_code: "MISSING_ENV",
        error: "Required environment variables not configured",
        missing: !supabaseUrl ? "SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY",
        action: "Ensure Lovable Cloud is properly connected",
      };
      return new Response(JSON.stringify(error), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: claimsData.claims.sub });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // FETCH SUPPLY DATA (Open Opportunities)
    // =========================================================================
    
    const { data: opportunities, error: oppError } = await supabase
      .from("offers")
      .select("id, required_skills, created_at")
      .eq("status", "open");

    if (oppError) {
      // Check for specific column errors
      if (oppError.message?.includes("required_skills")) {
        const error: ErrorResponse = {
          error_code: "MISSING_COLUMN",
          error: "Column 'required_skills' does not exist on 'offers' table",
          missing: "offers.required_skills",
          action: "Run migration to add required_skills column: ALTER TABLE public.offers ADD COLUMN required_skills text[] DEFAULT '{}'",
        };
        return new Response(JSON.stringify(error), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      throw oppError;
    }

    // =========================================================================
    // FETCH DEMAND DATA (Active Profiles with Skills)
    // =========================================================================
    
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, skills")
      .not("skills", "is", null);

    if (profileError) {
      if (profileError.message?.includes("skills")) {
        const error: ErrorResponse = {
          error_code: "MISSING_COLUMN",
          error: "Column 'skills' does not exist on 'profiles' table",
          missing: "profiles.skills",
          action: "Run migration to add skills column",
        };
        return new Response(JSON.stringify(error), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      throw profileError;
    }

    // =========================================================================
    // CALCULATE SUPPLY METRICS
    // =========================================================================
    
    const openCount = opportunities?.length || 0;
    const categoryCount: Record<string, number> = {};

    opportunities?.forEach((opp: { required_skills?: string[] | null }) => {
      const skills = opp.required_skills || [];
      skills.forEach((skill: string) => {
        categoryCount[skill] = (categoryCount[skill] || 0) + 1;
      });
    });

    // =========================================================================
    // CALCULATE DEMAND METRICS
    // =========================================================================
    
    const seekerCount = profiles?.length || 0;
    const skillsCount: Record<string, number> = {};

    profiles?.forEach((profile: { skills?: string[] | null }) => {
      const skills = profile.skills || [];
      skills.forEach((skill: string) => {
        skillsCount[skill] = (skillsCount[skill] || 0) + 1;
      });
    });

    // =========================================================================
    // CALCULATE BALANCE & HEALTH SCORE
    // =========================================================================
    
    const fillRate = openCount > 0 ? seekerCount / openCount : 0;
    let saturation: "oversaturated" | "balanced" | "undersaturated" = "balanced";
    if (fillRate > 5) saturation = "oversaturated";
    if (fillRate < 1) saturation = "undersaturated";

    const healthScore = Math.min(100, Math.max(0,
      50 + (saturation === "balanced" ? 30 : saturation === "oversaturated" ? -10 : -20) +
      Math.min(20, openCount * 2)
    ));

    // =========================================================================
    // CALCULATE ADJUSTMENTS
    // =========================================================================
    
    let matchingThreshold = 1.0;
    let visibilityMultiplier = 1.0;
    let notificationFrequency = 1.0;

    if (saturation === "oversaturated") {
      matchingThreshold = 1.15;
      notificationFrequency = 0.7;
    } else if (saturation === "undersaturated") {
      matchingThreshold = 0.85;
      visibilityMultiplier = 1.25;
    }

    // =========================================================================
    // BUILD RESPONSE
    // =========================================================================
    
    const metrics: MarketMetrics = {
      supply: {
        openOpportunities: openCount,
        avgTimeToFillDays: 7 + Math.random() * 7, // TODO: Calculate from actual data
        byCategory: categoryCount,
      },
      demand: {
        activeSeekers: seekerCount,
        bySkill: skillsCount,
      },
      balance: {
        fillRate,
        saturation,
        healthScore,
      },
      adjustments: {
        matchingThreshold,
        visibilityMultiplier,
        notificationFrequency,
      },
    };

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Market balancer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    const errorResponse: ErrorResponse = {
      error_code: "INTERNAL_ERROR",
      error: errorMessage,
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
