import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: corsHeaders,
      });
    }

    const userId = claimsData.claims.sub;
    const { action, ...params } = await req.json();

    if (action === "generate_execution_hash") {
      const { title, milestone_id, project_id, environment_snapshot, dataset_signature, metadata } = params;

      const hashPayload = JSON.stringify({
        user_id: userId,
        title,
        milestone_id: milestone_id || null,
        project_id: project_id || null,
        environment_snapshot: environment_snapshot || {},
        dataset_signature: dataset_signature || "",
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      });

      const executionHash = await sha256(hashPayload);
      const reproducibilityHash = await sha256(
        JSON.stringify({ execution_hash: executionHash, environment: environment_snapshot || {} })
      );

      const { data, error } = await supabase
        .from("research_executions")
        .insert({
          user_id: userId,
          title,
          milestone_id: milestone_id || null,
          project_id: project_id || null,
          execution_hash: executionHash,
          environment_snapshot: environment_snapshot || {},
          dataset_signature: dataset_signature || null,
          reproducibility_hash: reproducibilityHash,
          metadata: metadata || {},
          status: "recorded",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        execution: data,
        execution_hash: executionHash,
        reproducibility_hash: reproducibilityHash,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "verify_reproducibility") {
      const { execution_id } = params;

      const { data: execution, error: fetchError } = await supabase
        .from("research_executions")
        .select("*")
        .eq("id", execution_id)
        .single();

      if (fetchError || !execution) {
        return new Response(JSON.stringify({ error: "Execution not found" }), {
          status: 404, headers: corsHeaders,
        });
      }

      // Recompute hash from stored environment
      const recomputedHash = await sha256(
        JSON.stringify({ execution_hash: execution.execution_hash, environment: execution.environment_snapshot || {} })
      );

      const isVerified = recomputedHash === execution.reproducibility_hash;

      // Update status
      await supabase
        .from("research_executions")
        .update({ status: isVerified ? "verified" : "failed" })
        .eq("id", execution_id);

      return new Response(JSON.stringify({
        execution_id,
        is_verified: isVerified,
        stored_hash: execution.reproducibility_hash,
        recomputed_hash: recomputedHash,
        verified_at: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "attach_compute_proof") {
      const { execution_id, compute_metadata } = params;

      // Verify ownership
      const { data: execution } = await supabase
        .from("research_executions")
        .select("id, user_id")
        .eq("id", execution_id)
        .eq("user_id", userId)
        .single();

      if (!execution) {
        return new Response(JSON.stringify({ error: "Execution not found or unauthorized" }), {
          status: 403, headers: corsHeaders,
        });
      }

      const integritySig = await sha256(
        JSON.stringify({ execution_id, compute_metadata, timestamp: new Date().toISOString() })
      );

      const { data, error } = await supabase
        .from("compute_proofs")
        .insert({
          research_execution_id: execution_id,
          compute_metadata: compute_metadata || {},
          integrity_signature: integritySig,
          proof_type: "sha256",
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        proof: data,
        integrity_signature: integritySig,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
});
