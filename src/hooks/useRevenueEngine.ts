import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Sponsor Pipeline ───
export function useSponsorPipeline() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["sponsor-pipeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsor_pipeline")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const addSponsor = useMutation({
    mutationFn: async (sponsor: {
      sponsor_name: string;
      contact_email?: string;
      contact_person?: string;
      organization?: string;
      stage?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("sponsor_pipeline")
        .insert(sponsor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsor-pipeline"] });
      toast({ title: "Sponsor Added", description: "Pipeline updated." });
    },
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage, ...extra }: { id: string; stage: string; [k: string]: any }) => {
      const updates: any = { stage, ...extra };
      if (stage === "meeting_scheduled") updates.meeting_date = updates.meeting_date || new Date().toISOString();
      if (stage === "proposal_sent") updates.proposal_sent_at = new Date().toISOString();
      if (stage === "onboarded") updates.onboarded_at = new Date().toISOString();
      if (stage === "funded") updates.first_deposit_at = updates.first_deposit_at || new Date().toISOString();
      
      const { error } = await supabase.from("sponsor_pipeline").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsor-pipeline"] });
      toast({ title: "Stage Updated" });
    },
  });

  const pipelineStats = () => {
    const items = query.data ?? [];
    const stages = ["contacted", "meeting_scheduled", "proposal_sent", "onboarded", "funded", "repeat_funder", "churned"];
    const counts = Object.fromEntries(stages.map(s => [s, items.filter(i => i.stage === s).length]));
    const totalFunded = items.filter(i => i.stage === "funded" || i.stage === "repeat_funder")
      .reduce((s, i) => s + Number(i.total_funded || 0), 0);
    const avgSize = items.filter(i => Number(i.avg_funding_size) > 0);
    const avgFundingSize = avgSize.length > 0
      ? avgSize.reduce((s, i) => s + Number(i.avg_funding_size), 0) / avgSize.length
      : 0;
    const repeatRate = items.length > 0
      ? (items.filter(i => i.stage === "repeat_funder").length / Math.max(1, items.filter(i => ["funded", "repeat_funder"].includes(i.stage)).length)) * 100
      : 0;

    // Time to first deposit
    const fundedWithDeposit = items.filter(i => i.first_deposit_at && i.created_at);
    const avgTimeToDeposit = fundedWithDeposit.length > 0
      ? fundedWithDeposit.reduce((s, i) => {
          const diff = new Date(i.first_deposit_at!).getTime() - new Date(i.created_at).getTime();
          return s + diff / (1000 * 60 * 60 * 24);
        }, 0) / fundedWithDeposit.length
      : 0;

    return { counts, totalFunded, avgFundingSize, repeatRate, avgTimeToDeposit, total: items.length };
  };

  return { sponsors: query.data ?? [], isLoading: query.isLoading, addSponsor, updateStage, pipelineStats };
}

// ─── Sponsor ROI ───
export function useSponsorROI(sponsorId?: string) {
  return useQuery({
    queryKey: ["sponsor-roi", sponsorId],
    enabled: !!sponsorId,
    queryFn: async () => {
      // Get sponsorships
      const { data: sponsorships } = await supabase
        .from("fyp_sponsorships")
        .select("*")
        .eq("sponsor_id", sponsorId!);

      // Get hiring conversions
      const { data: hirings } = await supabase
        .from("hiring_conversions")
        .select("*")
        .eq("sponsor_id", sponsorId!);

      const totalDeployed = (sponsorships ?? []).reduce((s, sp) => s + Number(sp.funded_amount || 0), 0);
      const completedProjects = (sponsorships ?? []).filter(s => s.status === "completed").length;
      const totalProjects = (sponsorships ?? []).length;
      const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
      const offersM = (hirings ?? []).filter(h => h.offer_made).length;
      const hiredCount = (hirings ?? []).filter(h => h.hired).length;
      const hiringConversion = offersM > 0 ? (hiredCount / offersM) * 100 : completedProjects > 0 ? (hiredCount / completedProjects) * 100 : 0;

      return {
        totalDeployed,
        completedProjects,
        totalProjects,
        completionRate,
        offersM,
        hiredCount,
        hiringConversion,
        sponsorships: sponsorships ?? [],
        hirings: hirings ?? [],
      };
    },
  });
}

// ─── Capital Flow Metrics ───
export function useCapitalFlowMetrics() {
  return useQuery({
    queryKey: ["capital-flow-snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_flow_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── Hiring Conversions ───
export function useHiringConversions() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["hiring-conversions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hiring_conversions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const promptHiring = useMutation({
    mutationFn: async (params: {
      sponsor_id: string;
      student_id: string;
      fyp_id?: string;
      deal_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("hiring_conversions")
        .insert(params)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hiring-conversions"] });
      toast({ title: "Hiring Prompt Created" });
    },
  });

  const updateHiring = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [k: string]: any }) => {
      const { error } = await supabase.from("hiring_conversions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hiring-conversions"] });
      toast({ title: "Hiring Record Updated" });
    },
  });

  const stats = () => {
    const items = query.data ?? [];
    const totalOffers = items.filter(h => h.offer_made).length;
    const totalHired = items.filter(h => h.hired).length;
    const conversionRate = totalOffers > 0 ? (totalHired / totalOffers) * 100 : 0;
    const avgRetention = items.filter(h => h.retention_months).reduce((s, h) => s + (h.retention_months || 0), 0) / Math.max(1, items.filter(h => h.retention_months).length);
    return { totalOffers, totalHired, conversionRate, avgRetention, total: items.length };
  };

  return { hirings: query.data ?? [], isLoading: query.isLoading, promptHiring, updateHiring, stats };
}

// ─── Re-funding Recommendations ───
export function useRefundingRecommendations() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["refunding-recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refunding_recommendations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createRecommendation = useMutation({
    mutationFn: async (rec: {
      sponsor_id: string;
      recommended_fyp_id?: string;
      recommended_fyp_title?: string;
      reason?: string;
      match_score?: number;
    }) => {
      const { data, error } = await supabase
        .from("refunding_recommendations")
        .insert(rec)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["refunding-recommendations"] });
      toast({ title: "Recommendation Created" });
    },
  });

  return { recommendations: query.data ?? [], isLoading: query.isLoading, createRecommendation };
}
