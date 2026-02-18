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
    // JWT Authentication - Admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("is_admin", { check_user_id: claimsData.claims.sub });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch last 30 days of revenue metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: metrics, error: metricsError } = await supabase
      .from("revenue_metrics_daily")
      .select("*")
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (metricsError) throw metricsError;

    // Linear trend computation
    const n = metrics?.length || 0;
    let projectedMrr = 0;
    let projectedTransactionVolume = 0;
    let churnRisk = 0.5;

    if (n >= 2) {
      const revenues = metrics!.map((m) => m.total_revenue || 0);
      const subRevenues = metrics!.map((m) => m.subscription_revenue || 0);

      // Simple linear regression on total revenue
      const xMean = (n - 1) / 2;
      const yMean = revenues.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (i - xMean) * (revenues[i] - yMean);
        den += (i - xMean) ** 2;
      }
      const slope = den !== 0 ? num / den : 0;
      const intercept = yMean - slope * xMean;

      // Project 30 days forward
      projectedMrr = Math.max(0, Math.round(intercept + slope * (n + 30)));
      projectedTransactionVolume = Math.max(0, Math.round(revenues[n - 1] * 30));

      // Churn risk: if trend is declining, higher risk
      if (slope < 0) {
        churnRisk = Math.min(1, 0.5 + Math.abs(slope) / (yMean || 1));
      } else {
        churnRisk = Math.max(0, 0.3 - slope / (yMean || 1));
      }
    }

    const forecast = {
      projected_mrr: projectedMrr,
      projected_transaction_volume: projectedTransactionVolume,
      churn_risk: Math.round(churnRisk * 100) / 100,
      enterprise_pipeline_value: 0,
      forecast_date: new Date().toISOString().split("T")[0],
    };

    // Upsert forecast
    const { error: upsertError } = await supabase
      .from("revenue_forecasts")
      .insert(forecast);

    if (upsertError) {
      console.error("Forecast insert error:", upsertError);
    }

    return new Response(JSON.stringify(forecast), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Forecast error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
