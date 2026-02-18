import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Fetch trust score
    const { data: trustProfile } = await supabase
      .from("user_trust_profiles")
      .select("trust_score, trust_tier, is_verified_student, is_verified_researcher, is_verified_partner, total_projects_completed, successful_rate")
      .eq("user_id", userId)
      .maybeSingle();

    // Fetch visibility score
    const { data: visData } = await supabase
      .from("visibility_scores")
      .select("visibility_score, breakdown")
      .eq("user_id", userId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch deal summary
    const { data: deals } = await supabase
      .from("deal_rooms")
      .select("status, agreed_amount")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    const totalDeals = deals?.length ?? 0;
    const completedDeals = deals?.filter((d: any) => d.status === "completed").length ?? 0;
    const totalValue = deals?.reduce((s: number, d: any) => s + (d.agreed_amount ?? 0), 0) ?? 0;

    // Fetch institutional affiliations
    const { data: orgs } = await supabase
      .from("organization_members")
      .select("org_id, role, organizations(name, org_type)")
      .eq("user_id", userId);

    const affiliations = (orgs ?? []).map((o: any) => ({
      name: o.organizations?.name ?? "Unknown",
      type: o.organizations?.org_type ?? "organization",
      role: o.role,
    }));

    // Fetch profile for capabilities
    const { data: profile } = await supabase
      .from("profiles")
      .select("skills, full_name")
      .eq("id", userId)
      .maybeSingle();

    const capabilitySummary = {
      skills: profile?.skills ?? [],
      trust_tier: trustProfile?.trust_tier ?? "bronze",
      verified_student: trustProfile?.is_verified_student ?? false,
      verified_researcher: trustProfile?.is_verified_researcher ?? false,
      verified_partner: trustProfile?.is_verified_partner ?? false,
      projects_completed: trustProfile?.total_projects_completed ?? 0,
      success_rate: trustProfile?.successful_rate ?? 0,
    };

    const outcomeSummary = {
      total_deals: totalDeals,
      completed_deals: completedDeals,
      success_rate: totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0,
      total_value: totalValue,
    };

    const dealSummary = {
      active: deals?.filter((d: any) => d.status === "active").length ?? 0,
      completed: completedDeals,
      total: totalDeals,
    };

    // Get next version
    const { count: versionCount } = await supabase
      .from("reputation_passports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const nextVersion = (versionCount ?? 0) + 1;
    const trustScore = trustProfile?.trust_score ?? 0;
    const visibilityScore = visData?.visibility_score ?? 0;

    // Create signed hash
    const passportPayload = JSON.stringify({
      user_id: userId,
      version: nextVersion,
      trust_score: trustScore,
      visibility_score: visibilityScore,
      capabilities: capabilitySummary,
      outcomes: outcomeSummary,
      issued_at: new Date().toISOString(),
    });

    const signedHash = await sha256(passportPayload);

    // Store passport
    const { data: passport, error: insertError } = await supabase
      .from("reputation_passports")
      .insert({
        user_id: userId,
        passport_version: nextVersion,
        trust_score_snapshot: trustScore,
        visibility_score_snapshot: visibilityScore,
        capability_summary: capabilitySummary,
        outcome_summary: outcomeSummary,
        deal_summary: dealSummary,
        institutional_affiliations: affiliations,
        signed_hash: signedHash,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        passport_id: passport.id,
        version: nextVersion,
        trust_score: trustScore,
        visibility_score: visibilityScore,
        capability_summary: capabilitySummary,
        outcome_summary: outcomeSummary,
        institutional_affiliations: affiliations,
        signed_hash: signedHash,
        issued_at: passport.issued_at,
        expires_at: passport.expires_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
