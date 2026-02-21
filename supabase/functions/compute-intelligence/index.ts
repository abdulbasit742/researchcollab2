import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { scope, entity_id } = await req.json();
    // scope: 'deal_health' | 'funding_likelihood' | 'trust_prediction' | 'sponsor_match' | 'hiring_propensity' | 'capital_velocity' | 'anomaly_detection' | 'all'

    const results: Record<string, any> = {};

    // ========== STEP 1: DEAL HEALTH ENGINE ==========
    if (scope === "deal_health" || scope === "all") {
      const { data: tracks } = await supabase
        .from("fyp_execution_tracks")
        .select("id, topic_id, team_id, status, created_at, submitted_at, reviewed_at, escrow_amount, released_amount, milestone_order")
        .order("created_at", { ascending: false })
        .limit(500);

      const { data: sponsorships } = await supabase
        .from("fyp_sponsorships")
        .select("id, topic_id, sponsor_id, status, pledge_amount, funded_amount, created_at, approved_at")
        .eq("status", "funded")
        .limit(200);

      // Group tracks by topic_id (deal)
      const dealMap: Record<string, any[]> = {};
      (tracks ?? []).forEach((t: any) => {
        if (!dealMap[t.topic_id]) dealMap[t.topic_id] = [];
        dealMap[t.topic_id].push(t);
      });

      const dealScores: any[] = [];
      for (const [topicId, milestones] of Object.entries(dealMap)) {
        const total = milestones.length;
        const approved = milestones.filter((m: any) => m.status === "approved").length;
        const submitted = milestones.filter((m: any) => m.status === "submitted").length;
        const overdue = milestones.filter((m: any) => {
          if (m.status === "approved") return false;
          const created = new Date(m.created_at).getTime();
          const now = Date.now();
          return (now - created) > 30 * 24 * 60 * 60 * 1000; // 30 days
        }).length;

        const completionProb = total > 0 ? Math.round(((approved + submitted * 0.5) / total) * 100) : 50;
        const delayRisk = total > 0 ? Math.round((overdue / total) * 100) : 0;
        const disputeRisk = Math.min(100, Math.round(delayRisk * 0.6 + (total - approved) * 5));

        // Sponsor responsiveness
        const sponsorship = (sponsorships ?? []).find((s: any) => s.topic_id === topicId);
        const sponsorResponsiveness = sponsorship?.approved_at
          ? Math.max(0, 100 - Math.round((new Date(sponsorship.approved_at).getTime() - new Date(sponsorship.created_at).getTime()) / (24 * 60 * 60 * 1000) * 10))
          : 50;

        // Student execution score
        const studentExecution = total > 0 ? Math.round(((approved * 1 + submitted * 0.7) / total) * 100) : 50;

        const healthScore = Math.round(completionProb * 0.3 + (100 - delayRisk) * 0.25 + (100 - disputeRisk) * 0.2 + sponsorResponsiveness * 0.15 + studentExecution * 0.1);
        const healthLevel = healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red";

        const score = {
          entity_type: "fyp_topic",
          entity_id: topicId,
          score_type: "deal_health",
          health_level: healthLevel,
          scores: { completion_probability: completionProb, delay_risk: delayRisk, dispute_risk: disputeRisk, sponsor_responsiveness: sponsorResponsiveness, student_execution: studentExecution, overall: healthScore },
          factors: { total_milestones: total, approved, submitted, overdue },
          recommendations: [
            ...(delayRisk > 50 ? ["Escalate: milestones overdue"] : []),
            ...(sponsorResponsiveness < 40 ? ["Nudge sponsor for faster review"] : []),
            ...(studentExecution < 40 ? ["Alert faculty: student execution lagging"] : []),
          ],
        };
        dealScores.push(score);

        await supabase.from("intelligence_scores").upsert(score, { onConflict: "entity_type,entity_id,score_type" });
      }
      results.deal_health = dealScores;
    }

    // ========== STEP 2: FUNDING LIKELIHOOD ENGINE ==========
    if (scope === "funding_likelihood" || scope === "all") {
      const { data: topics } = await supabase
        .from("fyp_topics")
        .select("id, title, estimated_budget, skill_requirements, institution_id, created_at, status")
        .in("status", ["open", "active"])
        .limit(200);

      const { data: allSponsorships } = await supabase
        .from("fyp_sponsorships")
        .select("topic_id, sponsor_id, status, pledge_amount, funded_amount")
        .limit(1000);

      const fundedTopics = new Set((allSponsorships ?? []).filter((s: any) => s.status === "funded").map((s: any) => s.topic_id));
      const totalTopics = (allSponsorships ?? []).length || 1;
      const platformFundingRate = fundedTopics.size / Math.max(1, new Set((allSponsorships ?? []).map((s: any) => s.topic_id)).size);

      const fundingScores: any[] = [];
      for (const topic of (topics ?? [])) {
        const hasBudget = topic.estimated_budget && topic.estimated_budget > 0;
        const hasSkills = (topic.skill_requirements?.length ?? 0) > 0;
        const hasInstitution = !!topic.institution_id;
        const ageDays = (Date.now() - new Date(topic.created_at).getTime()) / (24 * 60 * 60 * 1000);

        let fundingProb = Math.round(platformFundingRate * 100);
        if (hasBudget) fundingProb += 15;
        if (hasSkills) fundingProb += 10;
        if (hasInstitution) fundingProb += 10;
        if (ageDays < 7) fundingProb += 10;
        fundingProb = Math.min(95, Math.max(5, fundingProb));

        const estTimeDays = Math.round(14 + (1 - fundingProb / 100) * 30);
        const matchStrength = Math.round((hasBudget ? 30 : 0) + (hasSkills ? 30 : 0) + (hasInstitution ? 20 : 0) + platformFundingRate * 20);

        const healthLevel = fundingProb >= 60 ? "green" : fundingProb >= 35 ? "yellow" : "red";

        const score = {
          entity_type: "fyp_topic",
          entity_id: topic.id,
          score_type: "funding_likelihood",
          health_level: healthLevel,
          scores: { funding_probability: fundingProb, estimated_time_days: estTimeDays, sponsor_match_strength: matchStrength },
          factors: { has_budget: hasBudget, has_skills: hasSkills, has_institution: hasInstitution, age_days: Math.round(ageDays) },
          recommendations: [
            ...(!hasBudget ? ["Add budget estimate to attract sponsors"] : []),
            ...(!hasSkills ? ["Define skill requirements for better matching"] : []),
            ...(!hasInstitution ? ["Link to institution for credibility boost"] : []),
          ],
        };
        fundingScores.push(score);
        await supabase.from("intelligence_scores").upsert(score, { onConflict: "entity_type,entity_id,score_type" });
      }
      results.funding_likelihood = fundingScores;
    }

    // ========== STEP 3: TRUST PREDICTION MODEL ==========
    if (scope === "trust_prediction" || scope === "all") {
      const { data: events } = await supabase
        .from("trust_events")
        .select("user_id, event_type, delta, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      const userDeltas: Record<string, { onTime: number[], delayed: number[], disputed: number[] }> = {};
      (events ?? []).forEach((e: any) => {
        if (!userDeltas[e.user_id]) userDeltas[e.user_id] = { onTime: [], delayed: [], disputed: [] };
        if (e.event_type === "milestone_completed" || e.event_type === "deal_completed") {
          userDeltas[e.user_id].onTime.push(e.delta ?? 0);
        } else if (e.event_type === "milestone_delayed" || e.event_type === "deal_delayed") {
          userDeltas[e.user_id].delayed.push(e.delta ?? 0);
        } else if (e.event_type === "dispute_filed" || e.event_type === "dispute_lost") {
          userDeltas[e.user_id].disputed.push(e.delta ?? 0);
        }
      });

      const trustPredictions: any[] = [];
      for (const [userId, data] of Object.entries(userDeltas)) {
        const avgOnTime = data.onTime.length > 0 ? Math.round(data.onTime.reduce((a, b) => a + b, 0) / data.onTime.length * 10) / 10 : 3;
        const avgDelayed = data.delayed.length > 0 ? Math.round(data.delayed.reduce((a, b) => a + b, 0) / data.delayed.length * 10) / 10 : -5;
        const avgDisputed = data.disputed.length > 0 ? Math.round(data.disputed.reduce((a, b) => a + b, 0) / data.disputed.length * 10) / 10 : -15;

        const score = {
          entity_type: "user",
          entity_id: userId,
          score_type: "trust_prediction",
          health_level: avgOnTime > 0 ? "green" : "yellow",
          scores: { on_time_impact: avgOnTime, delay_impact: avgDelayed, dispute_impact: avgDisputed },
          factors: { on_time_count: data.onTime.length, delay_count: data.delayed.length, dispute_count: data.disputed.length },
          recommendations: [],
        };
        trustPredictions.push(score);
        await supabase.from("intelligence_scores").upsert(score, { onConflict: "entity_type,entity_id,score_type" });
      }
      results.trust_prediction = trustPredictions;
    }

    // ========== STEP 4: SPONSOR MATCHING AI ==========
    if (scope === "sponsor_match" || scope === "all") {
      const { data: sponsors } = await supabase
        .from("fyp_sponsorships")
        .select("sponsor_id, topic_id, status, pledge_amount, funded_amount")
        .limit(1000);

      const { data: topics } = await supabase
        .from("fyp_topics")
        .select("id, title, skill_requirements, institution_id, estimated_budget")
        .in("status", ["open", "active"])
        .limit(100);

      // Build sponsor profiles from history
      const sponsorProfiles: Record<string, { funded: number, totalAmount: number, topicIds: string[] }> = {};
      (sponsors ?? []).forEach((s: any) => {
        if (!sponsorProfiles[s.sponsor_id]) sponsorProfiles[s.sponsor_id] = { funded: 0, totalAmount: 0, topicIds: [] };
        if (s.status === "funded") {
          sponsorProfiles[s.sponsor_id].funded++;
          sponsorProfiles[s.sponsor_id].totalAmount += s.funded_amount || 0;
        }
        sponsorProfiles[s.sponsor_id].topicIds.push(s.topic_id);
      });

      const matchScores: any[] = [];
      for (const [sponsorId, profile] of Object.entries(sponsorProfiles)) {
        const avgBudget = profile.funded > 0 ? profile.totalAmount / profile.funded : 50000;
        const topMatches = (topics ?? [])
          .filter((t: any) => !profile.topicIds.includes(t.id))
          .map((t: any) => {
            const budgetMatch = t.estimated_budget ? Math.max(0, 100 - Math.abs(t.estimated_budget - avgBudget) / avgBudget * 100) : 50;
            const institutionBonus = t.institution_id ? 15 : 0;
            const skillBonus = (t.skill_requirements?.length ?? 0) > 0 ? 10 : 0;
            return { topic_id: t.id, title: t.title, match_score: Math.min(100, Math.round(budgetMatch + institutionBonus + skillBonus)) };
          })
          .sort((a: any, b: any) => b.match_score - a.match_score)
          .slice(0, 5);

        const score = {
          entity_type: "user",
          entity_id: sponsorId,
          score_type: "sponsor_match",
          health_level: topMatches.length > 0 ? "green" : "yellow",
          scores: { top_matches: topMatches, avg_budget: Math.round(avgBudget), total_funded: profile.funded },
          factors: { history_depth: profile.funded },
          recommendations: topMatches.length === 0 ? ["No unfunded topics match this sponsor's profile"] : [],
        };
        matchScores.push(score);
        await supabase.from("intelligence_scores").upsert(score, { onConflict: "entity_type,entity_id,score_type" });
      }
      results.sponsor_match = matchScores;
    }

    // ========== STEP 5: HIRING PROPENSITY SCORE ==========
    if (scope === "hiring_propensity" || scope === "all") {
      const { data: conversions } = await supabase
        .from("hiring_conversions")
        .select("sponsor_id, student_id, offer_made, hired, created_at")
        .limit(500);

      const { data: completedTracks } = await supabase
        .from("fyp_execution_tracks")
        .select("topic_id, team_id, status")
        .eq("status", "approved")
        .limit(500);

      // Group by sponsor
      const sponsorHiring: Record<string, { offers: number, hires: number }> = {};
      (conversions ?? []).forEach((c: any) => {
        if (!sponsorHiring[c.sponsor_id]) sponsorHiring[c.sponsor_id] = { offers: 0, hires: 0 };
        if (c.offer_made) sponsorHiring[c.sponsor_id].offers++;
        if (c.hired) sponsorHiring[c.sponsor_id].hires++;
      });

      const hiringScores: any[] = [];
      for (const [sponsorId, data] of Object.entries(sponsorHiring)) {
        const hiringRate = data.offers > 0 ? Math.round((data.hires / data.offers) * 100) : 0;
        const propensity = Math.min(95, Math.round(hiringRate * 0.6 + data.offers * 5));
        const healthLevel = propensity >= 60 ? "green" : propensity >= 30 ? "yellow" : "red";

        const score = {
          entity_type: "user",
          entity_id: sponsorId,
          score_type: "hiring_propensity",
          health_level: healthLevel,
          scores: { hiring_propensity: propensity, hiring_rate: hiringRate, total_offers: data.offers, total_hires: data.hires },
          factors: {},
          recommendations: propensity >= 60 ? ["High hire likelihood — prompt sponsor proactively after completion"] : [],
        };
        hiringScores.push(score);
        await supabase.from("intelligence_scores").upsert(score, { onConflict: "entity_type,entity_id,score_type" });
      }
      results.hiring_propensity = hiringScores;
    }

    // ========== STEP 6: CAPITAL VELOCITY OPTIMIZER ==========
    if (scope === "capital_velocity" || scope === "all") {
      const { data: escrows } = await supabase
        .from("escrow_transactions")
        .select("id, amount, status, created_at, updated_at, payer_id, beneficiary_id")
        .order("created_at", { ascending: false })
        .limit(500);

      const released = (escrows ?? []).filter((e: any) => e.status === "released");
      const pending = (escrows ?? []).filter((e: any) => e.status === "locked" || e.status === "pending");

      const avgReleaseTime = released.length > 0
        ? Math.round(released.reduce((sum: number, e: any) => sum + (new Date(e.updated_at).getTime() - new Date(e.created_at).getTime()) / (24 * 60 * 60 * 1000), 0) / released.length * 10) / 10
        : 0;

      const bottlenecks: string[] = [];
      const longPending = pending.filter((e: any) => (Date.now() - new Date(e.created_at).getTime()) > 14 * 24 * 60 * 60 * 1000);
      if (longPending.length > 0) bottlenecks.push(`${longPending.length} escrows pending > 14 days`);
      if (avgReleaseTime > 21) bottlenecks.push("Average release time exceeds 21 days");

      const velocityScore = {
        entity_type: "platform",
        entity_id: "00000000-0000-0000-0000-000000000000",
        score_type: "capital_velocity",
        health_level: avgReleaseTime <= 14 ? "green" : avgReleaseTime <= 28 ? "yellow" : "red",
        scores: { avg_release_days: avgReleaseTime, total_released: released.length, total_pending: pending.length, stuck_count: longPending.length },
        factors: { bottlenecks },
        recommendations: [
          ...(longPending.length > 0 ? [`Intervene: ${longPending.length} deals stuck in escrow`] : []),
          ...(avgReleaseTime > 21 ? ["Milestone approval lag detected — nudge reviewers"] : []),
        ],
      };
      await supabase.from("intelligence_scores").upsert(velocityScore, { onConflict: "entity_type,entity_id,score_type" });
      results.capital_velocity = velocityScore;
    }

    // ========== STEP 7: ANOMALY DETECTION ==========
    if (scope === "anomaly_detection" || scope === "all") {
      const anomalies: any[] = [];

      // Trust spikes: users gaining > 20 trust in 24h
      const { data: recentTrust } = await supabase
        .from("trust_events")
        .select("user_id, delta, created_at")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1000);

      const userDeltaSum: Record<string, number> = {};
      (recentTrust ?? []).forEach((e: any) => {
        userDeltaSum[e.user_id] = (userDeltaSum[e.user_id] || 0) + (e.delta || 0);
      });
      for (const [userId, delta] of Object.entries(userDeltaSum)) {
        if (delta > 20) {
          anomalies.push({
            anomaly_type: "trust_spike",
            severity: delta > 40 ? "critical" : "high",
            entity_type: "user",
            entity_id: userId,
            description: `Unusual trust gain of +${delta} in 24h`,
            evidence: { delta, period: "24h" },
          });
        }
      }

      // Escrow inconsistencies: released > locked
      const { data: escrowCheck } = await supabase
        .from("escrow_transactions")
        .select("id, amount, status, payer_id")
        .in("status", ["released", "locked"])
        .limit(1000);

      const payerLedger: Record<string, { locked: number, released: number }> = {};
      (escrowCheck ?? []).forEach((e: any) => {
        if (!payerLedger[e.payer_id]) payerLedger[e.payer_id] = { locked: 0, released: 0 };
        if (e.status === "locked") payerLedger[e.payer_id].locked += e.amount || 0;
        if (e.status === "released") payerLedger[e.payer_id].released += e.amount || 0;
      });
      for (const [payerId, ledger] of Object.entries(payerLedger)) {
        if (ledger.released > ledger.locked * 1.1) {
          anomalies.push({
            anomaly_type: "escrow_inconsistency",
            severity: "critical",
            entity_type: "user",
            entity_id: payerId,
            description: `Released (${ledger.released}) exceeds locked (${ledger.locked}) escrow`,
            evidence: ledger,
          });
        }
      }

      // Insert new anomalies
      if (anomalies.length > 0) {
        await supabase.from("intelligence_anomalies").insert(anomalies);
      }

      results.anomalies = anomalies;
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
