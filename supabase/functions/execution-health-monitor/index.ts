import { createClient } from "https://esm.sh/@supabase/supabase-js@2.88.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Optional: require admin auth for manual triggers
    const authHeader = req.headers.get("Authorization");
    const isScheduled = !authHeader; // Cron jobs won't have auth

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsError } = await supabaseAuth.auth.getClaims(token);
      if (claimsError || !claims?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check admin
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", claims.claims.sub)
        .maybeSingle();

      if (roleData?.role !== "admin") {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const results: Record<string, unknown> = {};

    // Step 1: Run orphaned state detection
    const { data: orphanResult, error: orphanError } = await supabaseAdmin.rpc(
      "detect_orphaned_states"
    );
    results.orphan_detection = orphanError
      ? { error: orphanError.message }
      : orphanResult;

    // Step 2: Auto-release stale milestones
    const { data: releaseCount, error: releaseError } = await supabaseAdmin.rpc(
      "auto_release_stale_milestones"
    );
    results.auto_released_milestones = releaseError
      ? { error: releaseError.message }
      : releaseCount;

    // Step 3: Cleanup expired idempotency keys
    const { data: cleanupCount, error: cleanupError } = await supabaseAdmin.rpc(
      "cleanup_expired_idempotency_keys"
    );
    results.cleaned_idempotency_keys = cleanupError
      ? { error: cleanupError.message }
      : cleanupCount;

    // Step 4: Trust decay (re-run existing)
    const { error: trustError } = await supabaseAdmin.rpc(
      "detect_orphaned_states" // Already includes trust-related checks
    );
    if (trustError) {
      results.trust_check = { error: trustError.message };
    }

    // Determine overall status
    const health = orphanResult?.health || "unknown";
    const hasCritical = health === "critical";

    // If critical issues found, log alert
    if (hasCritical) {
      await supabaseAdmin.from("admin_audit_logs").insert({
        admin_id: "00000000-0000-0000-0000-000000000000", // system
        action: "execution_health_critical",
        entity_type: "system",
        details: {
          ...results,
          triggered_by: isScheduled ? "cron" : "manual",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        health,
        critical: hasCritical,
        results,
        ran_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
