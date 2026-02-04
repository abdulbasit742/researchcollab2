import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  insights_created: number;
  alerts_created: number;
  entropy_calculated: number;
  deal_health_updated: number;
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json().catch(() => ({}));

    const result: AnalysisResult = {
      insights_created: 0,
      alerts_created: 0,
      entropy_calculated: 0,
      deal_health_updated: 0,
    };

    // Get target users (single user or all active users)
    let targetUsers: string[] = [];
    if (user_id) {
      targetUsers = [user_id];
    } else {
      const { data: activeUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_active", true)
        .limit(100);
      targetUsers = activeUsers?.map((u: { id: string }) => u.id) || [];
    }

    for (const userId of targetUsers) {
      // 1. Analyze Relationship Entropy
      const entropyInsights = await analyzeRelationshipEntropy(supabase, userId);
      result.entropy_calculated += entropyInsights.calculated;
      result.insights_created += entropyInsights.insightsCreated;

      // 2. Calculate Deal Health
      const dealHealthResults = await calculateDealHealth(supabase, userId);
      result.deal_health_updated += dealHealthResults.updated;
      result.insights_created += dealHealthResults.insightsCreated;

      // 3. Generate Opportunity Proximity Alerts
      const opportunityResults = await analyzeOpportunityProximity(supabase, userId);
      result.alerts_created += opportunityResults.alertsCreated;
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Ambient analyzer error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function analyzeRelationshipEntropy(
  supabase: SupabaseClient,
  userId: string
) {
  let calculated = 0;
  let insightsCreated = 0;

  // Get user's connections (from messages, collaborations, etc.)
  const { data: messagePartners } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, created_at")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(500);

  if (!messagePartners || messagePartners.length === 0) {
    return { calculated, insightsCreated };
  }

  // Build interaction map
  const interactionMap = new Map<
    string,
    { lastInteraction: Date; count: number }
  >();

  for (const msg of messagePartners) {
    const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
    if (!partnerId || partnerId === userId) continue;

    const existing = interactionMap.get(partnerId);
    const msgDate = new Date(msg.created_at);

    if (!existing || msgDate > existing.lastInteraction) {
      interactionMap.set(partnerId, {
        lastInteraction: msgDate,
        count: (existing?.count || 0) + 1,
      });
    } else {
      existing.count++;
    }
  }

  const now = new Date();

  for (const [connectionId, data] of interactionMap) {
    const daysSince = Math.floor(
      (now.getTime() - data.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate entropy score (higher = more decay)
    const baseEntropy = Math.min(100, daysSince * 2);
    const frequencyBonus = Math.min(30, data.count * 2);
    const entropyScore = Math.max(0, baseEntropy - frequencyBonus);

    // Determine trend
    let interactionTrend: string = "stable";
    if (daysSince > 30) interactionTrend = "dormant";
    else if (daysSince > 14) interactionTrend = "decreasing";
    else if (data.count > 10) interactionTrend = "increasing";

    // Upsert entropy record
    await supabase.from("relationship_entropy").upsert(
      {
        user_id: userId,
        connection_id: connectionId,
        entropy_score: entropyScore,
        last_interaction_at: data.lastInteraction.toISOString(),
        days_since_interaction: daysSince,
        interaction_trend: interactionTrend,
        interaction_frequency: data.count,
        calculated_at: now.toISOString(),
        suggested_action:
          entropyScore > 70
            ? "Send a quick message to reconnect"
            : entropyScore > 50
            ? "Consider scheduling a catch-up"
            : null,
      },
      { onConflict: "user_id,connection_id" }
    );
    calculated++;

    // Create insight for high entropy connections
    if (entropyScore >= 75 && daysSince > 21) {
      const { data: connectionProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", connectionId)
        .maybeSingle();

      const connectionName = connectionProfile?.full_name || "a connection";

      await supabase.from("ambient_insights").insert({
        user_id: userId,
        insight_type: "relationship_decay",
        priority: entropyScore >= 85 ? "high" : "medium",
        title: `Reconnect with ${connectionName}`,
        description: `It's been ${daysSince} days since your last interaction. Consider reaching out to maintain this relationship.`,
        action_url: `/profile/${connectionId}`,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      insightsCreated++;
    }
  }

  return { calculated, insightsCreated };
}

async function calculateDealHealth(
  supabase: SupabaseClient,
  userId: string
) {
  let updated = 0;
  let insightsCreated = 0;

  // Get user's active deals
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("id, title, buyer_id, seller_id, status, created_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .in("status", ["active", "negotiating", "pending"]);

  if (!deals || deals.length === 0) {
    return { updated, insightsCreated };
  }

  const now = new Date();

  for (const deal of deals) {
    // Get deal messages for communication score
    const { data: dealMessages } = await supabase
      .from("messages")
      .select("created_at, sender_id")
      .eq("thread_id", deal.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const lastActivity = dealMessages?.[0]?.created_at
      ? new Date(dealMessages[0].created_at)
      : new Date(deal.created_at);

    const daysSinceActivity = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate scores
    const messageCount = dealMessages?.length || 0;
    const communicationScore = Math.min(100, messageCount * 5);

    // Check message balance
    const userMessages = dealMessages?.filter((m: { sender_id: string }) => m.sender_id === userId).length || 0;
    const partnerMessages = messageCount - userMessages;
    const balanceRatio =
      messageCount > 0
        ? Math.min(userMessages, partnerMessages) / Math.max(userMessages, partnerMessages, 1)
        : 0;

    // Risk factors
    const riskFactors: string[] = [];
    if (daysSinceActivity > 7) riskFactors.push("No activity in over a week");
    if (balanceRatio < 0.3) riskFactors.push("One-sided communication");
    if (messageCount < 3) riskFactors.push("Limited discussion");

    // Calculate overall health score
    let healthScore = 100;
    healthScore -= daysSinceActivity * 3;
    healthScore -= (1 - balanceRatio) * 20;
    healthScore = Math.max(0, Math.min(100, healthScore + communicationScore * 0.3));

    // Determine predicted outcome
    let predictedOutcome = "on_track";
    if (healthScore < 40) predictedOutcome = "likely_fail";
    else if (healthScore < 65) predictedOutcome = "at_risk";

    // Sentiment trend
    const sentimentTrend =
      daysSinceActivity > 5 ? "declining" : messageCount > 10 ? "improving" : "stable";

    // Insert health metric
    await supabase.from("deal_health_metrics").insert({
      deal_id: deal.id,
      health_score: Math.round(healthScore),
      communication_score: communicationScore,
      sentiment_trend: sentimentTrend,
      risk_factors: riskFactors,
      last_activity_at: lastActivity.toISOString(),
      days_since_activity: daysSinceActivity,
      predicted_outcome: predictedOutcome,
      confidence: Math.min(90, 50 + messageCount * 2),
      calculated_at: now.toISOString(),
    });
    updated++;

    // Create insight for at-risk deals
    if (predictedOutcome !== "on_track") {
      await supabase.from("ambient_insights").insert({
        user_id: userId,
        insight_type: "deal_risk",
        priority: predictedOutcome === "likely_fail" ? "high" : "medium",
        title: `Deal "${deal.title || "Untitled"}" needs attention`,
        description: riskFactors[0] || "This deal may need your attention to stay on track.",
        action_url: `/deals/${deal.id}`,
        expires_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
      insightsCreated++;
    }
  }

  return { updated, insightsCreated };
}

async function analyzeOpportunityProximity(
  supabase: SupabaseClient,
  userId: string
) {
  let alertsCreated = 0;

  // Get user's profile and skills
  const { data: profile } = await supabase
    .from("profiles")
    .select("skills, hourly_rate, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.skills || profile.skills.length === 0) {
    return { alertsCreated };
  }

  const userSkills = (profile.skills as string[]).map((s: string) => s.toLowerCase());

  // Get recent opportunities
  const { data: opportunities } = await supabase
    .from("offers")
    .select("id, title, description, required_skills, budget_min, budget_max, deadline, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!opportunities || opportunities.length === 0) {
    return { alertsCreated };
  }

  const now = new Date();

  for (const opp of opportunities) {
    const oppSkills = ((opp.required_skills as string[]) || []).map((s: string) =>
      s.toLowerCase()
    );

    // Calculate skill match
    const matchingSkills = userSkills.filter((s: string) =>
      oppSkills.some((os: string) => os.includes(s) || s.includes(os))
    );
    const skillMatchScore =
      oppSkills.length > 0
        ? (matchingSkills.length / oppSkills.length) * 100
        : 0;

    // Budget fit
    let budgetFitScore = 50;
    if (profile.hourly_rate && opp.budget_min) {
      const estimatedProject = profile.hourly_rate * 40;
      if (estimatedProject >= opp.budget_min && (!opp.budget_max || estimatedProject <= opp.budget_max)) {
        budgetFitScore = 90;
      } else if (estimatedProject < opp.budget_min) {
        budgetFitScore = 30;
      }
    }

    // Calculate overall match score
    const matchScore = Math.round(skillMatchScore * 0.6 + budgetFitScore * 0.4);

    // Only create alerts for high matches (80%+)
    if (matchScore >= 80) {
      // Check if alert already exists
      const { data: existingAlert } = await supabase
        .from("opportunity_alerts")
        .select("id")
        .eq("user_id", userId)
        .eq("opportunity_id", opp.id)
        .maybeSingle();

      if (!existingAlert) {
        const matchReasons: string[] = [];
        if (matchingSkills.length > 0) {
          matchReasons.push(`Skills match: ${matchingSkills.join(", ")}`);
        }
        if (budgetFitScore >= 80) {
          matchReasons.push("Budget aligns with your rate");
        }

        // Calculate deadline distance
        let deadlineDistanceDays: number | null = null;
        if (opp.deadline) {
          const deadline = new Date(opp.deadline);
          deadlineDistanceDays = Math.floor(
            (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        await supabase.from("opportunity_alerts").insert({
          user_id: userId,
          opportunity_id: opp.id,
          match_score: matchScore,
          alert_type: matchScore >= 90 ? "high_match" : "skill_match",
          match_reasons: matchReasons,
          deadline_distance_days: deadlineDistanceDays,
          expires_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });
        alertsCreated++;
      }
    }
  }

  return { alertsCreated };
}
