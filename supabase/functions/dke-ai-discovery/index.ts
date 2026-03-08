import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * AI Dataset Discovery Engine — Recommends datasets and knowledge objects
 * based on user research domain, project requirements, and capability graph.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { user_id, research_domain, project_description, capabilities, limit: resultLimit } = await req.json();

    if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!user_id) throw new Error("user_id is required");

    // Fetch available datasets
    const { data: datasets } = await supabase
      .from("dke_dataset_registry")
      .select("id, title, description, domain_category, sub_domain, data_type, license_type, tags, quality_score, download_count, price_amount")
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(50);

    // Fetch knowledge objects
    const { data: knowledgeObjs } = await supabase
      .from("dke_knowledge_objects")
      .select("id, title, description, object_type, domain, license_type, tags, quality_score, download_count, price_amount")
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(50);

    const allAssets = [
      ...(datasets || []).map((d: any) => ({ ...d, asset_type: "dataset" })),
      ...(knowledgeObjs || []).map((k: any) => ({ ...k, asset_type: "knowledge_object", domain_category: k.domain })),
    ];

    if (allAssets.length === 0) {
      return new Response(JSON.stringify({ recommendations: [], message: "No published assets available" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to match user context to available assets
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a research data discovery engine. Given a user's research context and a catalog of available assets, score and rank the most relevant ones.

User context:
- Research domain: ${research_domain || "general"}
- Project description: ${project_description || "not specified"}
- Capabilities: ${JSON.stringify(capabilities || [])}

Available assets catalog:
${JSON.stringify(allAssets.slice(0, 30), null, 1)}

Return the top ${resultLimit || 10} most relevant assets with match scores and reasons.`
          },
          { role: "user", content: "Find the most relevant datasets and knowledge objects for my research." }
        ],
        tools: [{
          type: "function",
          function: {
            name: "rank_assets",
            description: "Return ranked asset recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      asset_id: { type: "string" },
                      asset_type: { type: "string" },
                      asset_title: { type: "string" },
                      match_score: { type: "number", description: "0-100 relevance score" },
                      match_reasons: { type: "array", items: { type: "string" } },
                    },
                    required: ["asset_id", "asset_type", "asset_title", "match_score", "match_reasons"],
                  },
                },
              },
              required: ["recommendations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "rank_assets" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let result: any = { recommendations: [] };
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    }

    // Save recommendations
    const inserts = (result.recommendations || []).map((r: any) => ({
      user_id,
      asset_type: r.asset_type,
      asset_id: r.asset_id,
      asset_title: r.asset_title,
      match_score: r.match_score,
      match_reasons: r.match_reasons,
    }));

    if (inserts.length > 0) {
      await supabase.from("dke_ai_recommendations").insert(inserts);
    }

    return new Response(JSON.stringify({
      success: true,
      recommendations: result.recommendations,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dke-ai-discovery error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
