import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
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

    // Admin-only endpoint
    const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: userId });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    const startDate = url.searchParams.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get("end_date") || new Date().toISOString();
    const logType = url.searchParams.get("type") || "all";

    const results: Record<string, unknown[]> = {};

    // Fetch admin audit logs
    if (logType === "all" || logType === "admin") {
      const { data: adminLogs } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .limit(5000);
      results.admin_audit_logs = adminLogs || [];
    }

    // Fetch state transitions
    if (logType === "all" || logType === "state") {
      const { data: stateLogs } = await supabase
        .from("state_transition_logs")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .limit(5000);
      results.state_transition_logs = stateLogs || [];
    }

    // Fetch trust events
    if (logType === "all" || logType === "trust") {
      const { data: trustLogs } = await supabase
        .from("trust_events")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .limit(5000);
      results.trust_events = trustLogs || [];
    }

    // Fetch financial ledger entries
    if (logType === "all" || logType === "financial") {
      const { data: ledgerLogs } = await supabase
        .from("ledger_entries")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .limit(5000);
      results.ledger_entries = ledgerLogs || [];
    }

    // Fetch abuse detections
    if (logType === "all" || logType === "abuse") {
      const { data: abuseLogs } = await supabase
        .from("abuse_detections")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .limit(5000);
      results.abuse_detections = abuseLogs || [];
    }

    // Log the export action
    await supabase.from("admin_audit_logs").insert({
      admin_id: userId,
      action: "export_audit_logs",
      entity_type: "audit_export",
      details: { format, logType, startDate, endDate, record_counts: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.length])) },
    });

    const exportPayload = {
      exported_at: new Date().toISOString(),
      exported_by: userId,
      date_range: { start: startDate, end: endDate },
      log_type: logType,
      record_counts: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.length])),
      data: results,
    };

    if (format === "csv") {
      // Flatten all logs into a single CSV
      const allLogs: Record<string, unknown>[] = [];
      for (const [source, logs] of Object.entries(results)) {
        for (const log of logs as Record<string, unknown>[]) {
          allLogs.push({ source, ...log });
        }
      }

      if (allLogs.length === 0) {
        return new Response("No records found", {
          headers: { ...corsHeaders, "Content-Type": "text/csv" },
        });
      }

      const headers = Object.keys(allLogs[0]);
      const csvRows = [
        headers.join(","),
        ...allLogs.map(row =>
          headers.map(h => {
            const val = row[h];
            const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
            return `"${str.replace(/"/g, '""')}"`;
          }).join(",")
        ),
      ];

      return new Response(csvRows.join("\n"), {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return new Response(JSON.stringify(exportPayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Audit export error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
