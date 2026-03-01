import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { action, project_id } = await req.json();

    if (action === "generate_recommendations") {
      if (!project_id) throw new Error("project_id required");

      // Fetch project milestones
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("offer_id", project_id)
        .order("created_at", { ascending: true });

      const recommendations: { type: string; text: string; severity: string }[] = [];

      if (milestones && milestones.length > 0) {
        const now = new Date();

        for (const m of milestones) {
          // Overdue milestone detection
          if (m.deadline && m.status !== "completed" && m.status !== "released") {
            const deadline = new Date(m.deadline);
            const daysOverdue = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
            if (daysOverdue > 0) {
              recommendations.push({
                type: "overdue_milestone",
                text: `Milestone "${m.title || m.id}" is overdue by ${daysOverdue} day${daysOverdue > 1 ? "s" : ""}. Consider reviewing the timeline.`,
                severity: daysOverdue > 7 ? "critical" : "warning",
              });
            }
          }

          // Disputed milestone
          if (m.status === "disputed") {
            recommendations.push({
              type: "active_dispute",
              text: `Milestone "${m.title || m.id}" is in dispute. Resolve promptly to maintain trust scores.`,
              severity: "critical",
            });
          }
        }

        // Completion rate analysis
        const completed = milestones.filter((m: any) => m.status === "completed" || m.status === "released").length;
        const total = milestones.length;
        const completionRate = total > 0 ? completed / total : 0;

        if (completionRate < 0.3 && total >= 3) {
          recommendations.push({
            type: "low_completion",
            text: `Only ${Math.round(completionRate * 100)}% of milestones completed. Consider breaking tasks into smaller deliverables.`,
            severity: "warning",
          });
        }

        // Funding concentration check
        const fundedCount = milestones.filter((m: any) => m.status === "funded" || m.status === "in_progress").length;
        if (fundedCount > 3) {
          recommendations.push({
            type: "funding_concentration",
            text: `${fundedCount} milestones are funded simultaneously. High capital concentration detected.`,
            severity: "info",
          });
        }
      }

      // If no issues found
      if (recommendations.length === 0) {
        recommendations.push({
          type: "healthy",
          text: "Project execution is on track. No issues detected.",
          severity: "info",
        });
      }

      // Insert recommendations
      const inserts = recommendations.map((r) => ({
        project_id,
        recommendation_type: r.type,
        recommendation_text: r.text,
        severity: r.severity,
      }));

      const { error: insertErr } = await supabase
        .from("execution_recommendations")
        .insert(inserts);

      if (insertErr) throw insertErr;

      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "take_snapshot") {
      if (!project_id) throw new Error("project_id required");

      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("offer_id", project_id);

      const total = milestones?.length || 0;
      const completed = milestones?.filter((m: any) => m.status === "completed" || m.status === "released").length || 0;
      const disputed = milestones?.some((m: any) => m.status === "disputed");
      const funded = milestones?.filter((m: any) => m.status !== "pending").length || 0;

      const snapshot = {
        project_id,
        milestone_progress_percentage: total > 0 ? (completed / total) * 100 : 0,
        funding_progress_percentage: total > 0 ? (funded / total) * 100 : 0,
        dispute_status: disputed ? "active" : "none",
      };

      const { error: snapErr } = await supabase
        .from("execution_snapshots")
        .insert(snapshot);

      if (snapErr) throw snapErr;

      return new Response(JSON.stringify({ snapshot }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
