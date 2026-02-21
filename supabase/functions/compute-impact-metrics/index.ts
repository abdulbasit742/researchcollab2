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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { institution_id, sponsor_id } = await req.json().catch(() => ({}));

    // 1. Time to Funding — avg days from topic creation to first sponsorship
    const { data: sponsorships } = await supabase
      .from("fyp_sponsorships")
      .select("created_at, topic_id, pledge_amount, funded_amount, status, sponsor_id");

    const { data: topics } = await supabase
      .from("fyp_topics")
      .select("id, created_at");

    const topicMap = new Map((topics ?? []).map((t: any) => [t.id, t.created_at]));
    const fundingDelays = (sponsorships ?? [])
      .filter((s: any) => s.topic_id && topicMap.has(s.topic_id))
      .map((s: any) => {
        const topicDate = new Date(topicMap.get(s.topic_id)!).getTime();
        const sponsorDate = new Date(s.created_at).getTime();
        return (sponsorDate - topicDate) / (1000 * 60 * 60 * 24);
      })
      .filter((d: number) => d >= 0);
    const timeToFundingDays = fundingDelays.length > 0
      ? fundingDelays.reduce((a: number, b: number) => a + b, 0) / fundingDelays.length
      : 0;

    // 2. Milestone Success Rate
    const { data: tracks } = await supabase
      .from("fyp_execution_tracks")
      .select("id, milestone_title, status, released_amount, created_at, updated_at");

    const totalMilestones = (tracks ?? []).length;
    const approvedMilestones = (tracks ?? []).filter((t: any) => t.status === "approved").length;
    const milestoneSuccessRate = totalMilestones > 0 ? (approvedMilestones / totalMilestones) * 100 : 0;

    // 3. Time to Completion — avg days between first and last approved milestone per group
    const completionDelays: number[] = [];
    // Group tracks by topic/project would need topic_id; approximate with timestamps
    const approvedTracks = (tracks ?? []).filter((t: any) => t.status === "approved" && t.created_at && t.updated_at);
    if (approvedTracks.length > 1) {
      const sorted = approvedTracks.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const first = new Date(sorted[0].created_at).getTime();
      const last = new Date(sorted[sorted.length - 1].updated_at).getTime();
      completionDelays.push((last - first) / (1000 * 60 * 60 * 24));
    }
    const timeToCompletionDays = completionDelays.length > 0
      ? completionDelays.reduce((a, b) => a + b, 0) / completionDelays.length
      : 0;

    // 4. Escrow Accuracy Rate
    const { data: escrows } = await supabase
      .from("escrow_transactions")
      .select("id, status, amount");

    const totalEscrow = (escrows ?? []).length;
    const releasedEscrow = (escrows ?? []).filter((e: any) => e.status === "released").length;
    const escrowAccuracyRate = totalEscrow > 0 ? (releasedEscrow / totalEscrow) * 100 : 0;
    const totalEscrowVolume = (escrows ?? [])
      .filter((e: any) => e.status === "released")
      .reduce((s: number, e: any) => s + Number(e.amount || 0), 0);

    // 5. Student Completion Rate
    const { data: impactMetrics } = await supabase
      .from("fyp_impact_metrics")
      .select("on_time_pct, milestones_completed, funded_projects, total_earnings");

    const onTimePcts = (impactMetrics ?? []).filter((m: any) => m.on_time_pct != null).map((m: any) => Number(m.on_time_pct));
    const studentCompletionRate = onTimePcts.length > 0
      ? onTimePcts.reduce((a: number, b: number) => a + b, 0) / onTimePcts.length
      : 0;

    // 6. Hiring Conversion Rate
    const { data: hirings } = await supabase
      .from("hiring_conversions")
      .select("id, offer_made, hired, salary_band, role_title, retention_months");

    const totalOffers = (hirings ?? []).filter((h: any) => h.offer_made).length;
    const totalHired = (hirings ?? []).filter((h: any) => h.hired).length;
    const hiringConversionRate = totalOffers > 0 ? (totalHired / totalOffers) * 100 : 0;

    // 7. Trust Score Delta
    const { data: trustEvents } = await supabase
      .from("trust_events")
      .select("delta, reason")
      .limit(500);

    const deltas = (trustEvents ?? []).map((t: any) => Number(t.delta || 0)).filter((d: number) => !isNaN(d));
    const trustDeltaAvg = deltas.length > 0 ? deltas.reduce((a: number, b: number) => a + b, 0) / deltas.length : 0;

    // 8. Sponsor Satisfaction Score — derived from repeat rate + low dispute rate
    const { data: pipeline } = await supabase
      .from("sponsor_pipeline")
      .select("id, stage, first_deposit_at, avg_funding_size");

    const fundedSponsors = (pipeline ?? []).filter((p: any) => ["funded", "repeat_funder"].includes(p.stage));
    const repeatSponsors = (pipeline ?? []).filter((p: any) => p.stage === "repeat_funder");
    const repeatSponsorRate = fundedSponsors.length > 0
      ? (repeatSponsors.length / fundedSponsors.length) * 100
      : 0;

    // Dispute rate from escrow
    const disputedEscrow = (escrows ?? []).filter((e: any) => e.status === "disputed").length;
    const disputeRate = totalEscrow > 0 ? (disputedEscrow / totalEscrow) * 100 : 0;
    const sponsorSatisfactionScore = Math.min(100, (repeatSponsorRate * 0.6) + ((100 - disputeRate) * 0.4));

    // 9. Total funded FYPs
    const totalFundedFyps = (sponsorships ?? []).filter((s: any) => Number(s.funded_amount) > 0).length;

    // 10. Platform Impact Index
    const normalizedEscrowVol = Math.min(100, (totalEscrowVolume / 5000000) * 100); // normalize to 5M PKR cap
    const platformImpactIndex =
      (normalizedEscrowVol * 0.25) +
      (milestoneSuccessRate * 0.25) +
      (hiringConversionRate * 0.20) +
      (repeatSponsorRate * 0.15) +
      (Math.min(100, studentCompletionRate) * 0.15);

    const metrics = {
      time_to_funding_days: Math.round(timeToFundingDays * 10) / 10,
      time_to_completion_days: Math.round(timeToCompletionDays * 10) / 10,
      milestone_success_rate: Math.round(milestoneSuccessRate * 10) / 10,
      escrow_accuracy_rate: Math.round(escrowAccuracyRate * 10) / 10,
      sponsor_satisfaction_score: Math.round(sponsorSatisfactionScore * 10) / 10,
      student_completion_rate: Math.round(studentCompletionRate * 10) / 10,
      trust_delta_avg: Math.round(trustDeltaAvg * 100) / 100,
      hiring_conversion_rate: Math.round(hiringConversionRate * 10) / 10,
      startup_count: 0,
      repeat_sponsor_rate: Math.round(repeatSponsorRate * 10) / 10,
      platform_impact_index: Math.round(platformImpactIndex * 10) / 10,
      total_escrow_volume: totalEscrowVolume,
      total_funded_fyps: totalFundedFyps,
      total_hires: totalHired,
    };

    // Upsert into proof_of_value_snapshots
    const { error: upsertError } = await supabase
      .from("proof_of_value_snapshots")
      .upsert({
        institution_id: institution_id || null,
        sponsor_id: sponsor_id || null,
        snapshot_date: new Date().toISOString().split("T")[0],
        ...metrics,
        computed_at: new Date().toISOString(),
      }, { onConflict: "institution_id,sponsor_id,snapshot_date" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
    }

    return new Response(JSON.stringify({ success: true, metrics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
