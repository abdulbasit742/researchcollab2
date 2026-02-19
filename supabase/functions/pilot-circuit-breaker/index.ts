import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("is_admin", { uid: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();

    if (action === "check_integrity") {
      // Run reconciliation checks
      const checks = await runIntegrityChecks(supabase);
      
      if (checks.hasCriticalIssue) {
        // AUTO-FREEZE
        await supabase.from("pilot_circuit_breaker").update({
          is_frozen: true,
          frozen_at: new Date().toISOString(),
          frozen_reason: checks.reason,
          frozen_by: "system",
          incident_count: checks.incidentCount,
          last_incident_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).neq("id", "00000000-0000-0000-0000-000000000000"); // update all rows

        // Log incident
        await supabase.from("pilot_incidents").insert({
          incident_type: checks.incidentType,
          severity: "critical",
          description: checks.reason,
          auto_action_taken: "pilot_frozen",
          metadata: checks.details,
        });

        // Log in pilot transaction log
        await supabase.from("pilot_transaction_log").insert({
          actor_id: user.id,
          action_type: "freeze_triggered",
          metadata: { reason: checks.reason, checks: checks.details },
        });
      }

      // Update reconciliation timestamp
      await supabase.from("pilot_circuit_breaker").update({
        last_reconciliation_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).neq("id", "00000000-0000-0000-0000-000000000000");

      return new Response(JSON.stringify({ success: true, checks }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "freeze") {
      const { reason } = await req.json().catch(() => ({ reason: "Manual admin freeze" }));
      await supabase.from("pilot_circuit_breaker").update({
        is_frozen: true,
        frozen_at: new Date().toISOString(),
        frozen_reason: reason,
        frozen_by: user.id,
        updated_at: new Date().toISOString(),
      }).neq("id", "00000000-0000-0000-0000-000000000000");

      return new Response(JSON.stringify({ success: true, frozen: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unfreeze") {
      await supabase.from("pilot_circuit_breaker").update({
        is_frozen: false,
        frozen_at: null,
        frozen_reason: null,
        frozen_by: null,
        updated_at: new Date().toISOString(),
      }).neq("id", "00000000-0000-0000-0000-000000000000");

      return new Response(JSON.stringify({ success: true, frozen: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const { data: breaker } = await supabase
        .from("pilot_circuit_breaker")
        .select("*")
        .limit(1)
        .single();

      const { data: participants } = await supabase
        .from("pilot_participants")
        .select("*")
        .eq("status", "active");

      const { data: recentTxns } = await supabase
        .from("pilot_transaction_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: incidents } = await supabase
        .from("pilot_incidents")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false });

      const { data: metrics } = await supabase
        .from("pilot_execution_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({
        breaker,
        participants: participants || [],
        recentTransactions: recentTxns || [],
        openIncidents: incidents || [],
        metrics: metrics || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function runIntegrityChecks(supabase: any) {
  const issues: string[] = [];
  let hasCriticalIssue = false;
  let incidentType = "other";

  // Check 1: Escrow balance vs locked milestones
  const { data: wallets } = await supabase
    .from("escrow_wallets")
    .select("total_locked, total_released, total_refunded, total_funded");

  if (wallets && wallets.length > 0) {
    for (const w of wallets) {
      const expected = Number(w.total_funded) - Number(w.total_released) - Number(w.total_refunded);
      const actual = Number(w.total_locked);
      if (Math.abs(expected - actual) > 0.01) {
        issues.push(`Escrow discrepancy: expected ${expected}, got ${actual}`);
        hasCriticalIssue = true;
        incidentType = "escrow_discrepancy";
      }
    }
  }

  // Check 2: Duplicate releases (same milestone released twice)
  const { data: dupes } = await supabase
    .from("pilot_transaction_log")
    .select("milestone_id, action_type")
    .in("action_type", ["final_release", "partial_release"]);

  if (dupes) {
    const releaseCounts = new Map<string, number>();
    for (const d of dupes) {
      if (d.milestone_id) {
        releaseCounts.set(d.milestone_id, (releaseCounts.get(d.milestone_id) || 0) + 1);
      }
    }
    for (const [mid, count] of releaseCounts) {
      if (count > 1) {
        issues.push(`Duplicate release detected for milestone ${mid}`);
        hasCriticalIssue = true;
        incidentType = "duplicate_release";
      }
    }
  }

  // Check 3: Negative balances
  const { data: negWallets } = await supabase
    .from("escrow_wallets")
    .select("id, total_locked")
    .lt("total_locked", 0);

  if (negWallets && negWallets.length > 0) {
    issues.push(`${negWallets.length} wallets with negative locked balance`);
    hasCriticalIssue = true;
    incidentType = "ledger_mismatch";
  }

  const { data: breaker } = await supabase
    .from("pilot_circuit_breaker")
    .select("incident_count")
    .limit(1)
    .single();

  return {
    hasCriticalIssue,
    incidentType,
    reason: issues.join("; ") || "All checks passed",
    details: { issues, checksRun: 3, timestamp: new Date().toISOString() },
    incidentCount: (breaker?.incident_count || 0) + (hasCriticalIssue ? 1 : 0),
  };
}
