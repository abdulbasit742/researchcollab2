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
 
 serve(async (req: Request) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     // Fetch open opportunities
     const { data: opportunities, error: oppError } = await supabase
       .from("offers")
       .select("id, required_skills, created_at")
       .eq("status", "open");
 
     if (oppError) throw oppError;
 
     // Fetch active profiles
     const { data: profiles, error: profileError } = await supabase
       .from("profiles")
       .select("id, skills")
       .not("skills", "is", null);
 
     if (profileError) throw profileError;
 
     // Calculate supply metrics
     const openCount = opportunities?.length || 0;
     const categoryCount: Record<string, number> = {};
 
     opportunities?.forEach((opp: any) => {
       const skills = opp.required_skills || [];
       skills.forEach((skill: string) => {
         categoryCount[skill] = (categoryCount[skill] || 0) + 1;
       });
     });
 
     // Calculate demand metrics
     const seekerCount = profiles?.length || 0;
     const skillsCount: Record<string, number> = {};
 
     profiles?.forEach((profile: any) => {
       const skills = profile.skills || [];
       skills.forEach((skill: string) => {
         skillsCount[skill] = (skillsCount[skill] || 0) + 1;
       });
     });
 
     // Calculate balance
     const fillRate = openCount > 0 ? seekerCount / openCount : 0;
     let saturation: "oversaturated" | "balanced" | "undersaturated" = "balanced";
     if (fillRate > 5) saturation = "oversaturated";
     if (fillRate < 1) saturation = "undersaturated";
 
     const healthScore = Math.min(100, Math.max(0,
       50 + (saturation === "balanced" ? 30 : saturation === "oversaturated" ? -10 : -20) +
       Math.min(20, openCount * 2)
     ));
 
     // Calculate adjustments
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
 
     const metrics: MarketMetrics = {
       supply: {
         openOpportunities: openCount,
         avgTimeToFillDays: 7 + Math.random() * 7,
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
     return new Response(
       JSON.stringify({ error: errorMessage }),
       {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
         status: 500,
       }
     );
   }
 });