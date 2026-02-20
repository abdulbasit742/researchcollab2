import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Sponsor Follow-ups ───
export function useSponsorFollowUps(sponsorId?: string) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["sponsor-follow-ups", sponsorId],
    queryFn: async () => {
      let q = supabase
        .from("sponsor_follow_ups")
        .select("*")
        .order("scheduled_at", { ascending: true });
      if (sponsorId) q = q.eq("sponsor_id", sponsorId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const scheduleFollowUp = useMutation({
    mutationFn: async (params: { sponsor_id: string; scheduled_at: string; reminder_type?: string; notes?: string }) => {
      const { data, error } = await supabase.from("sponsor_follow_ups").insert(params).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsor-follow-ups"] });
      toast({ title: "Follow-up Scheduled" });
    },
  });

  const completeFollowUp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sponsor_follow_ups").update({ completed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsor-follow-ups"] });
      toast({ title: "Follow-up Completed" });
    },
  });

  const pending = (query.data ?? []).filter(f => !f.completed_at);
  const overdue = pending.filter(f => new Date(f.scheduled_at) < new Date());

  return { followUps: query.data ?? [], pending, overdue, isLoading: query.isLoading, scheduleFollowUp, completeFollowUp };
}

// ─── Sponsor Scores ───
export function useSponsorScores() {
  return useQuery({
    queryKey: ["sponsor-scores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsor_scores").select("*").order("engagement_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── Sponsor Engagement Events ───
export function useSponsorEngagement(sponsorId?: string) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["sponsor-engagement", sponsorId],
    queryFn: async () => {
      let q = supabase.from("sponsor_engagement_events").select("*").order("event_date", { ascending: false }).limit(200);
      if (sponsorId) q = q.eq("sponsor_id", sponsorId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const logEvent = useMutation({
    mutationFn: async (params: { sponsor_id: string; event_type: string; metadata?: any }) => {
      const { error } = await supabase.from("sponsor_engagement_events").insert(params);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sponsor-engagement"] });
    },
  });

  // Build heatmap data (last 90 days)
  const heatmapData = () => {
    const events = query.data ?? [];
    const map: Record<string, number> = {};
    events.forEach(e => {
      const date = e.event_date;
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  };

  return { events: query.data ?? [], isLoading: query.isLoading, logEvent, heatmapData };
}
