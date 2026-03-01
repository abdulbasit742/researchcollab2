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
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { action, project_id } = await req.json();

    if (action === "compute_activity_score") {
      if (!project_id) throw new Error("project_id required");

      // Count tasks
      const { count: totalTasks } = await supabase
        .from("milestone_tasks")
        .select("*", { count: "exact", head: true })
        .eq("milestone_id", project_id);

      // For project-level, we need milestones first
      const { data: milestones } = await supabase
        .from("milestones")
        .select("id")
        .eq("offer_id", project_id);

      const milestoneIds = milestones?.map((m: any) => m.id) || [];

      let taskTotal = 0;
      let taskCompleted = 0;

      if (milestoneIds.length > 0) {
        const { data: tasks } = await supabase
          .from("milestone_tasks")
          .select("status")
          .in("milestone_id", milestoneIds);

        taskTotal = tasks?.length || 0;
        taskCompleted =
          tasks?.filter((t: any) => t.status === "completed").length || 0;
      }

      // Count artifacts
      const { count: artifactCount } = await supabase
        .from("research_artifacts")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project_id);

      // Count reviews
      const { count: reviewCount } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project_id);

      // Compute activity score (0-100)
      const taskScore = taskTotal > 0 ? (taskCompleted / taskTotal) * 40 : 0;
      const artifactScore = Math.min((artifactCount || 0) * 5, 30);
      const reviewScore = Math.min((reviewCount || 0) * 10, 30);
      const activityScore = Math.round(taskScore + artifactScore + reviewScore);

      // Upsert summary
      const { data: existing } = await supabase
        .from("project_activity_summary")
        .select("id")
        .eq("project_id", project_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("project_activity_summary")
          .update({
            total_tasks: taskTotal,
            completed_tasks: taskCompleted,
            artifact_count: artifactCount || 0,
            review_count: reviewCount || 0,
            activity_score: activityScore,
            updated_at: new Date().toISOString(),
          })
          .eq("project_id", project_id);
      } else {
        await supabase.from("project_activity_summary").insert({
          project_id,
          total_tasks: taskTotal,
          completed_tasks: taskCompleted,
          artifact_count: artifactCount || 0,
          review_count: reviewCount || 0,
          activity_score: activityScore,
        });
      }

      return new Response(
        JSON.stringify({
          total_tasks: taskTotal,
          completed_tasks: taskCompleted,
          artifact_count: artifactCount || 0,
          review_count: reviewCount || 0,
          activity_score: activityScore,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
