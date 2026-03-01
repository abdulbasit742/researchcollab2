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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = claimsData.claims.sub;
    const { action, ...params } = await req.json();

    if (action === "generate_experiment_hash") {
      // Generate cryptographic reproducibility hash for an experiment
      const {
        experiment_id,
        dataset_signature,
        execution_environment,
        parameters,
      } = params;

      // Build hash payload from experiment data
      const hashPayload = JSON.stringify({
        experiment_id,
        dataset_signature: dataset_signature || "",
        execution_environment: execution_environment || {},
        parameters: parameters || {},
        timestamp: new Date().toISOString(),
        user_id: userId,
      });

      // Generate SHA-256 hash
      const encoder = new TextEncoder();
      const data = encoder.encode(hashPayload);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const reproducibilityHash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Update experiment session with hash
      const { error: updateError } = await supabase
        .from("experiment_sessions")
        .update({
          reproducibility_hash: reproducibilityHash,
          dataset_signature: dataset_signature || null,
          execution_environment: execution_environment || {},
        })
        .eq("id", experiment_id)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          reproducibility_hash: reproducibilityHash,
          experiment_id,
          verified_at: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify_reproducibility") {
      // Verify that an experiment's hash matches its claimed state
      const { experiment_id } = params;

      const { data: experiment, error: fetchError } = await supabase
        .from("experiment_sessions")
        .select("*")
        .eq("id", experiment_id)
        .single();

      if (fetchError || !experiment) {
        return new Response(
          JSON.stringify({ error: "Experiment not found" }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      // Rebuild hash from stored data
      const hashPayload = JSON.stringify({
        experiment_id: experiment.id,
        dataset_signature: experiment.dataset_signature || "",
        execution_environment: experiment.execution_environment || {},
        parameters: experiment.metadata?.parameters || {},
        timestamp: experiment.created_at,
        user_id: experiment.user_id,
      });

      const encoder = new TextEncoder();
      const data = encoder.encode(hashPayload);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const recomputedHash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isVerified = recomputedHash === experiment.reproducibility_hash;

      // If linked to a milestone, we can create a research asset
      let assetCreated = false;
      if (isVerified && experiment.linked_milestone_id) {
        const { error: assetError } = await supabase
          .from("research_assets")
          .insert({
            creator_id: experiment.user_id,
            title: experiment.title,
            description: `Verified compute output from experiment: ${experiment.title}`,
            asset_type: "verified_compute",
            linked_experiment_id: experiment.id,
            linked_milestone_id: experiment.linked_milestone_id,
            reproducibility_hash: experiment.reproducibility_hash,
            validation_status: "validated",
            validation_count: 1,
          });
        assetCreated = !assetError;
      }

      return new Response(
        JSON.stringify({
          experiment_id,
          is_verified: isVerified,
          stored_hash: experiment.reproducibility_hash,
          recomputed_hash: recomputedHash,
          asset_created: assetCreated,
          verified_at: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "complete_experiment") {
      // Mark experiment as complete and log compute usage
      const { experiment_id, compute_duration_seconds, gpu_type, resource_type } = params;

      const { error: updateError } = await supabase
        .from("experiment_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          compute_duration_seconds: compute_duration_seconds || 0,
          gpu_type: gpu_type || null,
        })
        .eq("id", experiment_id)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Log to compute usage ledger (append-only)
      const { error: ledgerError } = await supabase
        .from("compute_usage_ledger")
        .insert({
          experiment_session_id: experiment_id,
          user_id: userId,
          resource_type: resource_type || (gpu_type ? "gpu" : "cpu"),
          units_consumed: compute_duration_seconds || 0,
          unit_type: "seconds",
        });

      if (ledgerError) throw ledgerError;

      return new Response(
        JSON.stringify({ success: true, experiment_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
